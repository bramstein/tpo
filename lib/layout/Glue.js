goog.provide('tpo.layout.Glue');

/**
 * @constructor
 * @param {number} width
 * @param {number} stretch
 * @param {number} shrink
 */
tpo.layout.Glue = function(width, stretch, shrink) {
    /**
     * @type {number}
     * @const
     */
    this.width = width;

    /**
     * @type {number}
     * @const
     */
    this.stretch = stretch;

    /**
     * @type {number}
     * @const
     */
    this.shrink = shrink;
};
