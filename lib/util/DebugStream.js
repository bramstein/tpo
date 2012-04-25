goog.provide('tpo.util.DebugStream');

goog.require('tpo.util.Stream');
goog.require('tpo.util.debug');

/**
 * @constructor
 * @extends {tpo.util.Stream}
 */
tpo.util.DebugStream = function() {
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
        tpo.util.debug.info('DebugStream#write: ', arguments);
    };
    
    this.close = function() {
        tpo.util.debug.info('DebugStream#close');
    };
};

goog.inherits(tpo.util.DebugStream, tpo.util.Stream);