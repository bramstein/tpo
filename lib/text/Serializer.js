goog.provide('tpo.text.Serializer');

goog.require('tpo.util.Stream');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.BreakAction');

/**
 * @constructor
 * @extends {tpo.util.Stream}
 */
tpo.text.Serializer = function() {
    tpo.util.Stream.call(this);
};

goog.inherits(tpo.text.Serializer, tpo.util.Stream);

goog.scope(function() {
    var Serializer = tpo.text.Serializer,
        Tokenizer = tpo.text.Tokenizer;

    /**
     * @param {!tpo.util.DomPosition} position
     * @param {!tpo.text.Token} token
     */
    Serializer.prototype.write = function(position, token) {
        var span = window.document.createElement('span');

        span.textContent = token.value;

        if (token.breakClass === Tokenizer.Class.SP) {
            span.classList.add('glue');
        } else {
            span.classList.add('box');
        }
        position.parent.insertBefore(span, position.nextSibling);
    };

    /**
     * @override
     */
    Serializer.prototype.close = function() {
        this.end.dispatch();
    };
});
