goog.provide('tpo.util.dom');

goog.require('tpo.util.array');

/**
 * @param {string} query
 * @param {Node} root
 * @return {Array.<Node>}
 */
tpo.util.dom.query = function(query, root) {
    if (!root) {
        root = window.document;
    }
    return tpo.util.array.toArray(root.querySelectorAll(query));
};

/**
 * @param {Node} root
 * @param {function(Node)} callback
 */
tpo.util.dom.walk = function(root, callback) {
    var queue = [root];

    while (queue.length) {
        var node = queue.pop();

        if (node.nodeType === 3 && !/^\s*$/.test(node.textContent)) {
            callback(node);
        } else if (node.nodeType === 1) {
            for (var j = node.childNodes.length - 1; j >= 0; j -= 1) {
                queue.push(node.childNodes[j]);
            }
        }
    }
};
