goog.provide('tpo.text.Parser');

goog.require('tpo.util.Stream');
goog.require('tpo.util.dom');
goog.require('tpo.util.DomPosition');

/**
 * @constructor
 * @extends {tpo.util.Stream}
 */
tpo.text.Parser = function() {
    tpo.util.Stream.call(this);
};

goog.inherits(tpo.text.Parser, tpo.util.Stream);

goog.scope(function() {
    var Parser = tpo.text.Parser,
        dom = tpo.util.dom,
        DomPosition = tpo.util.DomPosition;

    /**
     * @param {Node} root
     */
    Parser.prototype.write = function(root) {
        var that = this;

        dom.walk(root, function(node) {
            var parent = node.parentNode,
                nextSibling = node.nextSibling;

            parent.removeChild(node);

            that.data.emit(new DomPosition(parent, nextSibling), node.textContent);
        });
    };

    /**
     * @override
     */
    Parser.prototype.close = function() {
        this.end.emit();
    };
});
