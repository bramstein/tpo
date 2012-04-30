goog.provide('tpo.text.BreakAction');

goog.require('tpo.util.Stream');
goog.require('tpo.text.Token');

/**
 * @constructor
 * @extends {tpo.util.Stream}
 */
tpo.text.BreakAction = function() {
    tpo.util.Stream.call(this);

    /**
     * @type {tpo.text.Token}
     */
    this.previousToken = null;

    /**
     * @type {tpo.util.DomPosition}
     */
    this.previousPosition = null;

    /**
     * @type {?tpo.text.Token.Class}
     */
    this.previousTokenClass = null;
};

goog.inherits(tpo.text.BreakAction, tpo.util.Stream);

/**
 * Break actions
 * @enum {number}
 */
tpo.text.BreakAction.Type = {
   // A line break opportunity exists between two adjacent
   // characters of the given line breaking classes
   DIRECT: 0,

   // A line break opportunity exists between two characters
   // of the given line breaking classes only if they are
   // separated by one or more spaces.
   INDIRECT: 1,

   COMBINING_INDIRECT: 2,

   COMBINING_PROHIBITED: 3,

   // No line break opportunity exists between two characters
   // of the given line breaking classes, even if they are
   // separated by one or more space characters.
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

    /**
     * @override
     */
    BreakAction.prototype.close = function() {
        if (this.previousToken) {
            this.previousToken.breakAction = BreakAction.Type.EXPLICIT;
            this.data.dispatch(this.previousPosition, this.previousToken);
        }
        this.end.dispatch();
    };

    /**
     * @param {!tpo.util.DomPosition} position
     * @param {!tpo.text.Token} token
     */
    BreakAction.prototype.write = function(position, token) {
        var breakAction = null;

        if (this.previousTokenClass) {
            if (token.tokenClass === Token.Class.SP) {
                this.previousToken.breakAction = BreakAction.Type.PROHIBITED;
            } else {
                breakAction = BreakAction.PairTable[this.previousTokenClass][token.tokenClass];

                if (breakAction === BreakAction.Type.INDIRECT) {
                    if (this.previousToken.tokenClass === Token.Class.SP) {
                        this.previousToken.breakAction = BreakAction.Type.INDIRECT;
                    } else {
                        this.previousToken.breakAction = BreakAction.Type.PROHIBITED;
                    }
                    this.previousTokenClass = token.tokenClass;
                } else if (breakAction === BreakAction.Type.COMBINING_PROHIBITED) {
                    this.previousToken.breakAction = BreakAction.Type.COMBINING_PROHIBITED;
                    if (this.previousToken.tokenClass === Token.Class.SP) {
                        this.previousTokenClass = token.tokenClass;
                    }
                } else if (breakAction = BreakAction.Type.COMBINING_INDIRECT) {
                    this.previousToken.breakAction = BreakAction.Type.PROHIBITED;
                    if (this.previousToken.tokenClass === Token.Class.SP) {
                        this.previousToken.breakAction = BreakAction.Type.COMBINING_INDIRECT;
                        this.previousTokenClass = token.tokenClass;
                    }
                }
            }
            this.data.dispatch(this.previousPosition, this.previousToken);
        } else {
            if (token.tokenClass === Token.Class.SP) {
                token.tokenClass = Token.Class.WJ;
            }
            this.previousTokenClass = token.tokenClass;
        }
        this.previousToken = token;
        this.previousPosition = position;
    };
});
