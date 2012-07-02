goog.provide('tpo.text.BreakAction');

goog.require('tpo.text.Token');

/**
 * @constructor
 */
tpo.text.BreakAction = function() {
};

/**
 * Break actions
 * @enum {number}
 */
tpo.text.BreakAction.Type = {
   // A line break opportunity exists between two adjacent
   // characters of the given line breaking classes.
   // Example: break before an em-dash
   DIRECT: 0,

   // A line break opportunity exists between two characters
   // of the given line breaking classes only if they are
   // separated by one or more spaces.
   // Example: two words separated by a space
   INDIRECT: 1,

   COMBINING_INDIRECT: 2,

   COMBINING_PROHIBITED: 3,

   // No line break opportunity exists between two characters
   // of the given line breaking classes, even if they are
   // separated by one or more space characters.
   // Example: non-breaking space
   PROHIBITED: 4,

   // A line must break following a character that has the
   // mandatory break property.
   EXPLICIT: 5
};

goog.scope(function() {
    var BreakAction = tpo.text.BreakAction,
        Token = tpo.text.Token,
        DI = BreakAction.Type.DIRECT,
        IN = BreakAction.Type.INDIRECT,
        CI = BreakAction.Type.COMBINING_INDIRECT,
        CP = BreakAction.Type.COMBINING_PROHIBITED,
        PR = BreakAction.Type.PROHIBITED,
        EX = BreakAction.Type.EXPLICIT;

    /**
     * Lookup table for break actions
     * @type {Array.<Array.<tpo.text.BreakAction.Type>>}
     * @const
     */
    BreakAction.PairTable = [
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

    BreakAction.prototype.find = function(tokens) {
        if (!tokens.length) {
            return;
        }

        var tokenClass = tokens[0].tokenClass;

        if (tokenClass === Token.Class.SP) {
            tokenClass = Token.Class.WJ;
        }

        if (tokenClass === Token.Class.LF || tokenClass === Token.Class.NL) {
            tokenClass = Token.Class.BK;
        }

        for (var i = 1; i < tokens.length; i += 1) {
            if (tokenClass === Token.Class.BK) {
                tokens[i - 1].breakAction = BreakAction.Type.EXPLICIT;
                tokenClass = tokens[i].tokenClass;
                continue;
            }

            if (tokens[i].tokenClass === Token.Class.BK ||
                tokens[i].tokenClass === Token.Class.NL ||
                tokens[i].tokenClass === Token.Class.LF) {
                tokens[i - 1].breakAction = BreakAction.Type.PROHIBITED;
                tokenClass = Token.Class.BK;
                continue;
            }

            if (tokens[i].tokenClass === Token.Class.CR) {
                tokens[i - 1].breakAction = BreakAction.Type.PROHIBITED;
                tokenClass = Token.Class.CR;
                continue;
            }

            if (tokens[i].tokenClass === Token.Class.SP) {
                tokens[i - 1].breakAction = BreakAction.Type.PROHIBITED;
                continue;
            }

            var breakAction = BreakAction.PairTable[tokenClass][tokens[i].tokenClass];

            tokens[i - 1].breakAction = breakAction;

            if (breakAction === BreakAction.Type.INDIRECT) {
                if (tokens[i - 1].tokenClass === Token.Class.SP) {
                    tokens[i - 1].breakAction = BreakAction.Type.INDIRECT;
                } else {
                    tokens[i - 1].breakAction = BreakAction.Type.PROHIBITED;
                }
            } else if (breakAction === BreakAction.Type.COMBINING_INDIRECT) {
                tokens[i - 1].breakAction = BreakAction.Type.PROHIBITED;
                if (tokens[i - 1].tokenClass === Token.Class.SP) {
                    tokens[i - 1].breakAction = BreakAction.Type.COMBINING_INDIRECT;
                } else {
                    continue;
                }
            } else if (breakAction === BreakAction.Type.COMBINING_PROHIBITED) {
                tokens[i - 1].breakAction = BreakAction.Type.COMBINING_PROHIBITED;
                if (tokens[i - 1].tokenClass !== Token.Class.SP) {
                    continue;
                }
            }

            tokenClass = tokens[i].tokenClass;
        }

        tokens[i - 1].breakAction = BreakAction.Type.EXPLICIT;
    };
});
