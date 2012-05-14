goog.provide('tpo.util.Signal');

goog.require('tpo.util.array');

/**
 * @constructor
 */
tpo.util.Signal = function() {
    /**
     * @private
     * @type {Array.<function(...)>}
     */
    this.listeners = [];

    /**
     * @type {boolean}
     */
    this.active = true;
};

goog.scope(function() {
    var array = tpo.util.array,
        Signal = tpo.util.Signal;

    /**
     * Add a new listener.
     *
     * @param {function(...)} listener
     * @return {function(...)}
     */
    Signal.prototype.add = function(listener) {
        this.listeners.push(listener);
        return listener;
    };

    /**
     * Returns true if this event has the specified listener.
     *
     * @param {function(...)} listener
     * @return {boolean}
     */
    Signal.prototype.has = function(listener) {
        return this.listeners.indexOf(listener) !== -1;
    };

    /**
     * Remove the specified listener.
     *
     * @param {function(...)} listener
     * @return {function(...)}
     */
    Signal.prototype.remove = function(listener) {
        var i = this.listeners.indexOf(listener);
        if (i !== -1) {
            this.listeners.splice(i, 1);
        }
        return listener;
    };

    /**
     * Remove all listeners.
     */
    Signal.prototype.removeAll = function() {
        this.listeners = [];
    };

    /**
     * Returns the number of listeners
     *
     * @return {number}
     */
    Signal.prototype.size = function() {
        return this.listeners.length;
    };

    /**
     * Emit an event to all listeners.
     *
     * @param {...*} var_args Any number of arguments.
     */
    Signal.prototype.emit = function(var_args) {
        var args = array.toArray(arguments),
            listeners = [].concat(this.listeners);

        listeners.forEach(function(listener) {
            if (this.active) {
                listener.apply(this, args);
            }
        }, this);
    };
});
