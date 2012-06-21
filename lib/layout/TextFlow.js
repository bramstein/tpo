goog.provide('tpo.layout.TextFlow');

goog.require('tpo.layout.TextRun');
goog.require('tpo.layout.BreakPoint');

goog.require('tpo.util.debug');
goog.require('tpo.util.LinkedList');
goog.require('tpo.util.LinkedListNode');

/**
 * Flows a TextRun into one or more TextBlocks
 *
 * @constructor
 */
tpo.layout.TextFlow = function() {
    /**
     * @type {Array.<number>}
     */
    this.tolerances = [2, 4, 6, 12, 24];
};

goog.scope(function() {
    var List = tpo.util.LinkedList,
        Node = tpo.util.LinkedListNode,
        BreakPoint = tpo.layout.BreakPoint,
        TextFlow = tpo.layout.TextFlow,
        TextRun = tpo.layout.TextRun,
        debug = tpo.util.debug;

    /**
     * @private
     * @typedef {{breakPoint: !tpo.layout.BreakPoint, ratio: number, demerits: number}}
     */
    TextFlow.Candidate;

    /**
     * @param {tpo.layout.TextRun} text
     */
    TextFlow.prototype.layout = function(text) {
        var breaks = [];

        for (var i = 0; i < this.tolerances.length; i += 1) {
            breaks = this.tryLayout(text, this.tolerances[i]);
            if (breaks.length) {
                break;
            }
        }

        if (breaks.length) {
            var x = 0;

            for (var i = 0, blockIndex = 0; i < text.size; i += 1) {
                if (i > breaks[blockIndex][0]) {
                    // After a block break, we skip any nodes unless they are boxes or forced breaks.
                    for (var j = i; j < text.size; j += 1) {
                        var type = text.getType(j);

                        if ((type === TextRun.NodeType.BOX || type === TextRun.NodeType.ELEMENT) || (type === TextRun.NodeType.PENALTY && text.getPenalty(j) === -10000)) {
                            i = j;
                            break;
                        }
                        text.setX(j, -1);
                        text.setY(j, -1);
                    }
                    blockIndex += 1;
                    x = 0;
                }

                var type = text.getType(i);

                if (type === TextRun.NodeType.BOX) {
                    text.setX(i, x);
                    x += text.getWidth(i);
                } else if (type === TextRun.NodeType.PENALTY && text.getPenalty(i) === 100 && i === breaks[blockIndex][0]) {
                    text.setX(i, x);
                    x += text.getWidth(i);
                } else if (type === TextRun.NodeType.GLUE) {
                    text.setX(i, -1);
                    x += text.getWidth(i) + breaks[blockIndex][1] * (breaks[blockIndex][1] < 0 ? text.getShrink(i) : text.getStretch(i));
                } else if (type === TextRun.NodeType.ELEMENT) {
                    text.setX(i, x);
                    x += text.getWidth(i);
                }
            }
        } else {
            debug.error('Could not set TextRun', text);
        }
    };


    /**
     * @private
     * @param {!tpo.layout.TextRun} text
     * @param {number} blockIndex
     * @return {number}
     */
    TextFlow.prototype.getBlockWidth = function(text, blockIndex) {
        // If the current block index is within the list of widths, use it, otherwise use
        // the last width of the list.
        return blockIndex < text.widths.length ? text.widths[blockIndex - 1] : text.widths[text.widths.length - 1];
    };

    /**
     * @private
     * @param {!tpo.layout.TextRun} text
     * @param {number} index
     * @param {!tpo.layout.BreakPoint} breakPoint
     * @param {!tpo.layout.RunningTotal} runningTotal
     * @param {number} blockIndex
     */
    TextFlow.prototype.computeRatio = function(text, index, breakPoint, runningTotal, blockIndex) {
        var width = runningTotal.width - breakPoint.totals.width,
            lineWidth = this.getBlockWidth(text, blockIndex);

        if (text.getType(index) === TextRun.NodeType.PENALTY) {
            width += text.getWidth(index);
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
     * @param {!tpo.layout.TextRun} text
     * @param {number} index
     * @param {!tpo.util.LinkedList} activeNodes
     * @param {!tpo.layout.RunningTotal} runningTotal
     * @param {number} tolerance
     */
    TextFlow.prototype.findBreaks = function(text, index, activeNodes, runningTotal, tolerance) {
        var activeNode = activeNodes.first();

        // The inner loop iterates through all the active nodes with line < currentLine and then
        // breaks out to insert the new active node candidates before looking at the next active
        // nodes for the next lines. The result of this is that the active node list is always
        // sorted by line number.
        while(activeNode) {
            /**
             * Initial candidate breakpoints for the four classes
             * @type {Array.<TextFlow.Candidate>}
             */
            var candidates = [
                { breakPoint: null, demerits: Infinity, ratio: 0 },
                { breakPoint: null, demerits: Infinity, ratio: 0 },
                { breakPoint: null, demerits: Infinity, ratio: 0 },
                { breakPoint: null, demerits: Infinity, ratio: 0 }
            ];

            while(activeNode) {
                var nextActiveBreakPoint = activeNode.next,
                    blockIndex = activeNode.value.block + 1,
                    ratio = this.computeRatio(text, index, /** @type {!tpo.layout.BreakPoint} */ (activeNode.value), runningTotal, blockIndex),
                    type = text.getType(index);

                // Deactive nodes when the the distance between the current active node and the
                // current node becomes too large (i.e. it exceeds the stretch limit and the stretch
                // ratio becomes negative) or when the current node is a forced break (i.e. the end
                // of the paragraph when we want to remove all active nodes, but possibly have a final
                // candidate active node---if the paragraph can be set using the given tolerance value.)
                if (ratio < -1 || (text.getType(index) === TextRun.NodeType.PENALTY && text.getPenalty(index) === -10000)) {
                    activeNodes.remove(activeNode);
                }

                if (-1 <= ratio && ratio <= tolerance) {
                    // If the ratio is within the valid range of -1 <= ratio <= tolerance calculate the
                    // total demerits and record a candidate active node.
                    var badness = 100 * Math.pow(Math.abs(ratio), 3),
                        currentClass = 0,
                        demerits = 0;

                    // Positive penalty
                    if (text.getType(index) === TextRun.NodeType.PENALTY && text.getPenalty(index) >= 0) {
                        demerits = Math.pow(10 + badness + text.getPenalty(index), 2);
                    // Negative penalty but not a forced break
                    } else if (text.getType(index) === TextRun.NodeType.PENALTY && text.getPenalty(index) !== -10000) {
                        demerits = Math.pow(10 + badness - text.getPenalty(index), 2);
                    // All other cases
                    } else {
                        demerits = Math.pow(10 + badness, 2);
                    }

                    if (text.getType(index) === TextRun.NodeType.PENALTY && text.getType(activeNode.value.position) === TextRun.NodeType.PENALTY) {
                        demerits += 100 * text.getFlagged(index) * text.getFlagged(activeNode.value.position);
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
                if (activeNode !== null && activeNode.value.block >= blockIndex) {
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
            for (var j = index; j < text.size; j += 1) {
                var type = text.getType(j);

                if (type === TextRun.NodeType.GLUE) {
                    sum.width += text.getWidth(j);
                    sum.stretch += text.getStretch(j);
                    sum.shrink += text.getShrink(j);
                } else if ((type === TextRun.NodeType.BOX || type === TextRun.NodeType.ELEMENT) || (type === TextRun.NodeType.PENALTY && text.getPenalty(j) === -10000 && j > index)) {
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
                                candidate.breakPoint.block + 1,
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
     * @param {tpo.layout.TextRun} text
     * @param {number} tolerance
     */
    TextFlow.prototype.tryLayout = function(text, tolerance) {
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

        for (var i = 0; i < text.size; i += 1) {
            var type = text.getType(i);

            if (type === TextRun.NodeType.BOX || type === TextRun.NodeType.ELEMENT) {
                runningTotal.width += text.getWidth(i);
            } else if (type === TextRun.NodeType.GLUE) {
                if (i > 0 && (text.getType(i - 1) === TextRun.NodeType.BOX || text.getType(i - 1) === TextRun.NodeType.ELEMENT)) {
                    this.findBreaks(text, i, activeNodes, runningTotal, tolerance);
                }
                runningTotal.width += text.getWidth(i);
                runningTotal.stretch += text.getStretch(i);
                runningTotal.shrink += text.getShrink(i);
            } else if (type === TextRun.NodeType.PENALTY && text.getPenalty(i) !== 10000) {
                this.findBreaks(text, i, activeNodes, runningTotal, tolerance);
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
                result.push([bestBreakPoint.position, bestBreakPoint.ratio, this.getBlockWidth(text, bestBreakPoint.block)]);
                bestBreakPoint = bestBreakPoint.previous;
            }
            result.reverse();
        }
        return result;
    };
});
