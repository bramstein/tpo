goog.provide('tpo.layout.Paragraph');

goog.require('tpo.text.BreakAction');
goog.require('tpo.layout.Justification');
goog.require('tpo.layout.TextBlock');
goog.require('tpo.util.array');
goog.require('tpo.util.dom');

/**
 * A Paragraph is a collection of box and glue nodes.
 *
 * @param {!Element} element
 * @constructor
 */
tpo.layout.Paragraph = function(element) {
    var style = window.getComputedStyle(element, null),
        textAlign = style['textAlign'],
        lineHeight = style['lineHeight'];

    /**
     * @type {!Element}
     */
    this.element = element;

    /**
     * @type {!tpo.layout.Paragraph.Alignment}
     */
    this.alignment = tpo.layout.Paragraph.Alignment.LEFT;

    // TODO: This ignores RTL and LTR differences
    if (/right/.test(textAlign)) {
        this.alignment = tpo.layout.Paragraph.Alignment.RIGHT;
    } else if (/justify/.test(textAlign)) {
        this.alignment = tpo.layout.Paragraph.Alignment.JUSTIFY;
    } else if (/center/.test(textAlign)) {
        this.alignment = tpo.layout.Paragraph.Alignment.CENTER;
    }

    /**
     * @type tpo.layout.TextBlock
     */
    this.textBlock = null;

    /**
     * @type {Array.<number>}
     */
    this.widths = [element.clientWidth];

    /**
     * @type {number}
     */
    this.lineHeight = parseFloat(lineHeight);

    this.makeTextBlocks();
};

goog.scope(function() {
    var BreakAction = tpo.text.BreakAction,
        Paragraph = tpo.layout.Paragraph,
        TextBlock = tpo.layout.TextBlock,
        Justification = tpo.layout.Justification,
        array = tpo.util.array,
        dom = tpo.util.dom;

    /**
     * @enum {number}
     */
    Paragraph.Alignment = {
        JUSTIFY: 1,
        LEFT: 2,
        RIGHT: 3,
        CENTER: 4
    };

    /**
     * @private
     */
    Paragraph.prototype.makeTextBlocks = function() {
        var blocks = this.element.querySelectorAll('.text, br, img, button'),
            size = 0;

        if (this.alignment === Paragraph.Alignment.CENTER) {
            size += 2;
        }

        for (var i = 0; i < blocks.length; i += 1) {
            if (blocks[i].classList.contains('text')) {
                // calculate sizes
                var sizes = blocks[i].getAttribute('data-size').split(/,/g).map(function(size) {
                        return parseInt(size, 10);
                    });

                if (this.alignment === Paragraph.Alignment.JUSTIFY) {
                    size += sizes[0] * 2; // br0
                    size += sizes[1] * 1; // br1
                    size += sizes[2] * 1; // br2
                    size += sizes[3] * 1; // br3
                    size += sizes[4] * 1; // br4
                    size += sizes[5] * 3; // br5
                    size += sizes[6] * 1; // hy
                } else if (this.alignment === Paragraph.Alignment.LEFT || this.alignment === Paragraph.Alignment.RIGHT) {
                    size += sizes[0] * 2; // br0
                    size += sizes[1] * 3; // br1
                    size += sizes[2] * 1; // br2
                    size += sizes[3] * 1; // br3
                    size += sizes[4] * 1; // br4
                    size += sizes[5] * 3; // br5
                    size += sizes[6] * 1; // hy
                } else if (this.alignment === Paragraph.Alignment.CENTER) {
                    size += sizes[0] * 2; // br0
                    size += sizes[1] * 6; // br1
                    size += sizes[2] * 1; // br2
                    size += sizes[3] * 1; // br3
                    size += sizes[4] * 1; // br4
                    size += sizes[5] * 2; // br5
                    size += sizes[6] * 1; // hy
                }
            } else if (blocks[i].nodeName === 'BR') {
                size += 2; // br
            } else {
                size += 1; // el
            }
        }

        this.textBlock = new TextBlock(size);
        
        if (this.alignment === Paragraph.Alignment.CENTER) {
            this.textBlock.addBox(blocks[0], 0, 0, '');
            this.textBlock.addGlue(blocks[0], 0, 0, 12, 0);
        }
        
        for (var i = 0; i < blocks.length; i += 1) {
            if (blocks[i].classList.contains('text')) {
                var cache = {},
                    nodes = blocks[i].childNodes;

                for (var k = 0; k < nodes.length; k += 1) {
                    var width = 0,
                        text = nodes[k].textContent;

                    if (cache[text]) {
                        width = cache[nodes[k].textContent];
                    } else {
                        width = cache[text] = nodes[k].clientWidth;
                    }

                    if (nodes[k].classList.contains('br1')) {
                        if (this.alignment === Paragraph.Alignment.CENTER) {
                            this.textBlock.addGlue(blocks[i], 0, 0, 0, 12, 0);
                            this.textBlock.addPenalty(blocks[i], 0, 0, 0, 0, 0);
                            this.textBlock.addGlue(blocks[i], width, 0, -24, 0);
                            this.textBlock.addBox(blocks[i], 0, 0, '');
                            this.textBlock.addPenalty(blocks[i], 0, 0, 10000, 0);
                            this.textBlock.addGlue(blocks[i], 0, 0, 12, 0);
                        } else if (this.alignment === Paragraph.Alignment.JUSTIFY) {
                            this.textBlock.addGlue(blocks[i], width, 0, (width * 3) / 6, (width * 3) / 9);
                        } else {
                        }
                    } else if (nodes[k].classList.contains('hy')) {
                        this.textBlock.addPenalty(blocks[i], width, 0, 100, 1);
                    } else if (nodes[k].classList.contains('br5')) {
                        if (this.alignment === Paragraph.Alignment.CENTER) {
                            this.textBlock.addGlue(blocks[i], 0, 0, 12, 0);
                            this.textBlock.addPenalty(blocks[i], 0, 0, -10000, 0);
                        } else if (this.alignment === Paragraph.Alignment.JUSTIFY) {
                            this.textBlock.addBox(blocks[i], width, 0, text);
                            this.textBlock.addGlue(blocks[i], 0, 0, 10000, 0);
                            this.textBlock.addPenalty(blocks[i], 0, 0, -10000, 1);
                        } else {
                        }
                    } else if (nodes[k].classList.contains('br0')) {
                        this.textBlock.addBox(blocks[i], width, 0, text);
                        this.textBlock.addGlue(blocks[i], 0, 0, 0, 0);
                    } else {
                        this.textBlock.addBox(blocks[i], width, 0, text);
                    }
                }
            } else if (blocks[i].nodeName === 'BR') {
                this.textBlock.addGlue(blocks[i], 0, 0, 10000, 0);
                this.textBlock.addPenalty(blocks[i], 0, 0, -10000, 1);
            } else {
                // Most likely an image, button, or other any element that does have
                // a visual representation but does not contain text or child nodes.
                this.textBlock.addElement(blocks[i], blocks[i].offsetWidth, blocks[i].offsetHeight);
            }
        }
    };

    /**
     * @param {number} tolerance
     * @return {Array.<tpo.layout.Line>}
     */
    Paragraph.prototype.makeLines = function(tolerance) {
        //var justification = new Justification(this.nodes, this.widths);

        //return justification.makeLines(tolerance);
        return [];
    };
});
