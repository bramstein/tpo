goog.provide('tpo.text.Serializer');

goog.require('tpo.util.Stream');
goog.require('tpo.text.Token');
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
        Token = tpo.text.Token;

    /**
     * @param {!tpo.util.DomPosition} position
     * @param {!tpo.text.Token} token
     */
    Serializer.prototype.write = function(position, token) {
        var span = window.document.createElement('span');

        span.setAttribute('data-break', token.breakAction.toString());

        if (Array.isArray(token.value) && token.value.length > 1) {
            token.value.forEach(function(v) {
                var subSpan = window.document.createElement('span');
                subSpan.textContent = v;
                span.appendChild(subSpan);
            });

            var hyphenSpan = window.document.createElement('span');
            hyphenSpan.textContent = '\u2010';
            span.appendChild(hyphenSpan);
        } else {
            span.textContent = token.value;
        }

        if (token.tokenClass === Token.Class.SP) {
            span.classList.add('glue');
            span.textContent = '\u00A0';
        } else {
            span.classList.add('box');
        }
        position.parent.insertBefore(span, position.nextSibling);
    };

    /**
     * @override
     */
    Serializer.prototype.close = function() {
        this.end.emit();
    };
});
