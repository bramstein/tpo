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

    Tokenizer.prototype.parse = function (str) {
        var that = this,
            classes = [],
            text = [],
            breaks = [],
            cls = null,
            breakAction = null,
            i = 0;
        
        str = str.replace(/\n/g, '');
        
        while(str) {
            Object.keys(that.tokens).forEach(function(breakClass) {
                var m = that.tokens[breakClass].exec(str);
                
                if (m) {
                    classes.push(parseInt(breakClass, 10));
                    text.push(m[0]);
                    str = str.substring(m[0].length);
                }
            });
        }

        cls = classes[0];

        breaks[0] = classes[0];

        if (cls === BreakClass.SP) {
            cls = BreakClass.WJ;
        }

        for (i = 1; i < classes.length; i += 1) {
            breaks[i - 1] = classes[i];

            if (classes[i] === BreakClass.SP) {
                breaks[i - 1] = BreakAction.PROHIBITED_BREAK;
                continue;
            }

            breakAction = Tokenizer.PairTable[cls][classes[i]];

            breaks[i - 1] = breakAction;

            if (breakAction === BreakAction.INDIRECT_BREAK) {
                if (classes[i - 1] === BreakClass.SP) {
                    breaks[i - 1] = BreakAction.INDIRECT_BREAK;
                } else {
                    breaks[i - 1] = BreakAction.PROHIBITED_BREAK;
                }
            } else if (breakAction === BreakAction.COMBINING_PROHIBITED_BREAK) {
                breaks[i - 1] += BreakAction.COMBINING_PROHIBITED_BREAK;
                if (classes[i - 1] !== BreakClass.SP) {
                    continue;
                }
            } else if (breakAction === BreakAction.COMBINING_INDIRECT_BREAK) {
                breaks[i - 1] = BreakAction.PROHIBITED_BREAK;
                if (classes[i - 1] === BreakClass.SP) {
                    breaks[i - 1] = BreakAction.COMBINING_INDIRECT_BREAK;
                } else {
                    continue;
                }
            }
            cls = classes[i];
        }

        breaks[i - 1] = BreakAction.EXPLICIT_BREAK;

        return text.map(function(t, i) {
            return t + '(' + breaks[i] + ')';
        });
    };
});