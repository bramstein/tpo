goog.provide('tpo.layout.Paragraph');

goog.require('tpo.text.BreakAction');
goog.require('tpo.layout.Box');
goog.require('tpo.layout.Glue');
goog.require('tpo.layout.Justification');
goog.require('tpo.layout.Line');
goog.require('tpo.layout.Penalty');
goog.require('tpo.util.array');
goog.require('tpo.util.dom');
goog.require('tpo.util.DomPosition');

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
    }

    /**
     * @type {Array.<tpo.layout.Glue|tpo.layout.Box|tpo.layout.Penalty>}
     */
    this.nodes = [];

    /**
     * @type {Array.<number>}
     */
    this.widths = [element.clientWidth];

    /**
     * @type {number}
     */
    this.lineHeight = parseFloat(lineHeight);

    this.makeNodes();
};

goog.scope(function() {
    var BreakAction = tpo.text.BreakAction,
        Paragraph = tpo.layout.Paragraph,
        Justification = tpo.layout.Justification,
        Box = tpo.layout.Box,
        Glue = tpo.layout.Glue,
        Line = tpo.layout.Line,
        Penalty = tpo.layout.Penalty,
        array = tpo.util.array,
        dom = tpo.util.dom,
        DomPosition = tpo.util.DomPosition;

    /**
     * @enum {number}
     */
    Paragraph.Alignment = {
        JUSTIFY: 1,
        LEFT: 2,
        RIGHT: 3
    };

    /**
     * @private
     * @param {!Element} node
     * @param {number} breakClass
     */
    Paragraph.prototype.addBox = function(node, position, breakClass) {
        this.nodes.push(new Box(position, node.clientWidth, node.clientHeight, node.textContent));

        if (breakClass === BreakAction.Type.EXPLICIT) {
            this.nodes.push(new Glue(position, 0, 0, Justification.INFINITY, 0));
            this.nodes.push(new Glue(position, 0, 0, -Justification.INFINITY, 1));
        } else if (breakClass === BreakAction.Type.DIRECT) {
            this.nodes.push(new Glue(position, 0, 0, 0, 0));
        }
    };

    /**
     * @private
     * @param {!Element} node
     * @param {number} breakClass
     */
    Paragraph.prototype.addGlue = function(node, position, breakClass) {
        var width = node.clientWidth,
            height = node.clientHeight;

        if (this.alignment === Paragraph.Alignment.JUSTIFY) {
            this.nodes.push(new Glue(position, width, height, (width * 3) / 6, (width * 3) / 9));
        } else if (this.alignment === Paragraph.Alignment.LEFT || this.alignment === Paragraph.Alignment.RIGHT) {
            this.nodes.push(new Glue(position, 0, 0, width * 3, 0));
            this.nodes.push(new Penalty(position, 0, 0, 0, 0));
            this.nodes.push(new Glue(position, width, height, -width * 3, 0));
        }
    };

    /**
     * @private
     * @param {!Element} node
     */
    Paragraph.prototype.addPenalty = function(node, position) {
        this.nodes.push(new Penalty(position, node.clientWidth, node.clientHeight, Justification.Demerits.HYPHEN, 1));
    };

    /**
     * @private
     */
    Paragraph.prototype.makeNodes = function() {
        var that = this;

        dom.query('.ruler', this.element).forEach(function(ruler) {
            dom.query('.glue, .box', ruler).forEach(function(node) {
                var breakAction = parseInt(node.getAttribute('data-break'), 10),
                    position = new DomPosition(node.parentNode.parentNode, node.parentNode.nextSibling);

                if (node.classList.contains('box')) {
                    if (node.childNodes.length > 1) {
                        array.toArray(node.childNodes).forEach(function(box, index, boxes) {
                            if (index < boxes.length - 1) {
                                that.addBox(box, position, breakAction);
                                if (index < boxes.length - 2) {
                                    that.addPenalty(boxes[boxes.length - 1], position);
                                }
                            }
                        });
                    } else {
                        that.addBox(node, position, breakAction);
                    }
                } else {
                    that.addGlue(node, position, breakAction);
                }
            });
        });
    };

    /**
     * @param {number} tolerance
     * @return {Array.<tpo.layout.Line>}
     */
    Paragraph.prototype.makeLines = function(tolerance) {
        var justification = new Justification(this.nodes, this.widths);

        return justification.makeLines(tolerance);
    };
});
