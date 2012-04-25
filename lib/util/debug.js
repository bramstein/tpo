goog.provide('tpo.util.debug');

goog.require('tpo.util.array');

goog.scope(function() {
    var debug = tpo.util.debug,
        array = tpo.util.array;
    
    /**
     * @private
     * @type {number}
     */
    debug.startup = goog.now();

    /**
     * @private
     * @return {number}
     */
    function timestamp() {
        return (goog.now() - debug.startup).toFixed(3) / 1000;
    }

    /**
     * @param {...*} var_args
     */
    debug.info = function(var_args) {
        if (goog.DEBUG) {
            window.console.log.apply(window.console, ['[%ss]', timestamp()].concat(array.toArray(arguments)));
        }
    };
    
    /**
     * @param {...*} var_args
     */
    debug.warn = function(var_args) {
        if (goog.DEBUG) {
            window.console.warn.apply(window.console, ['[%ss]', timestamp()].concat(array.toArray(arguments)));
        }
    };
    
    /**
     * @param {...*} var_args
     */
    debug.error = function(var_args) {
        if (goog.DEBUG) {
            window.console.error.apply(window.console, ['[%ss]', timestamp()].concat(array.toArray(arguments)));
        }
    };
});