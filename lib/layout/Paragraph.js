goog.provide('tpo.layout.Paragraph');

goog.require('tpo.layout.Box');
goog.require('tpo.layout.Glue');
goog.require('tpo.layout.Line');
goog.require('tpo.layout.Penalty');

/**
 *
 * @param {Array.<tpo.layout.Glue|tpo.layout.Box|tpo.layout.Penalty>} nodes
 * @param {Array.<number>} widths
 * @constructor
 */
tpo.layout.Paragraph = function(nodes, widths) {
    /**
     * @type {Array.<tpo.layout.Glue|tpo.layout.Box|tpo.layout.Penalty>}
     */
    this.nodes = nodes;

    /**
     * @type {Array.<number>}
     */
    this.widths = widths;
};

goog.scope(function() {
    var Paragraph = tpo.layout.Paragraph,
        Box = tpo.layout.Box,
        Glue = tpo.layout.Glue,
        Line = tpo.layout.Line,
        Penalty = tpo.layout.Penalty;

    /**
     * @param {number} tolerance
     * @return {Array.<tpo.layout.Line>}
     */
    Paragraph.prototype.makeLines = function(tolerance) {
      return [];
    };
});
