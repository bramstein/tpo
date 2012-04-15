goog.provide('tpo.text.Tokenizer');

/**
 * @constructor
 * @param {tpo.text.Language} language
 */
tpo.text.Tokenizer = function(language) {
    var that = this;

    /**
     * @private
     * @type {!Object.<tpo.text.Tokenizer.LineBreakClass, RegExp>}
     */
    this.tokens = language.tokens;
};

/**
 * Unicode Linebreaking classes
 * @enum {number}
 */
tpo.text.Tokenizer.LineBreakClass = {
    SP: -1,
    OP: 0,
    CL: 1,
    CP: 2,
    QU: 3,
    GL: 4,
    NS: 5,
    EX: 6,
    SY: 7,
    IS: 9,
    PR: 10,
    PO: 11,
    NU: 12,
    AL: 13,
    HL: 14,
    ID: 15,
    IN: 16,
    HY: 17,
    BA: 18,
    BB: 19,
    B2: 20,
    ZW: 21,
    CM: 22,
    WJ: 23,
    H2: 24,
    H3: 25,
    JL: 26,
    JV: 27,
    JT: 28
};

/**
 * Break actions
 * @enum {number}
 */
tpo.text.Tokenizer.BreakAction = {
   DIRECT_BREAK: 0,
   INDIRECT_BREAK: 1,
   COMBINING_INDIRECT_BREAK: 2,
   COMBINING_PROHIBITED_BREAK: 3,
   PROHIBITED_BREAK: 4,
   EXPLICIT_BREAK: 5
};

goog.scope(function() {
    var Tokenizer = tpo.text.Tokenizer,
        DI = Tokenizer.BreakAction.DIRECT_BREAK,
        IN = Tokenizer.BreakAction.INDIRECT_BREAK,
        CI = Tokenizer.BreakAction.COMBINING_INDIRECT_BREAK,
        CP = Tokenizer.BreakAction.COMBINING_PROHIBITED_BREAK,
        PR = Tokenizer.BreakAction.PROHIBITED_BREAK,
        EX = Tokenizer.BreakAction.EXPLICIT_BREAK;
    
    /**
     * Lookup table for break actions
     * @type {Array.<Array.<tpo.text.Tokenizer.BreakAction>>}
     * @const
     */
    Tokenizer.PairTable = [
        [PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, CP, PR, PR, PR, PR, PR, PR],
        [DI, PR, PR, IN, IN, PR, PR, PR, PR, IN, IN, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, PR, PR, PR, PR, IN, IN, IN, IN, IN, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [PR, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, IN, DI, IN, IN, DI, DI, PR, CI, PR, IN, IN, IN, IN, IN],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, DI, IN, PR, PR, PR, DI, DI, IN, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, DI, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, PR, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, PR, DI, DI, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, IN, IN, IN, IN, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, IN]
    ];

    Tokenizer.prototype.parse = function (str) {
        var that = this,
            result = [];
        
        str = str.replace(/\n/g, '');
        
        while(str) {
            Object.keys(that.tokens).forEach(function(c) {
                var m = that.tokens[c].exec(str);
                
                if (m) {
                    //result.push([c, m[0]]);
                    result.push(m[0]);
                    str = str.substring(m[0].length);
                }
            });
        }
        return result;
    };
});