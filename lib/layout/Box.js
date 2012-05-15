goog.provide('tpo.layout.Box');

/**
 * @constructor
 * @param {string} value
 * @param {number} width
 */
tpo.layout.Box = function(width, value) {
    /**
     * @type {string}
     * @const
     */
    this.value = value;

    /**
     * @type {number}
     * @const
     */
    this.width = width;
};
