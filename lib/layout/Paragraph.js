goog.provide('tpo.layout.Paragraph');

goog.require('tpo.text.BreakAction');
goog.require('tpo.layout.TextRun');
goog.require('tpo.util.array');
goog.require('tpo.util.dom');
goog.require('tpo.util.debug');

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
    this.text = null;

    /**
     * @type {Array.<number>}
     */
    this.width = element.clientWidth;

    /**
     * @type {number}
     */
    this.lineHeight = parseFloat(lineHeight);

    this.makeTextBlocks();
};

goog.scope(function() {
    var BreakAction = tpo.text.BreakAction,
        Paragraph = tpo.layout.Paragraph,
        TextRun = tpo.layout.TextRun,
        array = tpo.util.array,
        debug = tpo.util.debug,
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
                    size += sizes[5] * 3; // br5
                    size += sizes[6] * 1; // hy
                }
            } else if (blocks[i].nodeName === 'BR') {
                size += 2; // br
            } else {
                size += 1; // el
            }
        }

        this.text = new TextRun(size, [this.width]);

        if (this.alignment === Paragraph.Alignment.CENTER) {
            this.text.addBox(blocks[0], 0, 0, '');
            this.text.addGlue(blocks[0], 0, 0, 12, 0);
        }

        for (var i = 0; i < blocks.length; i += 1) {
            if (blocks[i].nodeName === 'SPAN') {
                var nodes = blocks[i].childNodes;

                for (var k = 0; k < nodes.length; k += 1) {
                    var width = nodes[k].offsetWidth,
                        height = nodes[k].offsetHeight,
                        text = nodes[k].textContent,
                        classList = nodes[k].getAttribute('class');

                    if (classList === 'br1') {
                        if (this.alignment === Paragraph.Alignment.CENTER) {
                            this.text.addGlue(blocks[i], 0, 0, 12, 0);
                            this.text.addPenalty(blocks[i], 0, 0, 0, 0);
                            this.text.addGlue(blocks[i], width, 0, -24, 0);
                            this.text.addBox(blocks[i], 0, 0, '');
                            this.text.addPenalty(blocks[i], 0, 0, 10000, 0);
                            this.text.addGlue(blocks[i], 0, 0, 12, 0);
                        } else if (this.alignment === Paragraph.Alignment.JUSTIFY) {
                            this.text.addGlue(blocks[i], width, 0, (width * 3) / 6, (width * 3) / 9);
                        } else {
                            this.text.addGlue(blocks[i], 0, 0, 12, 0);
                            this.text.addPenalty(blocks[i], 0, 0, 0, 0);
                            this.text.addGlue(blocks[i], width, 0, -12, 0);
                        }
                    } else if (classList === 'hy') {
                        this.text.addPenalty(blocks[i], width, 0, 100, 1);
                    } else if (classList === 'br5') {
                        if (this.alignment === Paragraph.Alignment.CENTER) {
                            this.text.addBox(blocks[i], width, 0, text);
                            this.text.addGlue(blocks[i], 0, 0, 12, 0);
                            this.text.addPenalty(blocks[i], 0, 0, -10000, 0);
                        } else {
                            this.text.addBox(blocks[i], width, 0, text);
                            this.text.addGlue(blocks[i], 0, 0, 10000, 0);
                            this.text.addPenalty(blocks[i], 0, 0, -10000, 1);
                        }
                    } else if (classList === 'br0') {
                        this.text.addBox(blocks[i], width, 0, text);
                        this.text.addGlue(blocks[i], 0, 0, 0, 0);
                    } else {
                        this.text.addBox(blocks[i], width, 0, text);
                    }
                }
            } else if (blocks[i].nodeName === 'BR') {
                this.text.addGlue(blocks[i], 0, 0, 10000, 0);
                this.text.addPenalty(blocks[i], 0, 0, -10000, 1);
            } else {
                // Most likely an image, button, or other any element that does have
                // a visual representation but does not contain text or child nodes.
                this.text.addElement(blocks[i], blocks[i].offsetWidth, blocks[i].offsetHeight);
            }
        }
    };
});
