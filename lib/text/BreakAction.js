goog.provide('tpo.text.BreakAction');

goog.require('tpo.util.Stream');

/**
 * @constructor
 * @extends {tpo.util.Stream}
 */
tpo.text.BreakAction = function() {
    tpo.util.Stream.call(this);

    /**
     * @type {tpo.text.TokenizerStream.Class}
     */
    this.previousType = null;

    /**
     * @type {string}
     */
    this.previousValue = null;

    /**
     * @type {Node}
     */
    this.previousParent = null;

    /**
     * @type {Node}
     */
    this.previousNextSibling = null;
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
        BreakClass = tpo.text.Tokenizer.Class,
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
        if (this.previousType && this.previousValue) {
            this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, BreakAction.EXPLICIT);
        }
        this.end.dispatch();
    };

    /**
     * @param {Node} parent
     * @param {Node} nextSibling
     * @param {tpo.text.Tokenizer.LineBreakClass} type
     * @param {string} value
     * @override
     */
    BreakAction.prototype.write = function(parent, nextSibling, currentType, currentValue) {
        var breakAction = null;

        if (this.previousType) {
            if (currentType === BreakClass.SP) {
                this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, BreakAction.Type.PROHIBITED);
                return;
            }

            breakAction = BreakAction.PairTable[this.previousType][currentType];

            if (breakAction === BreakAction.INDIRECT) {
                if (this.previousType === BreakClass.SP) {
                    this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, BreakAction.INDIRECT);
                } else {
                    this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, BreakAction.PROHIBITED);
                }
            } else if (breakAction === BreakAction.COMBINING_PROHIBITED) {
                this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, BreakAction.COMBINING_PROHIBITED);
                if (this.previousType !== BreakClass.SP) {
                    return;
                }
            } else if (breakAction === BreakAction.COMBINING_INDIRECT) {
                if (this.previousType === BreakClass.SP) {
                    this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, BreakAction.COMBINING_INDIRECT);
                } else {
                    this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, BreakAction.PROHIBITED);
                    return;
                }
            } else {
                this.data.dispatch(this.previousParent, this.previousNextSibling, this.previousType, this.previousValue, breakAction);
            }
            this.previousType = currentType;
            this.previousValue = currentValue;
            this.previousParent = parent;
            this.previousNextSibling = nextSibling;
        } else {
            this.previousType = currentType;
            this.previousValue = currentValue;
            this.previousParent = parent;
            this.previousNextSibling = nextSibling;
            
            if (this.previousType === BreakClass.SP) {
                this.previousType = BreakClass.WJ;
            }
        }
    };
});