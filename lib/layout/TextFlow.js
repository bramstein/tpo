goog.provide('tpo.layout.TextFlow');

goog.require('tpo.layout.TextBlock');
goog.require('tpo.layout.TextBox');
goog.require('tpo.layout.BreakPoint');

goog.require('tpo.util.debug');
goog.require('tpo.util.LinkedList');
goog.require('tpo.util.LinkedListNode');

/**
 * Flows a TextBlock into one or more TextBlocks
 *
 * @constructor
 */
tpo.layout.TextFlow = function() {
    /**
     * @type {Array.<number>}
     */
    this.tolerances = [2, 4, 6, 12, 24, 48, 96];

    /**
     * @type {Array.<number>}
     */
    this.widthCache = [];

    /**
     * Initial candidate breakpoints for the four classes
     * @type {Array.<tpo.layout.TextFlow.Candidate>}
     */
    this.candidates = [
        { breakPoint: null, demerits: Infinity, ratio: 0 },
        { breakPoint: null, demerits: Infinity, ratio: 0 },
        { breakPoint: null, demerits: Infinity, ratio: 0 },
        { breakPoint: null, demerits: Infinity, ratio: 0 }
    ];
};

goog.scope(function() {
    var List = tpo.util.LinkedList,
        Node = tpo.util.LinkedListNode,
        BreakPoint = tpo.layout.BreakPoint,
        TextFlow = tpo.layout.TextFlow,
        TextBox = tpo.layout.TextBox,
        TextBlock = tpo.layout.TextBlock,
        debug = tpo.util.debug;

    /**
     * @private
     * @typedef {{breakPoint: tpo.layout.BreakPoint, ratio: number, demerits: number}}
     */
    TextFlow.Candidate;

    /**
     * @param {tpo.layout.TextBlock} block
     */
    TextFlow.prototype.flow = function(block) {
        var breaks = [],
            boxes = [],
            nodes = [];

        for (var i = 0; i < 1024; i += 1) {
            this.widthCache[i] = i < block.widths.length ? block.widths[i - 1] : block.widths[block.widths.length - 1];
        }

        for (var i = 0; i < this.tolerances.length; i += 1) {
            breaks = this.tryLayout(block, this.tolerances[i]);
            if (breaks.length) {
                break;
            }
        }

        if (breaks.length) {
            var x = 0,
                maxHeight = -1;

            for (var i = 0, blockIndex = 0; i < block.size; i += 1) {
                if (i > breaks[blockIndex][0]) {
                    // After a block break, we skip any nodes unless they are boxes or forced breaks.
                    for (var j = i; j < block.size; j += 1) {
                        var type = block.getType(j);

                        if ((type === TextBlock.NodeType.BOX || type === TextBlock.NodeType.ELEMENT) || (type === TextBlock.NodeType.PENALTY && block.getPenalty(j) === -10000)) {
                            i = j;
                            break;
                        }
                        block.setX(j, -1);
                        block.setY(j, -1);
                    }
                    boxes.push(new TextBox(block, breaks[blockIndex][2], maxHeight, nodes));
                    nodes = [];
                    maxHeight = 0;

                    blockIndex += 1;
                    x = 0;
                }

                var type = block.getType(i);

                if (type === TextBlock.NodeType.BOX) {
                    block.setX(i, x);
                    x += block.getWidth(i);
                    maxHeight = Math.max(maxHeight, block.getHeight(i));
                    nodes.push(i);
                } else if (type === TextBlock.NodeType.PENALTY && block.getPenalty(i) === 100 && i === breaks[blockIndex][0]) {
                    block.setX(i, x);
                    x += block.getWidth(i);
                    maxHeight = Math.max(maxHeight, block.getHeight(i));
                    nodes.push(i);
                } else if (type === TextBlock.NodeType.GLUE) {
                    block.setX(i, -1);
                    x += block.getWidth(i) + breaks[blockIndex][1] * (breaks[blockIndex][1] < 0 ? block.getShrink(i) : block.getStretch(i));
                } else if (type === TextBlock.NodeType.ELEMENT) {
                    block.setX(i, x);
                    x += block.getWidth(i);
                    maxHeight = Math.max(maxHeight, block.getHeight(i));
                    nodes.push(i);
                }
            }

            boxes.push(new TextBox(block, breaks[blockIndex][2], maxHeight, nodes));
        } else {
            debug.error('Could not set TextBlock', block);
        }
        return boxes;
    };

    /**
     * @private
     * @param {!tpo.layout.TextBlock} block
     * @param {number} index
     * @param {!tpo.util.LinkedList} activeNodes
     * @param {!tpo.layout.RunningTotal} runningTotal
     * @param {number} tolerance
     */
    TextFlow.prototype.findBreaks = function(block, index, activeNodes, runningTotal, tolerance) {
        var activeNode = activeNodes.head,
            candidates = this.candidates;

        // The inner loop iterates through all the active nodes with line < currentLine and then
        // breaks out to insert the new active node candidates before looking at the next active
        // nodes for the next lines. The result of this is that the active node list is always
        // sorted by line number.
        while(activeNode) {
            candidates[0].breakPoint = candidates[1].breakPoint = candidates[2].breakPoint = candidates[3].breakPoint = null;
            candidates[0].ratio = candidates[1].ratio = candidates[2].ratio = candidates[3].ratio = 0;
            candidates[0].demerits = candidates[1].demerits = candidates[2].demerits = candidates[3].demerits = Infinity;

            while(activeNode) {
                var nextActiveBreakPoint = activeNode.next,
                    blockIndex = activeNode.value.block + 1,
                    width = runningTotal.width - activeNode.value.totals.width,
                    lineWidth = this.widthCache[blockIndex],
                    ratio = 0,
                    type = block.getType(index);

                if (type === TextBlock.NodeType.PENALTY) {
                    width += block.getWidth(index);
                }

                if (width < lineWidth) {
                    // Calculate the stretch ratio
                    var stretch = runningTotal.stretch - activeNode.value.totals.stretch;

                    if (stretch > 0) {
                        ratio = (lineWidth - width) / stretch;
                    } else {
                        ratio = 10000;
                    }
                } else if (width > lineWidth) {
                    // Calculate the shrink ratio
                    var shrink = runningTotal.shrink - activeNode.value.totals.shrink;

                    if (shrink > 0) {
                        ratio = (lineWidth - width) / shrink;
                    } else {
                        ratio = 10000;
                    }
                } else {
                    // perfect match
                    ratio = 0;
                }

                // Deactive nodes when the the distance between the current active node and the
                // current node becomes too large (i.e. it exceeds the stretch limit and the stretch
                // ratio becomes negative) or when the current node is a forced break (i.e. the end
                // of the paragraph when we want to remove all active nodes, but possibly have a final
                // candidate active node---if the paragraph can be set using the given tolerance value.)
                if (ratio < -1 || (type === TextBlock.NodeType.PENALTY && block.getPenalty(index) === -10000)) {
                    activeNodes.remove(activeNode);
                }

                if (-1 <= ratio && ratio <= tolerance) {
                    // If the ratio is within the valid range of -1 <= ratio <= tolerance calculate the
                    // total demerits and record a candidate active node.
                    var badness = 100 * Math.pow(Math.abs(ratio), 3),
                        currentClass = 0,
                        demerits = 0;

                    // Positive penalty
                    if (type === TextBlock.NodeType.PENALTY && block.getPenalty(index) >= 0) {
                        demerits = Math.pow(10 + badness + block.getPenalty(index), 2);
                    // Negative penalty but not a forced break
                    } else if (type === TextBlock.NodeType.PENALTY && block.getPenalty(index) !== -10000) {
                        demerits = Math.pow(10 + badness - block.getPenalty(index), 2);
                    // All other cases
                    } else {
                        demerits = Math.pow(10 + badness, 2);
                    }

                    if (type === TextBlock.NodeType.PENALTY && block.getType(activeNode.value.position) === TextBlock.NodeType.PENALTY) {
                        demerits += 100 * block.getFlagged(index) * block.getFlagged(activeNode.value.position);
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
            for (var j = index; j < block.size; j += 1) {
                var type = block.getType(j);

                if (type === TextBlock.NodeType.GLUE) {
                    sum.width += block.getWidth(j);
                    sum.stretch += block.getStretch(j);
                    sum.shrink += block.getShrink(j);
                } else if ((type === TextBlock.NodeType.BOX || type === TextBlock.NodeType.ELEMENT) || (type === TextBlock.NodeType.PENALTY && block.getPenalty(j) === -10000 && j > index)) {
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
     * @param {tpo.layout.TextBlock} block
     * @param {number} tolerance
     */
    TextFlow.prototype.tryLayout = function(block, tolerance) {
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

        for (var i = 0; i < block.size; i += 1) {
            var type = block.getType(i);

            if (type === TextBlock.NodeType.BOX || type === TextBlock.NodeType.ELEMENT) {
                runningTotal.width += block.getWidth(i);
            } else if (type === TextBlock.NodeType.GLUE) {
                if (i > 0 && (block.getType(i - 1) === TextBlock.NodeType.BOX || block.getType(i - 1) === TextBlock.NodeType.ELEMENT)) {
                    this.findBreaks(block, i, activeNodes, runningTotal, tolerance);
                }
                runningTotal.width += block.getWidth(i);
                runningTotal.stretch += block.getStretch(i);
                runningTotal.shrink += block.getShrink(i);
            } else if (type === TextBlock.NodeType.PENALTY && block.getPenalty(i) !== 10000) {
                this.findBreaks(block, i, activeNodes, runningTotal, tolerance);
            }
        }

        if (activeNodes.getSize()) {
            // Find the best active node (the one with the least total demerits.)
            var listNode = activeNodes.head,
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
                result.push([bestBreakPoint.position, bestBreakPoint.ratio, this.widthCache[bestBreakPoint.position]]);
                bestBreakPoint = bestBreakPoint.previous;
            }
            result.reverse();
        }
        return result;
    };
});
