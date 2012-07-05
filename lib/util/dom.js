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

tpo.util.dom.createElement = function(name) {
    return window.document.createElement(name);
};

/**
 * @param {!Element} element
 */
tpo.util.dom.empty = function(element) {
    var i = element.childNodes.length;

    while(i--) {
        element.removeChild(element.lastChild);
    }
};
