goog.provide('tpo.layout.TextLayout');

goog.require('tpo.layout.TextBlock');
goog.require('tpo.layout.BreakPoint');

goog.require('tpo.util.debug');
goog.require('tpo.util.LinkedList');
goog.require('tpo.util.LinkedListNode');

/**
 * @constructor
 */
tpo.layout.TextLayout = function() {

    this.tolerances = [2, 4, 6, 12, 24];

    // FIXME
    this.widths = [600];
};

goog.scope(function() {
    var List = tpo.util.LinkedList,
        Node = tpo.util.LinkedListNode,
        BreakPoint = tpo.layout.BreakPoint,
        TextLayout = tpo.layout.TextLayout,
        TextBlock = tpo.layout.TextBlock,
        debug = tpo.util.debug;

    /**
     * @private
     * @typedef {{breakPoint: !tpo.layout.BreakPoint, ratio: number, demerits: number}}
     */
    TextLayout.Candidate;

    /**
     * @param {tpo.layout.TextBlock} container
     */
    TextLayout.prototype.layout = function(container) {
        var breaks = [];

        for (var i = 0; i < this.tolerances.length; i += 1) {
            breaks = this.tryLayout(container, this.tolerances[i]);
            if (breaks.length) {
                break;
            }
        }

        if (breaks.length) {
            var y = 0,
                x = 0;

            for (var i = 0, lineIndex = 0; i < container.size; i += 1) {
                if (i > breaks[lineIndex][0]) {
                    // After a line break, we skip any nodes unless they are boxes or forced breaks.
                    for (var j = i; j < container.size; j += 1) {
                        var type = container.getType(j);

                        if ((type === TextBlock.Types.BOX || type === TextBlock.Types.ELEMENT) || (type === TextBlock.Types.PENALTY && container.getPenalty(j) === -10000)) {
                            i = j;
                            break;
                        }
                        container.setX(j, -1);
                        container.setY(j, -1);
                    }
                    lineIndex += 1;
                    x = 0;
                    // FIXME
                    y += 20;
                }

                var type = container.getType(i);

                if (type === TextBlock.Types.BOX) {
                    container.setX(i, x);
                    container.setY(i, y);
                    x += container.getWidth(i);
                } else if (type === TextBlock.Types.PENALTY && container.getPenalty(i) === 100 && i === breaks[lineIndex][0]) {
                    container.setX(i, x);
                    container.setY(i, y);
                    x += container.getWidth(i);
                } else if (type === TextBlock.Types.GLUE) {
                    container.setX(i, -1);
                    container.setY(i, -1);
                    x += container.getWidth(i) + breaks[lineIndex][1] * (breaks[lineIndex][1] < 0 ? container.getShrink(i) : container.getStretch(i));
                } else if (type === TextBlock.Types.ELEMENT) {
                    container.setX(i, x);
                    container.setY(i, y);
                    x += container.getWidth(i);
                }
            }
        } else {
            debug.error('Could not set TextBlock', container);
        }
    };


    /**
     * @private
     * @param {number} lineIndex
     * @return {number}
     */
    TextLayout.prototype.getLineWidth = function(lineIndex) {
        // If the current line index is within the list of linelengths, use it, otherwise use
        // the last line length of the list.
        return lineIndex < this.widths.length ? this.widths[lineIndex - 1] : this.widths[this.widths.length - 1];
    };

    /**
     * @private
     * @param {!tpo.layout.TextBlock} container
     * @param {number} index
     * @param {!tpo.layout.BreakPoint} breakPoint
     * @param {!tpo.layout.RunningTotal} runningTotal
     * @param {number} lineIndex
     */
    TextLayout.prototype.computeRatio = function(container, index, breakPoint, runningTotal, lineIndex) {
        var width = runningTotal.width - breakPoint.totals.width,
            lineWidth = this.getLineWidth(lineIndex);

        if (container.getType(index) === TextBlock.Types.PENALTY) {
            width += container.getWidth(index);
        }

        if (width < lineWidth) {
            // Calculate the stretch ratio
            var stretch = runningTotal.stretch - breakPoint.totals.stretch;

            if (stretch > 0) {
                return (lineWidth - width) / stretch;
            } else {
                return 10000;
            }
        } else if (width > lineWidth) {
            // Calculate the shrink ratio
            var shrink = runningTotal.shrink - breakPoint.totals.shrink;

            if (shrink > 0) {
                return (lineWidth - width) / shrink;
            } else {
                return 10000;
            }
        } else {
            // perfect match
            return 0;
        }
    };

    /**
     * @private
     * @param {!tpo.layout.TextBlock} container
     * @param {number} index
     * @param {!tpo.util.LinkedList} activeNodes
     * @param {!tpo.layout.RunningTotal} runningTotal
     * @param {number} tolerance
     */
    TextLayout.prototype.findBreaks = function(container, index, activeNodes, runningTotal, tolerance) {
        var activeNode = activeNodes.first();

        // The inner loop iterates through all the active nodes with line < currentLine and then
        // breaks out to insert the new active node candidates before looking at the next active
        // nodes for the next lines. The result of this is that the active node list is always
        // sorted by line number.
        while(activeNode) {
            /**
             * Initial candidate breakpoints for the four classes
             * @type {Array.<TextLayout.Candidate>}
             */
            var candidates = [
                { breakPoint: null, demerits: Infinity, ratio: 0 },
                { breakPoint: null, demerits: Infinity, ratio: 0 },
                { breakPoint: null, demerits: Infinity, ratio: 0 },
                { breakPoint: null, demerits: Infinity, ratio: 0 }
            ];

            while(activeNode) {
                var nextActiveBreakPoint = activeNode.next,
                    lineIndex = activeNode.value.line + 1,
                    ratio = this.computeRatio(container, index, /** @type {!tpo.layout.BreakPoint} */ (activeNode.value), runningTotal, lineIndex),
                    type = container.getType(index);

                // Deactive nodes when the the distance between the current active node and the
                // current node becomes too large (i.e. it exceeds the stretch limit and the stretch
                // ratio becomes negative) or when the current node is a forced break (i.e. the end
                // of the paragraph when we want to remove all active nodes, but possibly have a final
                // candidate active node---if the paragraph can be set using the given tolerance value.)
                if (ratio < -1 || (container.getType(index) === TextBlock.Types.PENALTY && container.getPenalty(index) === -10000)) {
                    activeNodes.remove(activeNode);
                }

                if (-1 <= ratio && ratio <= tolerance) {
                    // If the ratio is within the valid range of -1 <= ratio <= tolerance calculate the
                    // total demerits and record a candidate active node.
                    var badness = 100 * Math.pow(Math.abs(ratio), 3),
                        currentClass = 0,
                        demerits = 0;

                    // Positive penalty
                    if (container.getType(index) === TextBlock.Types.PENALTY && container.getPenalty(index) >= 0) {
                        demerits = Math.pow(10 + badness + container.getPenalty(index), 2);
                    // Negative penalty but not a forced break
                    } else if (container.getType(index) === TextBlock.Types.PENALTY && container.getPenalty(index) !== -10000) {
                        demerits = Math.pow(10 + badness - container.getPenalty(index), 2);
                    // All other cases
                    } else {
                        demerits = Math.pow(10 + badness, 2);
                    }

                    if (container.getType(index) === TextBlock.Types.PENALTY && container.getType(activeNode.value.position) === TextBlock.Types.PENALTY) {
                        demerits += 100 * container.getFlagged(index) * container.getFlagged(activeNode.value.position);
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
                        demerits += 3000;
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

                activeNode = nextActiveBreakPoint;

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
                width: runningTotal.width,
                stretch: runningTotal.stretch,
                shrink: runningTotal.shrink
            };

            // Add width, stretch and shrink values from the current
            // break point up to the next box or forced penalty.
            for (var j = index; j < container.size; j += 1) {
                var type = container.getType(j);

                if (type === TextBlock.Types.GLUE) {
                    sum.width += container.getWidth(j);
                    sum.stretch += container.getStretch(j);
                    sum.shrink += container.getShrink(j);
                } else if ((type === TextBlock.Types.BOX || type === TextBlock.Types.ELEMENT) || (type === TextBlock.Types.PENALTY && container.getPenalty(j) === -10000 && j > index)) {
                    break;
                }
            }

            for (var fitnessClass = 0; fitnessClass < candidates.length; fitnessClass += 1) {
                var candidate = candidates[fitnessClass];

                if (candidate.demerits < Infinity) {
                    var newNode = new Node(
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
                        activeNodes.insertBefore(activeNode, newNode);
                    } else {
                        activeNodes.push(newNode);
                    }
                }
            }
        }
    };

    /**
     * @private
     * @param {tpo.layout.TextBlock} container
     * @param {number} tolerance
     */
    TextLayout.prototype.tryLayout = function(container, tolerance) {
        var runningTotal = {
                width: 0,
                stretch: 0,
                shrink: 0
            },
            result = [],
            activeNodes = new List();

        activeNodes.push(
            new Node(
                new BreakPoint(0, 0, 0, 0, 0, { width: 0, stretch: 0, shrink: 0}, null)
            )
        );

        for (var i = 0; i < container.size; i += 1) {
            var type = container.getType(i);

            if (type === TextBlock.Types.BOX || type === TextBlock.Types.ELEMENT) {
                runningTotal.width += container.getWidth(i);
            } else if (type === TextBlock.Types.GLUE) {
                if (i > 0 && (container.getType(i - 1) === TextBlock.Types.BOX || container.getType(i - 1) === TextBlock.Types.ELEMENT)) {
                    this.findBreaks(container, i, activeNodes, runningTotal, tolerance);
                }
                runningTotal.width += container.getWidth(i);
                runningTotal.stretch += container.getStretch(i);
                runningTotal.shrink += container.getShrink(i);
            } else if (type === TextBlock.Types.PENALTY && container.getPenalty(i) !== 10000) {
                this.findBreaks(container, i, activeNodes, runningTotal, tolerance);
            }
        }

        if (activeNodes.getSize()) {
            // Find the best active node (the one with the least total demerits.)
            var listNode = activeNodes.first(),
                lowestDemerits = Infinity,
                bestBreakPoint = null,
                positions = [];

            while (listNode) {
                if (listNode.value.demerits < lowestDemerits) {
                    lowestDemerits = listNode.value.demerits;
                    bestBreakPoint = listNode.value;
                }
                listNode = listNode.next;
            }

            while (bestBreakPoint.previous !== null) {
                result.push([bestBreakPoint.position, bestBreakPoint.ratio, this.getLineWidth(bestBreakPoint.line)]);
                bestBreakPoint = bestBreakPoint.previous;
            }
            result.reverse();
        }
        return result;
    };
});
