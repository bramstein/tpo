goog.provide('tpo.layout.Line');

/**
 * @constructor
 * @param {Array.<tpo.layout.Box|tpo.layout.Glue|tpo.layout.Penalty>} nodes
 * @param {number} ratio
 * @param {number} width
 */
tpo.layout.Line = function(nodes, ratio, width) {
    this.nodes = nodes;

    this.ratio = ratio;

    this.width = width;
};
