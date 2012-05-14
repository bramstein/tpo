goog.provide('tpo.util.Stream');

goog.require('tpo.util.Signal');
goog.require('tpo.util.array');

/**
 * @constructor
 */
tpo.util.Stream = function() {
    /**
     * @type {tpo.util.Signal}
     */
    this.data = new tpo.util.Signal();

    /**
     * @type {tpo.util.Signal}
     */
    this.error = new tpo.util.Signal();

    /**
     * @type {tpo.util.Signal}
     */
    this.end = new tpo.util.Signal();

    /**
     * @type {boolean}
     */
    this.readable = true;

    /**
     * @type {boolean}
     */
    this.writable = true;
};

goog.scope(function() {
    var Stream = tpo.util.Stream,
        array = tpo.util.array;

    /**
     * Pipes one stream into another.
     *
     * @param {tpo.util.Stream} destination
     */
    Stream.prototype.pipe = function(destination) {
        var source = this;

        function onData() {
            if (destination.writable) {
                destination.write.apply(destination, array.toArray(arguments));
            }
        }

        function onEnd() {
            destination.close();
        }

        function onError(err) {
            cleanup();
            if (this.size() === 0) {
                throw err;
            }
        }

        function cleanup() {
            source.data.remove(onData);
            source.error.remove(onError);
            source.end.remove(onEnd);
            source.end.remove(cleanup);

            destination.error.remove(onError);
            destination.end.remove(cleanup);
        }

        source.data.add(onData);
        source.error.add(onError);
        source.end.add(onEnd);
        source.end.add(cleanup);

        destination.error.add(onError);
        destination.end.add(cleanup);

        return destination;
    };

    /**
     * Write a value to the stream.
     *
     * @param {...*} var_args
     */
    Stream.prototype.write = function(var_args) {
    };

    /**
     * Closes the write stream.
     */
    Stream.prototype.close = function() {
    };
});
