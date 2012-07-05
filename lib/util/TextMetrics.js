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

        if (len === 1) {
            width = this.charWidth[word];
            height = this.charHeight[word];
        } else if (len === 2) {
            width = this.charWidth[word];
            height = this.charHeight[word];
        } else if (len === 3) {
            width = this.charWidth[word[0] + word[1]] - this.charWidth[word[1]] +
                    this.charWidth[word[1] + word[2]] - this.charWidth[word[2]] +
                    this.charWidth[word[2]];

            height = Math.max(this.charHeight[word[0] + word[1]], this.charHeight[word[2]]);
        } else if (len === 4) {
            width = this.charWidth[word[0] + word[1]] - this.charWidth[word[1]] +
                    this.charWidth[word[1] + word[2]] - this.charWidth[word[2]] +
                    this.charWidth[word[2] + word[3]] - this.charWidth[word[3]] +
                    this.charWidth[word[3]];

            height = Math.max(this.charHeight[word[0] + word[1]], this.charHeight[word[2] + word[3]]);
        } else if (len === 5) {
            width = this.charWidth[word[0] + word[1]] - this.charWidth[word[1]] +
                    this.charWidth[word[1] + word[2]] - this.charWidth[word[2]] +
                    this.charWidth[word[2] + word[3]] - this.charWidth[word[3]] +
                    this.charWidth[word[3] + word[4]] - this.charWidth[word[4]] +
                    this.charWidth[word[4]];

            height = Math.max(this.charHeight[word[0] + word[1]], this.charHeight[word[2] + word[3]], this.charHeight[word[4]]);
        } else if (len === 6) {
            width = this.charWidth[word[0] + word[1]] - this.charWidth[word[1]] +
                    this.charWidth[word[1] + word[2]] - this.charWidth[word[2]] +
                    this.charWidth[word[2] + word[3]] - this.charWidth[word[3]] +
                    this.charWidth[word[3] + word[4]] - this.charWidth[word[4]] +
                    this.charWidth[word[4] + word[5]] - this.charWidth[word[5]] +
                    this.charWidth[word[5]];

            height = Math.max(this.charHeight[word[0] + word[1]], this.charHeight[word[2] + word[3]], this.charHeight[word[4] + word[5]]);
        } else {
            for (var i = 0; i < len; i += 1) {
                if (i === len - 1) {
                    width += this.charWidth[word[i]];
                    height = Math.max(height, this.charHeight[word[i]]);
                } else {
                    width += this.charWidth[word[i] + word[i + 1]] - this.charWidth[word[i + 1]];
                    height = Math.max(height, this.charHeight[word[i] + word[i + 1]]);
                }
            }
        }

        this.cache[word] = { width: width, height: height };

        return this.cache[word];
    };
});
