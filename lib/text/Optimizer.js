goog.provide('tpo.text.Optimizer');

goog.require('tpo.text.BreakAction');
goog.require('tpo.util.Stream');

/**
 * Optimizes a token stream by merging consecutive tokens with
 * the same break action and position.
 *
 * @constructor
 * @extends {tpo.util.Stream}
 */
tpo.text.Optimizer = function() {
    tpo.util.Stream.call(this);

    /**
     * @type {tpo.text.Token}
     */
    this.previousToken = null;

    /**
     *
     */
    this.previousPosition = null;
};

goog.inherits(tpo.text.Optimizer, tpo.util.Stream);

goog.scope(function() {
    var Optimizer = tpo.text.Optimizer,
        BreakAction = tpo.text.BreakAction;

    /**
     * @param {!tpo.util.DomPosition} position
     * @param {!tpo.text.Token} token
     */
    Optimizer.prototype.write = function (position, token) {
        if (this.previousPosition && this.previousToken) {
            if (this.previousPosition.parent === position.parent &&
                this.previousPosition.nextSibling === position.nextSibling &&
                this.previousToken.breakAction === BreakAction.Type.PROHIBITED &&
                token.breakAction === BreakAction.Type.PROHIBITED) {
                if (Array.isArray(this.previousToken.value) && Array.isArray(token.value)) {
                    this.previousToken.value[this.previousToken.value.length - 1] += token.value[0];
                    this.previousToken.value = this.previousToken.value.concat(token.value.slice(1));
                } else if (Array.isArray(this.previousToken.value)) {
                    this.previousToken.value[this.previousToken.value.length - 1] += token.value;
                } else if (Array.isArray(token.value)) {
                    this.previousToken.value = [this.previousToken.value + token.value[0]].concat(token.value.slice(1));
                } else {
                    this.previousToken.value += token.value;
                }
            } else {
                this.data.emit(this.previousPosition, this.previousToken);
                this.previousPosition = position;
                this.previousToken = token;
            }
        } else {
            this.previousPosition = position;
            this.previousToken = token;
        }
    };

    /**
     * @override
     */
    Optimizer.prototype.close = function() {
        if (this.previousPosition && this.previousToken) {
            this.data.emit(this.previousPosition, this.previousToken);
        }
        this.end.emit();
    };
});

