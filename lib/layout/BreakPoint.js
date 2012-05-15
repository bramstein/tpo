goog.provide('tpo.layout.BreakPoint');
goog.provide('tpo.layout.RunningTotal');

/**
 * @typedef {{width: number, stretch: number, shrink: number}}
 */
tpo.layout.RunningTotal;

/**
 * @constructor
 * @param {number} position
 * @param {number} demerits
 * @param {number} ratio
 * @param {number} line
 * @param {number} fitness
 * @param {tpo.layout.RunningTotal?} totals
 * @param {tpo.layout.BreakPoint} previous
 */
tpo.layout.BreakPoint = function(position, demerits, ratio, line, fitness, totals, previous) {

    /**
     * @type {number}
     */
    this.position = position;

    /**
     * @type {number}
     */
    this.demerits = demerits;

    /**
     * @type {number}
     */
    this.ratio = ratio;

    /**
     * @type {number}
     */
    this.line = line;

    /**
     * @type {number}
     */
    this.fitness = fitness;

    /**
     * @type {tpo.layout.RunningTotal?}
     */
    this.totals = totals;

    /**
     * @type {tpo.layout.BreakPoint}
     */
    this.previous = previous;
};
