goog.provide('tpo.layout.Penalty');

/**
 * @constructor
 * @param {number} width
 * @param {number} penalty
 * @param {number} flagged
 */
tpo.layout.Penalty = function(width, penalty, flagged) {
    /**
     * @type {number}
     * @const
     */
    this.width = width;

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
};
