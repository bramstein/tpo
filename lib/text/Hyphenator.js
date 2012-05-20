goog.provide('tpo.text.Hyphenator');

goog.require('tpo.text.Language');
goog.require('tpo.text.Token');
goog.require('tpo.util.Stream');

/**
 * Hyphenation engine.
 * @extends {tpo.util.Stream}
 * @constructor
 * @param {!tpo.text.Hyphenation} hyphenation engine
 * @param {number=} minLength the minimum word length to hyphenate
 */
tpo.text.Hyphenator = function(hyphenation, minLength) {
    tpo.util.Stream.call(this);

    /**
     * @type {!tpo.text.Hyphenation}
     */
    this.hyphenation = hyphenation;

    /**
     * @type {number}
     * @const
     */
    this.minLength = minLength || 6;
};

goog.inherits(tpo.text.Hyphenator, tpo.util.Stream);

goog.scope(function() {
    var Hyphenator = tpo.text.Hyphenator,
        Token = tpo.text.Token;

    /**
     * @param {!tpo.util.DomPosition} position
     * @param {!tpo.text.Token} token
     */
    Hyphenator.prototype.write = function(position, token) {
        var that = this;

        // TODO: This doesn't support languages that hyphenate in a non-standard way,
        // e.g. the Dutch word `omaatje` should be hyphenated as `oma-tje`.
        if (token.value.length > this.minLength && !Array.isArray(token.value)) {
            var parts = that.hyphenation.hyphenate(/** @type {string} */ (token.value));

            if (parts.length !== 0) {
                token.value = parts;
            }
        }
        that.data.emit(position, token);
    };

    /**
     * @override
     */
    Hyphenator.prototype.close = function() {
        this.end.emit();
    };
});
