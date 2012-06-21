goog.provide('tpo.layout.TextBlock');

/**
 * @param {!tpo.layout.TextRun} text
 * @param {number} width
 * @constructor
 */
tpo.layout.TextBlock = function(text, width) {

    this.text = text;

    this.width = width;

    this.start = -1;

    this.end = -1;
};
