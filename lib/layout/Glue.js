goog.provide('tpo.layout.Glue');

/**
 * @constructor
 * @param {!tpo.util.DomPosition} position
 * @param {number} width
 * @param {number} stretch
 * @param {number} shrink
 */
tpo.layout.Glue = function(position, width, height, stretch, shrink) {
    /**
     * @type {!tpo.util.DomPosition}
     */
    this.position = position;

    /**
     * @type {number}
     * @const
     */
    this.width = width;

    /**
     * @type {number}
     * @const
     */
    this.height = height;

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

    /**
     * @type {boolean}
     * @const
     */
    this.isGlue = true;
};
