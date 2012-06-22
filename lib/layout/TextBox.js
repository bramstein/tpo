goog.provide('tpo.layout.TextBox');

/**
 * @param {!tpo.layout.TextRun} text
 * @param {number} width
 * @param {number} height
 * @param {Array.<number>} nodes
 * @constructor
 */
tpo.layout.TextBox = function(text, width, height, nodes) {

    /**
     * @type {!tpo.layout.TextRun}
     */
    this.text = text;

    /**
     * @type {number}
     */
    this.width = width;

    /**
     * @type {number}
     */
    this.height = height;

    /**
     * @type {Array.<number>}
     */
    this.nodes = nodes;
};
