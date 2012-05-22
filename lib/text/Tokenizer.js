goog.provide('tpo.text.Tokenizer');

goog.require('tpo.util.Stream');

/**
 * @constructor
 * @extends {tpo.util.Stream}
 * @param {tpo.text.Language} language
 */
tpo.text.Tokenizer = function(language) {
    var that = this;
    tpo.util.Stream.call(that);

    /**
     * @private
     * @type {!Object.<tpo.text.Token.Class, RegExp>}
     */
    that.tokens = language.tokens;

    /**
     * @private
     * @type {Array.<tpo.text.Token.Class>}
     */
    that.tokenKeys = Object.keys(that.tokens).map(function(key) {
        return parseInt(key, 10);
    });
};

goog.inherits(tpo.text.Tokenizer, tpo.util.Stream);

goog.scope(function() {
    var Tokenizer = tpo.text.Tokenizer;

    /**
     * @param {tpo.util.DomPosition} position
     * @param {string} str
     */
    Tokenizer.prototype.write = function(position, str) {
        var that = this,
            result = [];

        while (str) {
            that.tokenKeys.forEach(function (tokenClass) {
                var m = that.tokens[tokenClass].exec(str);

                if (m) {
                    that.data.emit(position, new tpo.text.Token(m[0], tokenClass));
                    str = str.substring(m[0].length);
                }
            });
        }
    };

    /**
     * @override
     */
    Tokenizer.prototype.close = function() {
        this.end.emit();
    };
});
