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

    this.info = {
        br0: 0,
        br1: 0,
        br2: 0,
        br3: 0,
        br4: 0,
        br5: 0,
        hy: 0
    };
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
        var that = this;

        if (!this.previousParent || (this.previousParent !== position.parent || (this.previousParent === position.parent && this.previousNextSibling !== position.nextSibling))) {
            if (this.currentRuler) {
                var values = Object.keys(this.info).map(function(key) {
                    return that.info[key];
                });
                that.currentRuler.setAttribute('data-size', values.join(','));

                this.info = {
                    br0: 0,
                    br1: 0,
                    br2: 0,
                    br3: 0,
                    br4: 0,
                    br5: 0,
                    hy: 0
                };
            }

            this.currentRuler = window.document.createElement('span');
            this.currentRuler.classList.add('text');

            this.previousParent = position.parent;
            this.previousNextSibling = position.nextSibling;

            position.parent.insertBefore(this.currentRuler, position.nextSibling);
        }


        if (Array.isArray(token.value) && token.value.length > 1) {
            var span = window.document.createElement('span');
            token.value.forEach(function(v, i) {
                var subSpan = window.document.createElement('span');
                subSpan.classList.add('br' + token.breakAction.toString());
                subSpan.textContent = v;
                that.currentRuler.appendChild(subSpan);
                that.info['br' + token.breakAction] += 1;

                if (i < token.value.length - 1) {
                    var hyphenSpan = window.document.createElement('span');
                    hyphenSpan.textContent = '\u2010';
                    hyphenSpan.classList.add('hy');
                    that.currentRuler.appendChild(hyphenSpan);
                    that.info['hy'] += 1;
                }
            });
        } else if (token.tokenClass === Token.Class.SP) {
            var span = window.document.createElement('span');
            span.classList.add('br' + token.breakAction.toString());
            span.textContent = '\u00A0';
            this.currentRuler.appendChild(span);
            that.info['br' + token.breakAction] += 1;
        } else {
            var span = window.document.createElement('span');
            span.classList.add('br' + token.breakAction.toString());
            span.textContent = token.value;
            this.currentRuler.appendChild(span);
            that.info['br' + token.breakAction] += 1;
        }
    };

    /**
     * @override
     */
    Serializer.prototype.close = function() {
        var that = this;

        var values = Object.keys(this.info).map(function(key) {
            return that.info[key];
        });
        this.currentRuler.setAttribute('data-size', values.join(','));
        this.end.emit();
    };
});
