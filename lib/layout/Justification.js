goog.provide('tpo.layout.Justification');

goog.require('tpo.layout.Box');
goog.require('tpo.layout.BreakPoint');
goog.require('tpo.layout.InlineElement');
goog.require('tpo.layout.Glue');
goog.require('tpo.layout.Line');
goog.require('tpo.layout.Penalty');
goog.require('tpo.util.debug');
goog.require('tpo.util.LinkedList');
goog.require('tpo.util.LinkedListNode');

/**
 * @param {Array.<tpo.layout.Glue|tpo.layout.Box|tpo.layout.Penalty|tpo.layout.InlineElement>} nodes
 * @param {Array.<number>} widths
 * @constructor
 */
tpo.layout.Justification = function(nodes, widths) {
    /**
     * @type {Array.<tpo.layout.Glue|tpo.layout.Box|tpo.layout.Penalty|tpo.layout.InlineElement>}
     */
    this.nodes = nodes;

    /**
     * @type {Array.<number>}
     */
    this.widths = widths;

    /**
     * @type {!tpo.util.LinkedList}
     */
    this.activeNodes = new tpo.util.LinkedList();

    /**
     * @type {!tpo.layout.RunningTotal}
     */
    this.runningTotal = {
        width: 0,
        stretch: 0,
        shrink: 0
    };
};

