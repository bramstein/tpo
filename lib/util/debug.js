goog.provide('tpo.util.debug');

goog.scope(function() {
    var debug = tpo.util.debug;
    
    debug.startup = goog.now();

    function timestamp() {
        return (goog.now() - debug.startup).toFixed(3) / 1000;
    }

    debug.info = function(msg) {
        if (goog.DEBUG) {
            window.console.log('[%ss] %s', timestamp(), msg);
        }
    };
    
    debug.warn = function(msg) {
        if (goog.DEBUG) {
            window.console.warn('[%ss] %s', timestamp(), msg);
        }
    };
    
    debug.error = function(msg) {
        if (goog.DEBUG) {
            window.console.error('[%ss] %s', timestamp(), msg);
        }
    };
});