goog.provide('tpo.layout.Box');

/**
 * @constructor
 * @param {!tpo.util.DomPosition} position
 * @param {string} value
 * @param {number} width
 */
tpo.layout.Box = function(position, width, height, value) {
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
     * @type {string}
     * @const
     */
    this.value = value;

    /**
     * @type {boolean}
     * @const
     */
    this.isBox = true;
};
