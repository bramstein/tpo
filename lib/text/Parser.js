goog.provide('tpo.text.Parser');

goog.require('tpo.util.Stream');
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
        DomPosition = tpo.util.DomPosition;

    /**
     * @param {Node} root
     */
    Parser.prototype.write = function(root) {
        var queue = [root],
            node = null,
            parent = null,
            nextSibling = null,
            j,
            len;

        while (queue.length !== 0) {
            node = queue.pop();

            if (node.nodeType === 3 && !/^\s*$/.test(node.textContent)) {
                parent = node.parentNode;
                nextSibling = node.nextSibling;

                parent.removeChild(node);

                this.data.dispatch(new DomPosition(parent, nextSibling), node.textContent);
            } else if (node.nodeType === 1) {
                for (j = 0, len = node.childNodes.length; j < len; j += 1) {
                    queue.push(node.childNodes[j]);
                }
            }
        }
    };

    /**
     * @override
     */
    Parser.prototype.close = function() {
        this.end.dispatch();
    };
});
