goog.provide('tpo.util.NodeTextStream');

goog.require('tpo.util.Stream');

/**
 * @constructor
 */
tpo.util.NodeTextStream = function() {
    tpo.util.Stream.call(this);
};

goog.inherits(tpo.util.NodeTextStream, tpo.util.Stream);

goog.scope(function() {
    var NodeTextStream = tpo.util.NodeTextStream;
    
    /**
     * @override
     * @param {Node} root
     */
    NodeTextStream.prototype.write = function(root) {
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
                
                this.data.dispatch(parent, nextSibling, node.textContent);
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
    NodeTextStream.prototype.close = function() {
        this.end.dispatch();
    };
});