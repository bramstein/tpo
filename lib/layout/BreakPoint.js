goog.provide('tpo.layout.BreakPoint');

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
 * @param {number} fitnessClass
 * @param {tpo.layout.RunningTotal} totals
 * @param {tpo.layout.BreakPoint} previous
 */
tpo.layout.BreakPoint = function(position, demerits, ratio, line, fitnessClass, totals, previous) {

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
     * @type {tpo.layout.RunningTotal}
     */
    this.totals = totals || {
        width: 0,
        stretch: 0,
        shrink: 0
    };
    
    /**
     * @type {tpo.layout.BreakPoint}
     */
    this.previous = previous;
};