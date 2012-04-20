goog.provide('tpo.util.debug');

goog.require('tpo.util.array');

goog.scope(function() {
    var debug = tpo.util.debug,
        array = tpo.util.array;
    
    debug.startup = goog.now();

    function timestamp() {
        return (goog.now() - debug.startup).toFixed(3) / 1000;
    }

    debug.info = function() {
        if (goog.DEBUG) {
            window.console.log.apply(window.console, ['[%ss]', timestamp()].concat(array.toArray(arguments)));
        }
    };
    
    debug.warn = function() {
        if (goog.DEBUG) {
            window.console.warn.apply(window.console, ['[%ss]', timestamp()].concat(array.toArray(arguments)));
        }
    };
    
    debug.error = function() {
        if (goog.DEBUG) {
            window.console.error.apply(window.console, ['[%ss]', timestamp()].concat(array.toArray(arguments)));
        }
    };
});