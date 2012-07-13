goog.provide('tpo.layout.TextContainer');

goog.require('tpo.layout.TextBlock');

goog.require('tpo.text.BreakAction');

goog.require('tpo.util.TextMetrics');
goog.require('tpo.util.debug');
goog.require('tpo.util.dom');

/**
 * @constructor
 * @param {!Element} element
 * @param {!Element} styles
 * @param {!{nodes: string, words: Array.<string>}} data
 */
tpo.layout.TextContainer = function(element, styles, data) {

    /**
     * @type {!Element}
     */
    this.element = element;

    /**
     * @type {Array.<tpo.util.TextMetrics>}
     */
    this.styles = [];

    /**
     * @type {Array.<tpo.layout.TextBlock>}
     */
    this.blocks = [];

    this.parseStyles(styles);
    this.parseData(data);
};

goog.scope(function() {
    var TextContainer = tpo.layout.TextContainer,
        TextBlock = tpo.layout.TextBlock,
        TextMetrics = tpo.util.TextMetrics,

        BreakAction = tpo.text.BreakAction,

        debug = tpo.util.debug,
        dom = tpo.util.dom;

    /**
     * The text nodes of the following elements will be treated as containing
     * text when they are contained by a BlockElement.
     *
     * @const
     * @type {string}
     */
    TextContainer.TextElements = 'p, p em, p a, p abbr, p span, p strong, p acronym';


    /**
     * Top-level element that may contain text.
     *
     * @const
     * @type {string}
     */
    TextContainer.BlockElements = 'p';

    /**
     * @param {!Element} characters
     */
    TextContainer.prototype.parseStyles = function(characters) {
        debug.time('parsing styles');
        var styleNodes = characters.childNodes;

        for (var i = 0; i < styleNodes.length; i += 1) {
            this.styles[i] = new TextMetrics(styleNodes[i]);
        }

        debug.timeEnd('parsing styles');
    };

    /**
     * @param {!{nodes: string, words: Array.<string>}} data
     */
    TextContainer.prototype.parseData = function(data) {
        debug.time('decoding nodes');
        var blockElements = dom.query(TextContainer.BlockElements, this.element),
            bin = window.atob(data.nodes),
            words = data.words,
            buffer = new ArrayBuffer(bin.length),
            u1 = new Uint8Array(buffer),
            u2 = new Uint16Array(buffer);

        for (var i = 0; i < bin.length; i += 1) {
            u1[i] = bin.charCodeAt(i);
        }

        var size = u2[0],
            o1 = 2,
            o2 = 1;

        for (var i = 0; i < size; i += 1) {
            var blockAlignment = u1[o1 + 0],
                blockNodes =     u2[o2 + 1],
                blockSize =      u2[o2 + 2],
                block = new TextBlock(/** @type {!Element} */ (blockElements[i]), blockSize, blockAlignment),
                flowElements = dom.query(TextBlock.FlowElements, blockElements[i]),
                index = 0;

            o1 += 6;
            o2 += 3;

            if (blockAlignment === TextBlock.Alignment.CENTER) {
                // BOX(0, 0, '')
                block.setType(index, TextBlock.NodeType.BOX);
                block.setPosition(index, /** @type {!Node} */ (flowElements[0]));
                block.setText(index, '');

                index += 1;

                // GLUE(0, 0, 12, 0)
                block.setType(index, TextBlock.NodeType.GLUE);
                block.setPosition(index, /** @type {!Node} */ (flowElements[0]));
                block.setStretch(index, 12);

                index += 1;
            }

            for (var j = 0; j < blockNodes; j += 1) {
                var nodeIndex =  u1[o1 + (j * 6) + 0],
                    nodeStyle =  u1[o1 + (j * 6) + 1],
                    nodeAction = u1[o1 + (j * 6) + 2],
                    nodeValue =  u2[o2 + (j * 3) + 2],
                    text = words[nodeValue - 1],
                    metrics = this.styles[nodeStyle - 1].lookup(text),
                    width = metrics[0],
                    height = metrics[1],
                    element = /** @type {!Node} */ (flowElements[nodeIndex]);

                if (text) {
                    if (nodeAction === BreakAction.Type.INDIRECT || nodeAction === BreakAction.Type.DIRECT) {
                        if (text === ' ') {
                            if (blockAlignment === TextBlock.Alignment.CENTER) {
                                // GLUE(0, 0, 12, 0)
                                block.setType(index, TextBlock.NodeType.GLUE);
                                block.setPosition(index, element);
                                block.setStretch(index, 12);
                                index += 1;

                                // PENALTY(0, 0, 0, 0)
                                block.setType(index, TextBlock.NodeType.PENALTY);
                                block.setPosition(index, element);
                                index += 1;

                                // GLUE(width, height, -24, 0)
                                block.setType(index, TextBlock.NodeType.GLUE);
                                block.setPosition(index, element);
                                block.setWidth(index, width);
                                block.setHeight(index, height);
                                block.setStretch(index, -24);
                                index += 1;

                                // BOX(0, 0, '')
                                block.setType(index, TextBlock.NodeType.BOX);
                                block.setPosition(index, element);
                                block.setText(index, '');
                                index += 1;

                                // PENALTY(0, 0, 10000, 0)
                                block.setType(index, TextBlock.NodeType.PENALTY);
                                block.setPosition(index, element);
                                block.setPenalty(index, 10000);
                                index += 1;

                                // GLUE(0, 0, 12, 0)
                                block.setType(index, TextBlock.NodeType.GLUE);
                                block.setPosition(index, element);
                                block.setStretch(index, 12);
                                index += 1;
                            } else if (blockAlignment === TextBlock.Alignment.JUSTIFY) {
                                // GLUE(width, height, width * 0.5, width * 0.3333)
                                block.setType(index, TextBlock.NodeType.GLUE);
                                block.setPosition(index, element);
                                block.setWidth(index, width);
                                block.setHeight(index, height);
                                block.setStretch(index, width * 0.5);
                                block.setShrink(index, width * 0.33333);
                                index += 1;
                            } else {
                                // GLUE(0, 0, 12, 0)
                                block.setType(index, TextBlock.NodeType.GLUE);
                                block.setPosition(index, element);
                                block.setStretch(index, 12);
                                index += 1;

                                // PENALTY(0, 0, 0, 0)
                                block.setType(index, TextBlock.NodeType.PENALTY);
                                block.setPosition(index, element);
                                index += 1;

                                // GLUE(width, height, -12, 0)
                                block.setType(index, TextBlock.NodeType.GLUE);
                                block.setPosition(index, element);
                                block.setWidth(index, width);
                                block.setHeight(index, height);
                                block.setStretch(index, -12);
                                index += 1;
                            }
                        } else if (text === '\u00AD') {
                            // Soft-hyphens
                            // PENALTY(width, height, 100, 1, '-')
                            block.setType(index, TextBlock.NodeType.PENALTY);
                            block.setPosition(index, element);
                            block.setWidth(index, width);
                            block.setHeight(index, height);
                            block.setPenalty(index, 100);
                            block.setFlagged(index, 1);
                            block.setText(index, '-');
                            index += 1;
                        } else {
                            // BOX(width, height, text)
                            block.setType(index, TextBlock.NodeType.BOX);
                            block.setPosition(index, element);
                            block.setWidth(index, width);
                            block.setHeight(index, height);
                            block.setText(index, text);
                            index += 1;

                            // GLUE(0, 0, 0, 0)
                            block.setType(index, TextBlock.NodeType.GLUE);
                            block.setPosition(index, element);
                            index += 1;
                        }
                    } else if (nodeAction === BreakAction.Type.EXPLICIT) {
                        if (blockAlignment === TextBlock.Alignment.CENTER) {
                            // BOX(width, height, text)
                            block.setType(index, TextBlock.NodeType.BOX);
                            block.setPosition(index, element);
                            block.setWidth(index, width);
                            block.setHeight(index, height);
                            block.setText(index, text);
                            index += 1;

                            // GLUE(0, 0, 12, 0)
                            block.setType(index, TextBlock.NodeType.GLUE);
                            block.setPosition(index, element);
                            block.setStretch(index, 12);
                            index += 1;

                            // PENALTY(0, 0, -10000, 0)
                            block.setType(index, TextBlock.NodeType.PENALTY);
                            block.setPosition(index, element);
                            block.setPenalty(index, -10000);
                            index += 1;
                        } else {
                            // BOX(width, height, text)
                            block.setType(index, TextBlock.NodeType.BOX);
                            block.setPosition(index, element);
                            block.setWidth(index, width);
                            block.setHeight(index, height);
                            block.setText(index, text);
                            index += 1;

                            // GLUE(0, 0, 10000, 0)
                            block.setType(index, TextBlock.NodeType.GLUE);
                            block.setPosition(index, element);
                            block.setStretch(index, 10000);
                            index += 1;

                            // PENALTY(0, 0, -10000, 1)
                            block.setType(index, TextBlock.NodeType.PENALTY);
                            block.setPosition(index, element);
                            block.setPenalty(index, -10000);
                            block.setFlagged(index, 1);
                            index += 1;
                        }
                    } else {
                        // BOX(width, height, text)
                        block.setType(index, TextBlock.NodeType.BOX);
                        block.setPosition(index, element);
                        block.setWidth(index, width);
                        block.setHeight(index, height);
                        block.setText(index, text);
                        index += 1;
                    }
                } else {
                    if (nodeAction === BreakAction.Type.EXPLICIT) {
                        // GLUE(0, 0, 10000, 0)
                        block.setType(index, TextBlock.NodeType.GLUE);
                        block.setPosition(index, element);
                        block.setStretch(index, 10000);
                        index += 1;

                        // PENALTY(0, 0, -10000, 1)
                        block.setType(index, TextBlock.NodeType.PENALTY);
                        block.setPosition(index, element);
                        block.setPenalty(index, -10000);
                        block.setFlagged(index, 1);
                        index += 1;
                    } else {
                        // ELEMENT(width, height)
                        block.setType(index, TextBlock.NodeType.ELEMENT);
                        block.setPosition(index, element);
                        block.setWidth(index, element.offsetWidth);
                        block.setHeight(index, element.offsetHeight);
                        index += 1;
                    }
                }
            }

            this.blocks[i] = block;

            o1 += 6 * blockNodes;
            o2 += 3 * blockNodes;
        }
        debug.timeEnd('decoding nodes');
    };
});
