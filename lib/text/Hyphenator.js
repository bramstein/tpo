goog.provide('tpo.text.Hyphenator');

goog.require('tpo.text.Language');

/**
 * Hyphenation engine.
 *
 * @constructor
 * @param {tpo.text.Language} language.
 */
tpo.text.Hyphenator = function(language) {
    var exceptions = [];

    /**
     * @type {!tpo.text.Hyphenator.TrieNode}
     */
    this.trie = this.createTrie(language.hyphenation.patterns);

    /**
     * @type {!number}
     * @const
     */
    this.leftMin = language.hyphenation.leftmin;

    /**
     * @type {!number}
     * @const
     */
    this.rightMin = language.hyphenation.rightmin;

    /**
     * @type {!Object.<string, !Array.<string>>}
     */
    this.exceptions = {};

    if (language.exceptions) {
        exceptions = language.hyphenation.exceptions.split(/,\s?/g);
        exceptions.forEach(function(exception) {
            this.exceptions[exception.replace(/-/g, '')] = exception.split('-');
        }, this);
    }
};

goog.scope(function() {
    var Hyphenator = tpo.text.Hyphenator;

    /**
     * @typedef {{_points: !Array.<number>}}
     */
    Hyphenator.TrieNode;

    /**
     * Creates a trie from a language pattern.
     * @private
     * @param {!Object} patternObject An object with language patterns.
     * @return {!Hyphenator.TrieNode} An object trie.
     */
    Hyphenator.prototype.createTrie = function(patternObject) {
        var size = 0,
            i = 0,
            c = 0,
            p = 0,
            chars = null,
            points = null,
            codePoint = null,
            t = null,
            tree = {
                _points: []
            },
            patterns;

        for (size in patternObject) {
            if (patternObject.hasOwnProperty(size)) {
                patterns = patternObject[size].match(new RegExp('.{1,' + (+size) + '}', 'g'));

                for (i = 0; i < patterns.length; i += 1) {
                    chars = patterns[i].replace(/[0-9]/g, '').split('');
                    points = patterns[i].split(/\D/);
                    t = tree;

                    for (c = 0; c < chars.length; c += 1) {
                        codePoint = chars[c].charCodeAt(0);

                        if (!t[codePoint]) {
                            t[codePoint] = {};
                        }
                        t = t[codePoint];
                    }

                    t._points = [];

                    for (p = 0; p < points.length; p += 1) {
                        t._points[p] = points[p] || 0;
                    }
                }
            }
        }
        return tree;
    };

    /**
     * Hyphenates a text.
     *
     * @param {!string} str The text to hyphenate.
     * @return {!string} The same text with soft hyphens inserted in the right positions.
     */
    Hyphenator.prototype.hyphenateText = function (str, minLength) {
        minLength = minLength || 4;

        // Regexp("\b", "g") splits on word boundaries,
        // compound separators and ZWNJ so we don't need
        // any special cases for those characters.
        var words = str.split(/\b/g);
        return words.map(function (word, i) {
            if (word.indexOf('/') !== -1) {
                // Don't insert a zero width space if the slash is at the beginning or end
                // of the text, or right after or before a space.
                if (i === 0 || i === words.length -1 || /\s+\/|\/\s+/.test(word)) {
                    return word;
                } else {
                    return word + '\u200B';
                }
            } else if (word.length <= minLength) {
                return word;
            } else {
                return this.hyphenate(word).join('\u00AD');
            }
        }, this).join('');
    };

    /**
     * Hyphenates a word.
     *
     * @param {!string} word The word to hyphenate
     * @return {!Array.<!string>} An array of word fragments indicating valid hyphenation points.
     */
    Hyphenator.prototype.hyphenate = function(word) {
        var characters,
            characterPoints = [],
            originalCharacters,
            i,
            j,
            k,
            node,
            points = [],
            wordLength,
            nodePoints,
            nodePointsLength,
            m = Math.max,
            trie = this.trie,
            result = [''];

        if (this.exceptions.hasOwnProperty(word)) {
            return this.exceptions[word];
        }

        if (word.indexOf('\u00AD') !== -1) {
            return [word];
        }

        word = '_' + word + '_';

        characters = word.toLowerCase().split('');
        originalCharacters = word.split('');
        wordLength = characters.length;

        for (i = 0; i < wordLength; i += 1) {
            points[i] = 0;
            characterPoints[i] = characters[i].charCodeAt(0);
        }

        for (i = 0; i < wordLength; i += 1) {
            node = trie;
            for (j = i; j < wordLength; j += 1) {
                node = node[characterPoints[j]];

                if (node) {
                    nodePoints = node._points;
                    if (nodePoints) {
                        for (k = 0, nodePointsLength = nodePoints.length; k < nodePointsLength; k += 1) {
                            points[i + k] = m(points[i + k], nodePoints[k]);
                        }
                    }
                } else {
                    break;
                }
            }
        }

        for (i = 1; i < wordLength - 1; i += 1) {
            if (i > this.leftMin && i < (wordLength - this.rightMin) && points[i] % 2) {
                result.push(originalCharacters[i]);
            } else {
                result[result.length - 1] += originalCharacters[i];
            }
        }
        return result;
    };
});