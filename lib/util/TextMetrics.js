goog.provide('tpo.util.TextMetrics');

/**
 * @constructor
 * @param {!Element} element
 */
tpo.util.TextMetrics = function(element) {
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

    this.buildLookupCache(element);
};

goog.scope(function() {
    var TextMetrics = tpo.util.TextMetrics;

    /**
     * @private
     * @param {!Element} element
     */
    TextMetrics.prototype.buildLookupCache = function(element) {
        var nodes = element.childNodes;

        for (var i = 0; i < nodes.length; i += 1) {
            var text = nodes[i].textContent,
                width = nodes[i].clientWidth,
                height = nodes[i].clientHeight;

            if (text === '\u00A0') {
                this.charWidth[' '] = width;
                this.charHeight[' '] = height;
            }

            if (text === '\u2010') {
                this.charWidth['\u00AD'] = width;
                this.charHeight['\u00AD'] = height;
            }

            this.charWidth[text] = width;
            this.charHeight[text] = height;
        }
    };

    /**
     * @param {string} word
     * @return {{width: number, height: number}}
     */
    TextMetrics.prototype.lookup = function(word) {
        if (!word) {
            return { width: 0, height: 0 };
        }

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
