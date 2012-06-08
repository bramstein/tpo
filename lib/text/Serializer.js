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

    /**
     * @type {Node}
     */
    this.previousParent = null;

    /**
     * @type {Node}
     */
    this.previousNextSibling = null;

    /**
     * @type {Node}
     */
    this.currentRuler = null;
};

goog.inherits(tpo.text.Serializer, tpo.util.Stream);

goog.scope(function() {
    var Serializer = tpo.text.Serializer,
        BreakAction = tpo.text.BreakAction,
        Token = tpo.text.Token;

    /**
     * @param {!tpo.util.DomPosition} position
     * @param {!tpo.text.Token} token
     */
    Serializer.prototype.write = function(position, token) {
        if (!this.previousParent || (this.previousParent !== position.parent || (this.previousParent === position.parent && this.previousNextSibling !== position.nextSibling))) {
            this.currentRuler = window.document.createElement('span');
            this.currentRuler.classList.add('ruler');

            this.previousParent = position.parent;
            this.previousNextSibling = position.nextSibling;

            position.parent.insertBefore(this.currentRuler, position.nextSibling);
        }

        var span = window.document.createElement('span');

        span.classList.add('box');

        if (token.breakAction !== null) {
            span.classList.add('br' + token.breakAction.toString());
        }

        if (Array.isArray(token.value) && token.value.length > 1) {
            token.value.forEach(function(v) {
                var subSpan = window.document.createElement('span');
                subSpan.classList.add('box');
                subSpan.textContent = v;
                span.appendChild(subSpan);
            });

            var hyphenSpan = window.document.createElement('span');
            hyphenSpan.textContent = '\u2010';
            hyphenSpan.classList.add('box');
            span.appendChild(hyphenSpan);
        } else if (token.tokenClass === Token.Class.SP) {
            span.textContent = '\u00A0';
        } else {
            span.textContent = token.value;
        }

        this.currentRuler.appendChild(span);
    };

    /**
     * @override
     */
    Serializer.prototype.close = function() {
        this.end.emit();
    };
});
