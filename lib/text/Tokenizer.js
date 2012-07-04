goog.provide('tpo.text.Tokenizer');

goog.require('tpo.text.Token');
goog.require('tpo.text.Hyphenation');

/**
 * @constructor
 * @param {tpo.text.languages.Language} language
 */
tpo.text.Tokenizer = function(language) {
    /**
     * @private
     * @type {!Object.<tpo.text.Token.Class, RegExp>}
     */
    this.tokens = language.tokens;

    /**
     * @private
     * @type {!tpo.text.Hyphenation}
     */
    this.hyphenator = new tpo.text.Hyphenation(language);

    /**
     * @private
     * @type {Array.<tpo.text.Token.Class>}
     */
    this.tokenKeys = Object.keys(this.tokens).map(function(key) {
        return parseInt(key, 10);
    });
};

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
                var tokenClass = this.tokenKeys[i],
                    m = this.tokens[tokenClass].exec(str);

                if (m) {
                    var word = m[0],
                        tokens = [word];

                    if (word.length > 6) {
                        var parts = this.hyphenator.hyphenate(word);

                        if (parts.length > 1) {
                            tokens = parts;
                        }
                    }

                    for (var j = 0; j < tokens.length; j += 1) {
                        result.push(new Token(tokens[j], tokenClass));
                        if (tokens.length !== 1 && j < tokens.length - 1) {
                            result.push(new Token('\u00AD', Token.Class.BA));
                        }
                    }
                    str = str.substring(word.length);
                }
            }
        }

        return result;
    };
});
