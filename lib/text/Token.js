goog.provide('tpo.text.Token');

/**
 * @param {string|Array.<string>} value
 * @param {!tpo.text.Token.Class} tokenClass
 * @constructor
 */
tpo.text.Token = function(value, tokenClass) {
    /**
     * @type {string|Array.<string>}
     */
    this.value = value;

    /**
     * @type {!tpo.text.Token.Class}
     */
    this.tokenClass = tokenClass;


    /**
     * @type {?tpo.text.BreakAction.Type}
     */
    this.breakAction = null;
};

goog.scope(function() {
    var Token = tpo.text.Token;

    /**
     * Unicode Linebreaking classes
     * @enum {number}
     */
    Token.Class = {
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
        JT: 27,

        // Non-standard
        SP: 28,
        LF: 29,
        NL: 30,
        BK: 31,
        CR: 32
    };

    /**
     * @return {string}
     */
    Token.prototype.toString = function() {
        return '[' + Object.keys(this).map(function(key) {
            return key + '="' + (Array.isArray(this[key]) ? this[key].join('|') : this[key]) + '"';
        }, this).join(', ') + ']';
    };
});
