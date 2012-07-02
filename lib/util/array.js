goog.provide('tpo.util.array');

/**
 * Convert an array like object to an array.
 *
 * @param {!{length}} o
 * @return {!Array}
 */
tpo.util.array.toArray = function(o) {
    return Array.prototype.slice.call(o, 0);
};

/**
 * Append one array to another
 * @param {!Array} a
 * @param {!Array} b
 * @return {!Array}
 */
tpo.util.array.append = function(a, b) {
    a.push.apply(a, b);
    return a;
};
