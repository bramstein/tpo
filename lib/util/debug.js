goog.provide('tpo.util.debug');

goog.require('tpo.util.Stream');
goog.require('tpo.util.array');

/**
 * @constructor
 * @extends {tpo.util.Stream}
 */
var DebugStream = function() {
    tpo.util.Stream.call(this);

    this.data.add(function() {
        tpo.util.debug.info('DebugStream#data: ', arguments);
    });

    this.end.add(function() {
        tpo.util.debug.info('DebugStream#end');
    });

    this.error.add(function(err) {
        tpo.util.debug.info('DebugStream#error: ', err);
    });

    /**
     * @override
     */
    this.write = function() {
        tpo.util.debug.info('DebugStream#write: ', arguments[0].toString());
    };

    this.close = function() {
        tpo.util.debug.info('DebugStream#close');
    };
};

goog.inherits(DebugStream, tpo.util.Stream);

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
     * @type {Object}
     */
    debug.timers = {};

    /**
     * @private
     * @return {string}
     */
    debug.timestamp = function() {
        return ((goog.now() - debug.startup) / 1000).toFixed(3);
    }

    /**
     * @param {string} name
     */
    debug.time = function(name) {
        if (goog.DEBUG) {
            debug.timers[name] = (new Date()).getTime();
        }
    };

    /**
     * @param {string} name
     */
    debug.timeEnd = function(name) {
        if (goog.DEBUG) {
            if (debug.timers[name]) {
                var before = debug.timers[name],
                    time = ((new Date()).getTime() - before);

                window.console.log.apply(window.console, ['[%ss] %s: %ims', debug.timestamp(), name, time]);

                delete debug.timers[name];
            }
        }
    };

    debug.profile = function(name) {
        if (goog.DEBUG) {
            window.console.profile(name);
        }
    };

    debug.profileEnd = function() {
        if (goog.DEBUG) {
            window.console.profileEnd();
        }
    };

    /**
     * @param {...*} var_args
     */
    debug.info = function(var_args) {
        if (goog.DEBUG) {
            window.console.log.apply(window.console, ['[%ss]', debug.timestamp()].concat(array.toArray(arguments)));
        }
    };

    /**
     * @param {...*} var_args
     */
    debug.warn = function(var_args) {
        if (goog.DEBUG) {
            window.console.warn.apply(window.console, ['[%ss]', debug.timestamp()].concat(array.toArray(arguments)));
        }
    };

    /**
     * @param {...*} var_args
     */
    debug.error = function(var_args) {
        if (goog.DEBUG) {
            window.console.error.apply(window.console, ['[%ss]', debug.timestamp()].concat(array.toArray(arguments)));
        }
    };

    /**
     * @return {tpo.util.Stream}
     */
    debug.createDebugStream = function() {
        if (goog.DEBUG) {
            return new DebugStream();
        }
        return null;
    };
});
