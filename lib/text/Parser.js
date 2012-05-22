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

        var queue = [root];

        while (queue.length) {
            var node = queue.pop();

            if (node.nodeType === 3 && !/^\s*$/.test(node.textContent)) {
                var parent = node.parentNode,
                    nextSibling = node.nextSibling;

                parent.removeChild(node);

                that.data.emit(new DomPosition(parent, nextSibling), node.textContent);
            } else if (node.nodeType === 1) {
                if (node.childNodes.length === 0 && node.nodeName === 'BR') {
                    var parent = node.parentNode,
                        nextSibling = node.nextSibling;

                    parent.removeChild(node);

                    that.data.emit(new DomPosition(parent, nextSibling), '\u0085');
                } else {
                    for (var j = node.childNodes.length - 1; j >= 0; j -= 1) {
                        queue.push(node.childNodes[j]);
                    }
                }
            }
        }
    };

    /**
     * @override
     */
    Parser.prototype.close = function() {
        this.end.emit();
    };
});
