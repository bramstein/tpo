goog.provide('tpo.util.LinkedList');

goog.require('tpo.util.LinkedListNode');

/**
 * @constructor
 */
tpo.util.LinkedList = function() {

    /**
     * @type {tpo.util.LinkedListNode}
     * @private
     */
    this.head = null;

    /**
     * @type {tpo.util.LinkedListNode}
     * @private
     */
    this.tail = null;

    /**
     * @type {number}
     * @private
     */
    this.size = 0;
};

goog.scope(function() {
    var List = tpo.util.LinkedList,
        Node = tpo.util.LinkedListNode;

    /**
     * @private
     * @param {tpo.util.LinkedListNode} node
     * @return {boolean}
     */
    List.prototype.isLinked = function(node) {
        return !((node && node.prev === null &&
                  node.next === null &&
                  this.first() !== node &&
                  this.last() !== node) ||
                  this.isEmpty());
    };

    /**
     * @return {number}
     */
    List.prototype.getSize = function() {
        return this.size;
    };

    /**
     * @return {boolean}
     */
    List.prototype.isEmpty = function() {
        return this.size === 0;
    };

    /**
     * @return {tpo.util.LinkedListNode}
     */
    List.prototype.first = function() {
        return this.head;
    };

    /**
     * @return {tpo.util.LinkedListNode}
     */
    List.prototype.last = function() {
        return this.tail;
    };

    /**
     * @return {Array.<tpo.util.LinkedListNode>}
     */
    List.prototype.toArray = function() {
        var node = this.head,
            result = [];
        while (node !== null) {
            result.push(node);
            node = node.next;
        }
        return result;
    };

    /**
     * Note that modifying the list during iteration is not safe.
     * @param {function(!tpo.util.LinkedListNode)} fun
     */
    List.prototype.forEach = function(fun) {
        var node = this.first();
        while (node !== null) {
            fun(node);
            node = node.next;
        }
    };

    /**
     * @param {!tpo.util.LinkedListNode} n
     * @return {boolean}
     */
    List.prototype.contains = function(n) {
        var node = this.head;
        if (!this.isLinked(n)) {
            return false;
        }
        while (node !== null) {
            if (node === n) {
                return true;
            }
            node = node.next;
        }
        return false;
    };

    /**
     * @param {number} i
     * @return {tpo.util.LinkedListNode}
     */
    List.prototype.at = function(i) {
        var node = this.head,
            index = 0;

        if (i >= this.size || i < 0) {
            return null;
        }

        while (node !== null) {
            if (i === index) {
                return node;
            }
            node = node.next;
            index += 1;
        }
        return null;
    };

    /**
     * @param {tpo.util.LinkedListNode} node
     * @param {!tpo.util.LinkedListNode} newNode
     * @return {!tpo.util.LinkedListNode}
     */
    List.prototype.insertAfter = function(node, newNode) {
        if (!node) {
            this.head = this.tail = newNode;
            newNode.next = newNode.prev = null;
            this.size = 1;
        } else if (this.isLinked(node)) {
            newNode.prev = node;
            if (node.next === null) {
                this.tail = newNode;
            } else {
                newNode.next = node.next;
                node.next.prev = newNode;
            }
            node.next = newNode;
            this.size += 1;
        }
        return newNode;
    };

    /**
     * @param {tpo.util.LinkedListNode} node
     * @param {!tpo.util.LinkedListNode} newNode
     * @return {!tpo.util.LinkedListNode}
     */
    List.prototype.insertBefore = function(node, newNode) {
        if (!node) {
            this.head = this.tail = newNode;
            newNode.next = newNode.prev = null;
            this.size = 1;
        } else if (this.isLinked(node)) {
            newNode.next = node;
            if (node.prev === null) {
                this.head = newNode;
            } else {
                newNode.prev = node.prev;
                node.prev.next = newNode;
            }
            node.prev = newNode;
            this.size += 1;
        }
        return newNode;
    };

    /**
     * @param {!tpo.util.LinkedListNode} node
     * @return {!tpo.util.LinkedListNode}
     */
    List.prototype.unshift = function(node) {
        return this.insertBefore(this.head, node);
    };

    /**
     * @param {!tpo.util.LinkedListNode} node
     * @return {!tpo.util.LinkedListNode}
     */
    List.prototype.push = function(node) {
        return this.insertAfter(this.tail, node);
    };

    /**
     * @param {tpo.util.LinkedListNode} node
     * @return {tpo.util.LinkedListNode}
     */
    List.prototype.remove = function(node) {
        if (!node || !this.isLinked(node)) {
            return node;
        }

        if (node.prev === null) {
            this.head = node.next;
        } else {
            node.prev.next = node.next;
        }

        if (node.next === null) {
            this.tail = node.prev;
        } else {
            node.next.prev = node.prev;
        }

        this.size -= 1;
        node.prev = null;
        node.next = null;
        return node;
    };

    /**
     * @return {tpo.util.LinkedListNode}
     */
    List.prototype.pop = function() {
        return this.remove(this.tail);
    };

    /**
     * @return {tpo.util.LinkedListNode}
     */
    List.prototype.shift = function() {
        return this.remove(this.head);
    };
});
