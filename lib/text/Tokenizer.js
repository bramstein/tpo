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
 * Break actions
 * @enum {number}
 */
tpo.text.Tokenizer.BreakAction = {
   // A line break opportunity exists between two adjacent
   // characters of the given line breaking classes
   DIRECT_BREAK: 0,

   // A line break opportunity exists between two characters
   // of the given line breaking classes only if they are
   // separated by one or more spaces.
   INDIRECT_BREAK: 1,

   COMBINING_INDIRECT_BREAK: 2,

   COMBINING_PROHIBITED_BREAK: 3,

   // No line break opportunity exists between two characters
   // of the given line breaking classes, even if they are
   // separated by one or more space characters.
   PROHIBITED_BREAK: 4,

   // A line must break following a character that has the
   // mandatory break property.
   EXPLICIT_BREAK: 5
};

goog.scope(function() {
    var Tokenizer = tpo.text.Tokenizer,
        BreakClass = Tokenizer.LineBreakClass,
        BreakAction = Tokenizer.BreakAction,
        DI = BreakAction.DIRECT_BREAK,
        IN = BreakAction.INDIRECT_BREAK,
        CI = BreakAction.COMBINING_INDIRECT_BREAK,
        CP = BreakAction.COMBINING_PROHIBITED_BREAK,
        PR = BreakAction.PROHIBITED_BREAK,
        EX = BreakAction.EXPLICIT_BREAK;
    
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

    /**
     * Tokenizes and classifies each token into line breaking classes.
     *
     * @param {string} str
     * @param {boolean} inline Whether the text comes from an inline element.
     * @return {Array.<{type: tpo.text.Tokenizer.LineBreakClass, value: string}>}
     */
    Tokenizer.prototype.parse = function (str, inline) {
        var that = this,
            result = [];
        
        str = str.replace(/\n/g, '');
        
        while(str) {
            Object.keys(that.tokens).forEach(function(breakClass) {
                var m = that.tokens[breakClass].exec(str);
                
                if (m) {
                    result.push({
                        type: parseInt(breakClass, 10),
                        value: m[0]
                    });
                    str = str.substring(m[0].length);
                }
            });
        }
        return that.findBreakActions(result, inline);
    };

    /**
     * Assigns line breaking actions to each token.
     *
     * @private
     * @param {Array.<{type: tpo.text.Tokenizer.LineBreakClass, value: string }>} tokens
     * @param {boolean} inline
     * @return {Array.<{type: tpo.text.Tokenizer.LineBreakClass, value: string, action: tpo.text.Tokenizer.BreakAction}>}
     */
    Tokenizer.prototype.findBreakActions = function (tokens, inline) {
        var cls = null,
            breakAction = null,
            restoreSpace = false,
            i = 0;

        cls = tokens[0];

        tokens[0].breakAction = tokens[0].type;

        if (cls.type === BreakClass.SP) {
            cls.type = BreakClass.WJ;
            restoreSpace = true;
        }

        for (i = 1; i < tokens.length; i += 1) {
            tokens[i - 1].breakAction = tokens[i].type;

            if (tokens[i].type === BreakClass.SP) {
                tokens[i - 1].breakAction = BreakAction.PROHIBITED_BREAK;
                continue;
            }

            breakAction = Tokenizer.PairTable[cls.type][tokens[i].type];

            tokens[i - 1].breakAction = breakAction;

            if (breakAction === BreakAction.INDIRECT_BREAK) {
                if (tokens[i - 1].type === BreakClass.SP) {
                    tokens[i - 1].breakAction = BreakAction.INDIRECT_BREAK;
                } else {
                    tokens[i - 1].breakAction = BreakAction.PROHIBITED_BREAK;
                }
            } else if (breakAction === BreakAction.COMBINING_PROHIBITED_BREAK) {
                tokens[i - 1].breakAction = BreakAction.COMBINING_PROHIBITED_BREAK;
                if (tokens[i - 1].type !== BreakClass.SP) {
                    continue;
                }
            } else if (breakAction === BreakAction.COMBINING_INDIRECT_BREAK) {
                tokens[i - 1].breakAction = BreakAction.PROHIBITED_BREAK;
                if (tokens[i - 1].type === BreakClass.SP) {
                    tokens[i - 1].breakAction = BreakAction.COMBINING_INDIRECT_BREAK;
                } else {
                    continue;
                }
            }
            cls = tokens[i];
        }

        if (inline && restoreSpace) {
            tokens[0].type = BreakClass.SP;
            tokens[0].breakAction = BreakAction.INDIRECT_BREAK;
        }

        if (inline) {
            tokens[i - 1].breakAction = BreakAction.PROHIBITED_BREAK;
        } else {
            tokens[i - 1].breakAction = BreakAction.EXPLICIT_BREAK;
        }
        return tokens;
    };
});