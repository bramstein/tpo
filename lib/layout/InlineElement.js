goog.provide('tpo.layout.InlineElement');

/**
 * @constructor
 * @param {!Element} element
 * @param {number} width
 * @param {number} height
 */
tpo.layout.InlineElement = function(element, width, height) {
    /**
     * @type {!Element}
     */
    this.element = element;

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
     * @type {boolean}
     * @const
     */
    this.isElement = true;
};
