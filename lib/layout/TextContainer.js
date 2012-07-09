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
                block = new TextBlock(blockElements[i], blockSize, blockAlignment),
                flowElements = dom.query(TextBlock.FlowElements, blockElements[i]);

            o1 += 6;
            o2 += 3;

            if (blockAlignment === TextBlock.Alignment.CENTER) {
                block.addBox(/** @type {!Node} */ (flowElements[0]), 0, 0, '');
                block.addGlue(/** @type {!Node} */ (flowElements[0]), 0, 0, 12, 0);
            }

            for (var j = 0; j < blockNodes; j += 1) {
                var nodeIndex =  u1[o1 + (j * 6) + 0],
                    nodeStyle =  u1[o1 + (j * 6) + 1],
                    nodeAction = u1[o1 + (j * 6) + 2],
                    nodeValue =  u2[o2 + (j * 3) + 2],
                    text = words[nodeValue - 1],
                    metrics = this.styles[nodeStyle - 1].lookup(text),
                    element = /** @type {!Node} */ (flowElements[nodeIndex]);

                if (text) {
                    if (nodeAction === BreakAction.Type.INDIRECT) {
                        if (blockAlignment === TextBlock.Alignment.CENTER) {
                            block.addGlue(element, 0, 0, 12, 0);
                            block.addPenalty(element, 0, 0, 0, 0);
                            block.addGlue(element, metrics.width, metrics.height, -24, 0);
                            block.addBox(element, 0, 0, '');
                            block.addPenalty(element, 0, 0, 10000, 0);
                            block.addGlue(element, 0, 0, 12, 0);
                        } else if (blockAlignment === TextBlock.Alignment.JUSTIFY) {
                            block.addGlue(element, metrics.width, metrics.height, metrics.width * 0.5, metrics.width * 0.3333333);
                        } else {
                            block.addGlue(element, 0, 0, 12, 0);
                            block.addPenalty(element, 0, 0, 0, 0);
                            block.addGlue(element, metrics.width, metrics.height, -12, 0);
                        }
                    } else if (nodeAction === BreakAction.Type.EXPLICIT) {
                        if (blockAlignment === TextBlock.Alignment.CENTER) {
                            block.addBox(element, metrics.width, metrics.height, text);
                            block.addGlue(element, 0, 0, 12, 0);
                            block.addPenalty(element, 0, 0, -10000, 0);
                        } else {
                            block.addBox(element, metrics.width, metrics.height, text);
                            block.addGlue(element, 0, 0, 10000, 0);
                            block.addPenalty(element, 0, 0, -10000, 1);
                        }
                    } else if (nodeAction === BreakAction.Type.DIRECT) {
                        // Soft-hyphens
                        if (text === '\u00AD') {
                            block.addPenalty(element, metrics.width, metrics.height, 100, 1);
                        } else {
                            block.addBox(element, metrics.width, metrics.height, text);
                            block.addGlue(element, 0, 0, 0, 0);
                        }
                    } else {
                        block.addBox(element, metrics.width, metrics.height, text);
                    }
                } else {
                    if (nodeAction === BreakAction.Type.EXPLICIT) {
                        // forced break (BR)
                        block.addGlue(element, 0, 0, 10000, 0);
                        block.addPenalty(element, 0, 0, -10000, 1);
                    } else {
                        // inline element
                        block.addElement(element, element.offsetWidth, element.offsetHeight);
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
