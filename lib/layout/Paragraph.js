goog.provide('tpo.layout.Paragraph');

goog.require('tpo.text.BreakAction');
goog.require('tpo.layout.Box');
goog.require('tpo.layout.Glue');
goog.require('tpo.layout.Justification');
goog.require('tpo.layout.Line');
goog.require('tpo.layout.Penalty');
goog.require('tpo.util.array');
goog.require('tpo.util.dom');

/**
 * A Paragraph is a collection of box and glue nodes.
 *
 * @param {!Element} element
 * @constructor
 */
tpo.layout.Paragraph = function(element) {
    var textAlign = window.getComputedStyle(element, null)['text-align'];

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
    this.widths = [];


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
        dom = tpo.util.dom;

    /**
     * @enum {number}
     */
    Paragraph.Alignment = {
        JUSTIFY: 1,
        LEFT: 2,
        RIGHT: 3
    };

    Paragraph.prototype.addBox = function(node, breakClass) {
        this.nodes.push(new Box(node.clientWidth, node.textContent));

        if (breakClass === BreakAction.Type.EXPLICIT) {
            this.nodes.push(new Glue(0, Justification.INFINITY, 0));
            this.nodes.push(new Glue(0, -Justification.INFINITY, 1));
        } else if (breakClass === BreakAction.Type.DIRECT) {
            this.nodes.push(new Glue(0, 0, 0));
        }
    };

    Paragraph.prototype.addGlue = function(node, breakClass) {
        var width = node.clientWidth;

        if (this.alignment === Paragraph.Alignment.JUSTIFY) {
            this.nodes.push(new Glue(width, (width * 3) / 6, (width * 3) / 9));
        } else if (this.alignment === Paragraph.Alignment.LEFT || this.alignment === Paragraph.Alignment.RIGHT) {
            this.nodes.push(new Glue(0, width * 3, 0));
            this.nodes.push(new Penalty(0, 0, 0));
            this.nodes.push(new Glue(width, -width * 3, 0));
        }
    };

    Paragraph.prototype.makeNodes = function() {
        var that = this;

        dom.query('.glue, .box', this.element).forEach(function(node) {
            var breakAction = parseInt(node.getAttribute('data-break'), 10);

            if (node.classList.contains('box')) {
                if (node.childNodes.length > 1) {
                  array.toArray(node.childNodes).forEach(function(box, index, boxes) {
                      that.addBox(box, breakAction);
                      if (index !== boxes.length - 1) {
                          // FIXME: Find a good way to measure a hyphen
                          that.nodes.push(new Penalty(4, Justification.Demerits.HYPHEN, 1));
                      }
                  });
                } else {
                    that.addBox(node, breakAction);
                }
            } else {
                that.addGlue(node, breakAction);
            }
        });
    };

    /**
     * @param {number} tolerance
     * @return {Array.<tpo.layout.Line>}
     */
    Paragraph.prototype.makeLines = function(tolerance) {
      return [];
    };
});
