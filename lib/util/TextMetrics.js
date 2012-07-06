goog.provide('tpo.util.TextMetrics');

/**
 * @constructor
 * @param {!Element} el
 */
tpo.util.TextMetrics = function(el) {
    /**
     * @type {!Object}
     */
    this.charWidth = {};

    /**
     * @type {!Object}
     */
    this.charHeight = {};

    /**
     * @type {!Object}
     */
    this.cache = {};

    this.buildLookupCache(el);
};

goog.scope(function() {
    var TextMetrics = tpo.util.TextMetrics;

    /**
     * @private
     * @param {!Element} el
     */
    TextMetrics.prototype.buildLookupCache = function(el) {
        var nodes = el.childNodes;

        for (var i = 0; i < nodes.length; i += 1) {
            var text = nodes[i].textContent,
                width = nodes[i].clientWidth,
                height = nodes[i].clientHeight;

            this.charWidth[text] = width;
            this.charHeight[text] = height;
        }
    };

    /**
     * @param {string} word
     * @return {{width: number, height: number}}
     */
    TextMetrics.prototype.lookup = function(word) {
        if (this.cache.hasOwnProperty(word)) {
            return this.cache[word];
        }

        var width = 0,
            height = 0,
            len = word.length;

        for (var i = 0; i < len; i += 1) {
            if (i === len - 1) {
                width += this.charWidth[word[i]];
                height = Math.max(height, this.charHeight[word[i]]);
            } else {
                width += this.charWidth[word[i] + word[i + 1]] - this.charWidth[word[i + 1]];
                height = Math.max(height, this.charHeight[word[i] + word[i + 1]]);
            }
        }

        this.cache[word] = { width: width, height: height };

        return this.cache[word];
    };
});
