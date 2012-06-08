goog.provide('tpo.layout.Paragraph');

goog.require('tpo.text.BreakAction');
goog.require('tpo.layout.Box');
goog.require('tpo.layout.InlineElement');
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
     * @type {Array.<tpo.layout.Glue|tpo.layout.Box|tpo.layout.Penalty|tpo.layout.InlineElement>}
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
        InlineElement = tpo.layout.InlineElement,
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
     * @param {!tpo.util.DomPosition} position
     */
    Paragraph.prototype.addBox = function(node, position) {
        var childNode = null,
            penaltyNode = null,
            penaltyWidth = 0,
            penaltyHeight = 0;

        if (node.childNodes.length > 1) {
            penaltyNode = node.childNodes[node.childNodes.length - 1];
            penaltyWidth = penaltyNode.clientWidth;
            penaltyHeight = penaltyNode.clientHeight;

            for (var j = 0; j < node.childNodes.length - 1; j += 1) {
                childNode = node.childNodes[j];
                this.nodes.push(new Box(position, childNode.clientWidth, childNode.clientHeight, childNode.textContent));
                if (j < node.childNodes.length - 2) {
                    this.nodes.push(new Penalty(position, penaltyWidth, penaltyHeight, Justification.Demerits.HYPHEN, 1));
                }
            }
        } else {
            this.nodes.push(new Box(position, node.clientWidth, node.clientHeight, node.textContent));
        }
    };

    /**
     * @private
     * @param {!Element} node
     * @param {!tpo.util.DomPosition} position
     */
    Paragraph.prototype.addGlue = function(node, position) {
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
     */
    Paragraph.prototype.makeNodes = function() {
        var that = this,
            queue = [this.element];

        while (queue.length) {
            var node = queue.pop();

            if (node.nodeType === 1) {
                var position = new DomPosition(node.parentNode.parentNode, node.parentNode.nextSibling);
                if (node.nodeName === 'IMG' || node.nodeName === 'BUTTON') {
                    // Most likely an image, button, or other any element that does have
                    // a visual representation but does not contain text or child nodes.
                    this.nodes.push(new InlineElement(node, node.offsetWidth, node.offsetHeight));
                } else if (node.nodeName === 'BR') {
                    this.nodes.push(new Glue(position, 0, 0, Justification.INFINITY, 0));
                    this.nodes.push(new Penalty(position, 0, 0, -Justification.INFINITY, 1));
                } else if (node.classList.contains('br1')) {
                    this.addGlue(node, position);
                } else if (node.classList.contains('br4')) {
                    this.addBox(node, position);
                } else if (node.classList.contains('br5')) {
                    this.addBox(node, position);
                    this.nodes.push(new Glue(position, 0, 0, Justification.INFINITY, 0));
                    this.nodes.push(new Penalty(position, 0, 0, -Justification.INFINITY, 1));
                } else if (node.classList.contains('br0')) {
                    this.addBox(node, position);
                    this.nodes.push(new Glue(position, 0, 0, 0, 0));
                } else if (node.classList.contains('br2')) {
                } else if (node.classList.contains('br3')) {
                } else {
                    for (var j = node.childNodes.length - 1; j >= 0; j -= 1) {
                        queue.push(node.childNodes[j]);
                    }
                }
            }
        }
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
