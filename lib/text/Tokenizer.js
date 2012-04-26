goog.provide('tpo.text.Tokenizer');

goog.require('tpo.util.Stream');
goog.require('tpo.text.Token');

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
     * @type {!Object.<tpo.text.Tokenizer.Class, RegExp>}
     */
    that.tokens = language.tokens;

    /**
     * @private
     * @type {Array.<tpo.text.Tokenizer.Class>}
     */
    that.tokenKeys = Object.keys(that.tokens);
};

goog.inherits(tpo.text.Tokenizer, tpo.util.Stream);

goog.scope(function() {
    var Tokenizer = tpo.text.Tokenizer;

    /**
     * Unicode Linebreaking classes
     * @enum {number}
     */
    Tokenizer.Class = {
        SP: -1,
        OP: 0,
        CL: 1,
        CP: 2,
        QU: 3,
        GL: 4,
        NS: 5,
        EX: 6,
        SY: 7,
        IS: 8,
        PR: 9,
        PO: 10,
        NU: 11,
        AL: 12,
        HL: 13,
        ID: 14,
        IN: 15,
        HY: 16,
        BA: 17,
        BB: 18,
        B2: 19,
        ZW: 20,
        CM: 21,
        WJ: 22,
        H2: 23,
        H3: 24,
        JL: 25,
        JV: 26,
        JT: 27
    };

    /**
     * @param {tpo.util.DomPosition} position
     * @param {string} str
     */
    Tokenizer.prototype.write = function(position, str) {
        var that = this,
            result = [];

        str = str.replace(/\n/g, '');

        while (str) {
            that.tokenKeys.forEach(function (breakClass) {
                var m = that.tokens[breakClass].exec(str);

                if (m) {
                    that.data.dispatch(position, new tpo.text.Token(m[0], parseInt(breakClass, 10)));
                    str = str.substring(m[0].length);
                }
            });
        }
    };

    /**
     * @override
     */
    Tokenizer.prototype.close = function() {
        this.end.dispatch();
    };
});
