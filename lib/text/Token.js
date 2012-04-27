goog.provide('tpo.text.Token');

/**
 * @constructor
 */
tpo.text.Token = function(value, breakClass) {
    /**
     * @type {string}
     */
    this.value = value;

    /**
     * @type {!tpo.text.Tokenizer.Class}
     */
    this.breakClass = breakClass;
    

    /**
     * @type {?tpo.text.BreakAction.Type}
     */
    this.breakAction = null;
};