goog.scope(function() {
    var Justification = tpo.layout.Justification,
        BreakPoint = tpo.layout.BreakPoint,
        Line = tpo.layout.Line,
        debug = tpo.util.debug,
        List = tpo.util.LinkedList,
        ListNode = tpo.util.LinkedListNode;

    /**
     * @typedef {{breakPoint: !tpo.layout.BreakPoint, ratio: number, demerits: number}}
     */
    Justification.Candidate;

    /**
     * @type {number}
     * @const
     */
    Justification.INFINITY = 10000;

    /**
     * @enum {number}
     */
    Justification.Demerits = {
        LINE: 10,
        FLAGGED: 100,
        FITNESS: 3000,
        HYPHEN: 100
    };

    /**
     * @param {number} lineIndex
     * @return {number}
     */
    Justification.prototype.getLineWidth = function(lineIndex) {
        // If the current line index is within the list of linelengths, use it, otherwise use
        // the last line length of the list.
        return lineIndex < this.widths.length ? this.widths[lineIndex - 1] : this.widths[this.widths.length - 1];
    };

    /**
     * @param {!tpo.layout.BreakPoint} breakPoint
     * @param {number} index
     * @param {number} lineIndex
     */
    Justification.prototype.computeRatio = function(breakPoint, index, lineIndex) {
        var width = this.runningTotal.width - breakPoint.totals.width,
            lineWidth = this.getLineWidth(lineIndex);

        if (this.nodes[index].isPenalty) {
            width += this.nodes[index].width;
        }

        if (width < lineWidth) {
            // Calculate the stretch ratio
            var stretch = this.runningTotal.stretch - breakPoint.totals.stretch;

            if (stretch > 0) {
                return (lineWidth - width) / stretch;
            } else {
                return Justification.INFINITY;
            }
        } else if (width > lineWidth) {
            // Calculate the shrink ratio
            var shrink = this.runningTotal.shrink - breakPoint.totals.shrink;

            if (shrink > 0) {
                return (lineWidth - width) / shrink;
            } else {
                return Justification.INFINITY;
            }
        } else {
            // perfect match
            return 0;
        }
    };


    /**
     * @private
     * @param {tpo.layout.Box|tpo.layout.Glue|tpo.layout.Penalty|tpo.layout.InlineElement} node
     * @param {number} index
     * @param {number} tolerance
     */
    Justification.prototype.findBreaks = function(node, index, tolerance) {
        var activeNode = this.activeNodes.first();

        // The inner loop iterates through all the active nodes with line < currentLine and then
        // breaks out to insert the new active node candidates before looking at the next active
        // nodes for the next lines. The result of this is that the active node list is always
        // sorted by line number.
        while(activeNode) {
            /**
             * Initial candidate breakpoints for the four classes
             * @type {Array.<Justification.Candidate>}
             */
            var candidates = [
                { breakPoint: null, demerits: Infinity, ratio: 0},
                { breakPoint: null, demerits: Infinity, ratio: 0},
                { breakPoint: null, demerits: Infinity, ratio: 0},
                { breakPoint: null, demerits: Infinity, ratio: 0},
            ];

            while(activeNode) {
                var nextActiveNode = activeNode.next,
                    lineIndex = activeNode.value.line + 1,
                    ratio = this.computeRatio(/** @type {!tpo.layout.BreakPoint} */ (activeNode.value), index, lineIndex);

                // Deactive nodes when the the distance between the current active node and the
                // current node becomes too large (i.e. it exceeds the stretch limit and the stretch
                // ratio becomes negative) or when the current node is a forced break (i.e. the end
                // of the paragraph when we want to remove all active nodes, but possibly have a final
                // candidate active node---if the paragraph can be set using the given tolerance value.)
                if (ratio < -1 || (node.isPenalty && node.penalty === -Justification.INFINITY)) {
                    this.activeNodes.remove(activeNode);
                }

                if (-1 <= ratio && ratio <= tolerance) {
                    // If the ratio is within the valid range of -1 <= ratio <= tolerance calculate the
                    // total demerits and record a candidate active node.
                    var badness = 100 * Math.pow(Math.abs(ratio), 3),
                        currentClass = 0,
                        demerits = 0;

                    // Positive penalty
                    if (node.isPenalty && node.penalty >= 0) {
                        demerits = Math.pow(Justification.Demerits.LINE + badness + node.penalty, 2);
                    // Negative penalty but not a forced break
                    } else if (node.isPenalty && node.penalty !== -Justification.INFINITY) {
                        demerits = Math.pow(Justification.Demerits.LINE + badness - node.penalty, 2);
                    // All other cases
                    } else {
                        demerits = Math.pow(Justification.Demerits.LINE + badness, 2);
                    }

                    if (node.isPenalty && this.nodes[activeNode.value.position].isPenalty) {
                        demerits += Justification.Demerits.FLAGGED * node.flagged * this.nodes[activeNode.value.position].flagged;
                    }

                    // Calculate the fitness class for this candidate active node.
                    if (ratio < -0.5) {
                        currentClass = 0;
                    } else if (ratio <= 0.5) {
                        currentClass = 1;
                    } else if (ratio <= 1) {
                        currentClass = 2;
                    } else {
                        currentClass = 3;
                    }

                    // Add a fitness penalty to the demerits if the fitness classes of two adjacent lines
                    // differ too much.
                    if (Math.abs(currentClass - activeNode.value.fitness) > 1) {
                        demerits += Justification.Demerits.FITNESS;
                    }

                    // Add the total demerits of the active node to get the total demerits of this candidate node.
                    demerits += activeNode.value.demerits;

                    // Only store the best candidate for each fitness class
                    if (demerits < candidates[currentClass].demerits) {
                        candidates[currentClass].breakPoint = /** @type {!tpo.layout.BreakPoint} */ (activeNode.value);
                        candidates[currentClass].ratio = ratio;
                        candidates[currentClass].demerits = demerits;
                    }
                }

                activeNode = nextActiveNode;

                // Stop iterating through active nodes to insert new candidate active nodes in the active list
                // before moving on to the active nodes for the next line.
                // TODO: The Knuth and Plass paper suggests a conditional for currentLine < j0. This means paragraphs
                // with identical line lengths will not be sorted by line number. Find out if that is a desirable outcome.
                // For now I left this out, as it only adds minimal overhead to the algorithm and keeping the active node
                // list sorted has a higher priority.
                if (activeNode !== null && activeNode.value.line >= lineIndex) {
                    break;
                }
            }

            var sum = {
                width: this.runningTotal.width,
                stretch: this.runningTotal.stretch,
                shrink: this.runningTotal.shrink
            };

            // Add width, stretch and shrink values from the current
            // break point up to the next box or forced penalty.
            for (var j = index; j < this.nodes.length; j += 1) {
                if (this.nodes[j].isGlue) {
                    sum.width += this.nodes[j].width;
                    sum.stretch += this.nodes[j].stretch;
                    sum.shrink += this.nodes[j].shrink;
                } else if ((this.nodes[j].isBox || this.nodes[j].isElement) || (this.nodes[j].isPenalty && this.nodes[j].penalty === -Justification.INFINITY && j > index)) {
                    break;
                }
            }

            for (var fitnessClass = 0; fitnessClass < candidates.length; fitnessClass += 1) {
                var candidate = candidates[fitnessClass];

                if (candidate.demerits < Infinity) {
                    var newNode = new ListNode(
                            new BreakPoint(
                                index,
                                candidate.demerits,
                                candidate.ratio,
                                candidate.breakPoint.line + 1,
                                fitnessClass,
                                sum,
                                candidate.breakPoint
                            )
                        );

                    if (activeNode !== null) {
                        this.activeNodes.insertBefore(activeNode, newNode);
                    } else {
                        this.activeNodes.push(newNode);
                    }
                }
            }
        }
    };

    /**
     * @param {number} tolerance
     * @return {Array.<tpo.layout.Line>}
     */
    Justification.prototype.makeLines = function(tolerance) {
        var that = this,
            best = Infinity,
            breakPoint = null,
            positions = [],
            result = [];

        that.activeNodes.push(
            new ListNode(
                new BreakPoint(0, 0, 0, 0, 0, { width: 0, stretch: 0, shrink: 0}, null)
            )
        );

        that.nodes.forEach(function(node, index) {
            if (node.isBox || node.isElement) {
                that.runningTotal.width += node.width;
            } else if (node.isGlue) {
                if (index > 0 && (that.nodes[index - 1].isBox || that.nodes[index - 1].isElement)) {
                    that.findBreaks(node, index, tolerance);
                }
                that.runningTotal.width += node.width;
                that.runningTotal.stretch += node.stretch;
                that.runningTotal.shrink += node.shrink;
            } else if (node.isPenalty && node.penalty !== Justification.INFINITY) {
                that.findBreaks(node, index, tolerance);
            }
        });

        if (that.activeNodes.getSize() !== 0) {
            // Find the best active node (the one with the least total demerits.)
            that.activeNodes.forEach(function(node) {
                if (node.value.demerits < best) {
                    breakPoint = node.value;
                    best = breakPoint.demerits;
                }
            });

            while (breakPoint.previous !== null) {
                positions.push([breakPoint.position, breakPoint.ratio, this.getLineWidth(breakPoint.line)]);
                breakPoint = breakPoint.previous;
            }

            positions.reverse();

            var lineStart = 0;

            for (var i = 0; i < positions.length; i += 1) {
                var point = positions[i][0],
                    ratio = positions[i][1],
                    width = positions[i][2];

                for (var j = lineStart; j < that.nodes.length; j += 1) {
                    // After a line break, we skip any nodes unless they are boxes or forced breaks.
                    if ((that.nodes[j].isBox || that.nodes[j].isElement) || (that.nodes[j].isPenalty && that.nodes[j].penalty === -Justification.INFINITY)) {
                      lineStart = j;
                      break;
                    }
                }

                result.push(new Line(that.nodes.slice(lineStart, point + 1), ratio, width));
                lineStart = point;
            }
        }
        return result;
    };
});
