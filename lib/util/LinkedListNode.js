goog.provide('tpo.util.LinkedListNode');

/**
 * @constructor
 * @param {*} value
 */
tpo.util.LinkedListNode = function (value) {
    /**
     * @type {tpo.util.LinkedListNode}
     */
    this.prev = null;
    
    /**
     * @type {tpo.util.LinkedListNode}
     */
    this.next = null;
    
    /**
     * @type {*}
     */
    this.value = value;
};