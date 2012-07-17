goog.provide('tpo.preprocessor.TextContainer');

goog.require('tpo.layout.TextContainer');

goog.require('tpo.preprocessor.TextBlock');

goog.require('tpo.util.debug');
goog.require('tpo.util.dom');
goog.require('tpo.util.array');

/**
 * @constructor
 * @param {!Element} element
 */
tpo.preprocessor.TextContainer = function(element) {
    /**
     * @type {!Element}
     */
    this.element = element;

    /**
     * @type {Array.<tpo.preprocessor.TextBlock>}
     */
    this.blocks = [];

    this.replaceTextNodes();
    this.createTextBlocks();
};

goog.scope(function() {
    var TextContainer = tpo.preprocessor.TextContainer,
        TextBlock = tpo.preprocessor.TextBlock,
        debug = tpo.util.debug,
        array = tpo.util.array,
        dom = tpo.util.dom;

    /**
     * @private
     */
    TextContainer.prototype.replaceTextNodes = function() {
        var elements = dom.query(tpo.layout.TextContainer.TextElements, this.element);

        debug.time('Preprocessor: replacing text nodes with text elements');
        elements.forEach(function(el) {
            var children = array.toArray(el.childNodes);

            children.forEach(function(child) {
                if (child.nodeType === 3) {
                    var span = dom.createElement('span');
                    span.classList.add('tpo-text');
                    span.textContent = child.textContent;
                    el.replaceChild(span, child);
                }
            });
        });
        debug.timeEnd('Preprocessor: replacing text nodes with text elements');
    };

    /**
     * @private
     */
    TextContainer.prototype.createTextBlocks = function() {
        var blockElements = dom.query(tpo.layout.TextContainer.BlockElements, this.element);

        debug.time('Preprocessor: building text blocks');
        // Create blocks and build a map of styles and words
        this.blocks = blockElements.map(function(el) {
            return new TextBlock(el);
        }, this);
        debug.timeEnd('Preprocessor: building text blocks');
    };

    /**
     * @return {{data: string, styles: !Object}}
     */
    TextContainer.prototype.serialize = function() {
        var size = 2 + (this.blocks.length * 6),
            words = {},
            wordList = {},
            wordIndex = 1;

        debug.time('Preprocessor: building maps');
        this.blocks.forEach(function(block) {
            size += block.nodes.length * 4;

            block.nodes.forEach(function(node) {
                if (node.value) {
                    if (!words.hasOwnProperty(node.style)) {
                        words[node.style] = {};
                    }

                    words[node.style][node.value] = true;
                }
            }, this);
        }, this);

        // Assign each word an index that corresponds to the NodeList index
        // if we selected all children of measurement divs in the DOM.
        Object.keys(words).forEach(function(style) {
            Object.keys(words[style]).forEach(function(word) {
                words[style][word] = wordIndex;
                wordIndex += 1;
            });

            // Build an array for easier sorting
            wordList[style] = Object.keys(words[style]).map(function(word) {
                return {
                    word: word,
                    index: words[style][word]
                };
            });

            // Sort each style
            wordList[style].sort(function(a, b) {
                return a.index - b.index;
            });
        });

        // Order the styles
        wordList = Object.keys(wordList).map(function(style) {
            return {
                style: style,
                words: wordList[style],
                index: wordList[style][0].index
            };
        });

        wordList.sort(function(a, b) {
            return a.index - b.index;
        });

        wordList = wordList.map(function(group) {
            return {
                style: group.style,
                words: group.words.map(function(wordObject) {
                    return wordObject.word;
                })
            };
        });

        // Set the word index on each node
        this.blocks.forEach(function(block) {
            block.nodes.forEach(function(node) {
                if (node.style && node.value) {
                    node.value = words[node.style][node.value];
                } else {
                    node.value = 0;
                }
            }, this);
        }, this);
        debug.timeEnd('Preprocessor: building maps');

        debug.time('Preprocessor: building typed array');
        var buffer = new ArrayBuffer(size),
            u1 = new Uint8Array(buffer),
            u2 = new Uint16Array(buffer),
            o1 = 2,
            o2 = 1,
            result = '';

        u2[0] = this.blocks.length;

        this.blocks.forEach(function(block, blockIndex) {
            var nodes = block.nodes;

            u1[o1] = block.alignment;    // alignment (0 - 4)
            u1[o1 + 1] = 0;              // <padding>
            u2[o2 + 1] = nodes.length;   // number of nodes in this block (0 - 65535)
            u2[o2 + 2] = block.size;     // size of the block

            o1 += 6;
            o2 += 3;

            nodes.forEach(function(node, index) {
                u1[o1 + (index * 4) + 0] = node.index;   // pointer to the element this node came from (0 - 256)
                u1[o1 + (index * 4) + 1] = node.action;  // break action (0 - 4)
                u2[o2 + (index * 2) + 1] = node.value;   // pointer to the words table (0 - 65535)
            });

            o1 += 4 * nodes.length;
            o2 += 2 * nodes.length;
        });

        var data = '';

        for (var i = 0; i < u1.byteLength; i += 1) {
            data += String.fromCharCode(u1[i]);
        }

        data = window.btoa(data);

        debug.timeEnd('Preprocessor: building typed array');

        return {
            data: data,
            styles: wordList
        };
    };
});
