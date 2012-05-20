goog.provide('tpo.layout.Penalty');

/**
 * @constructor
 * @param {!tpo.util.DomPosition} position
 * @param {number} width
 * @param {number} penalty
 * @param {number} flagged
 */
tpo.layout.Penalty = function(position, width, height, penalty, flagged) {
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
    this.penalty = penalty;

    /**
     * @type {number}
     * @const
     */
    this.flagged = flagged;

    /**
     * @type {boolean}
     * @const
     */
    this.isPenalty = true;
};
