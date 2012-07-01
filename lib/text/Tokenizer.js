goog.provide('tpo.text.Tokenizer');

goog.require('tpo.text.Token');

/**
 * @constructor
 * @param {tpo.text.Language} language
 */
tpo.text.Tokenizer = function(language) {
    /**
     * @private
     * @type {!Object.<tpo.text.Token.Class, RegExp>}
     */
    this.tokens = language.tokens;

    /**
     * @private
     * @type {Array.<tpo.text.Token.Class>}
     */
    this.tokenKeys = Object.keys(this.tokens).map(function(key) {
        return parseInt(key, 10);
    });
};

goog.inherits(tpo.text.Tokenizer, tpo.util.Stream);

goog.scope(function() {
    var Tokenizer = tpo.text.Tokenizer,
        Token = tpo.text.Token;

    /**
     * @param {string} str
     * @return {Array.<tpo.text.Token>}
     */
    Tokenizer.prototype.parse = function(str) {
        var result = [];

        while (str) {
            for (var i = 0; i < this.tokenKeys.length; i += 1) {
                var m = this.tokens[this.tokenKeys[i]].exec(str);

                if (m) {
                    result.push(new Token(m[0], this.tokenKeys[i]));
                    str = str.substring(m[0].length);
                }
            }
        }

        return result;
    };
});
