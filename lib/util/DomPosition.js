goog.provide('tpo.util.DomPosition');

/**
 * @constructor
 * @param {!Node} parent
 * @param {Node} nextSibling
 */
tpo.util.DomPosition = function(parent, nextSibling) {

    /**
     * @type {!Node}
     */
    this.parent = parent;
    
    /**
     * @type {Node}
     */
    this.nextSibling = nextSibling;
};