goog.provide('tpo.preprocessor.TextContainer');

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

    this.styles = {};
    this.words = {};

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
     * @const
     * @type {Array.<string>}
     */
    TextContainer.InlineElements = ['em', 'a', 'abbr', 'span', 'strong', 'acronym'];

    /**
     * @const
     * @type {Array.<string>}
     */
    TextContainer.BlockElements = ['p'];

    /**
     * @private
     * @return {string}
     */
    TextContainer.prototype.createTextSelector = function() {
        return TextContainer.BlockElements.map(function(b) {
            return [b].concat(TextContainer.InlineElements.map(function(i) {
                return b + ' ' + i;
            })).join(', ');
        }).join(', ');
    };

    /**
     * @private
     */
    TextContainer.prototype.replaceTextNodes = function() {
        var elements = dom.query(this.createTextSelector(), this.element);

        debug.time('Preprocessor: replacing text nodes with text elements');
        elements.forEach(function(el) {
            var children = array.toArray(el.childNodes);

            children.forEach(function(child) {
                if (child.nodeType === 3) {
                    var span = window.document.createElement('span');
                    span.classList.add('tpo-text');
                    span.textContent = child.textContent;
                    el.replaceChild(span, child);
                }
            });
        });
        debug.timeEnd('Preprocessor: replacing text nodes with text elements');
    };

    TextContainer.prototype.serialize = function() {
        var size = 2 + (this.blocks.length * 4);

        debug.time('Preprocessor: serializing text container');
        this.blocks.forEach(function(block) {
            size += block.nodes.length * 6;
        });

        var buffer = new ArrayBuffer(size),
            u1 = new Uint8Array(buffer),
            u2 = new Uint16Array(buffer),
            o1 = 2,
            o2 = 1,
            result = '';

        u2[0] = this.blocks.length;

        this.blocks.forEach(function(block, blockIndex) {
            var nodes = block.nodes;

            u1[o1] = block.alignment;   // alignment (0 - 4)
            u1[o1 + 1] = 0;             // <padding>
            u2[o2 + 1] = nodes.length;  // number of nodes in this block (0 - 65535)

            o1 += 4;
            o2 += 2;

            nodes.forEach(function(node, index) {
                u1[o1 + (index * 6) + 0] = node.index;   // pointer to the element this node came from (0 - 256)
                u1[o1 + (index * 6) + 1] = node.style;   // pointer to the style used by this node/element (1 - 256)
                u1[o1 + (index * 6) + 2] = node.action;  // break action (0 - 4)
                u1[o1 + (index * 6) + 3] = 0;            // <padding>
                u2[o2 + (index * 3) + 2] = node.value;   // pointer to the words table (0 - 65535)
            });

            o1 += 6 * nodes.length;
            o2 += 3 * nodes.length;
        });

        var result = '';

        for (var i = 0; i < u1.byteLength; i += 1) {
            result += String.fromCharCode(u1[i]);
        }

        debug.timeEnd('Preprocessor: serializing text container');
        return btoa(result);
    };

    TextContainer.prototype.createTextBlocks = function() {
        var blockElements = dom.query(TextContainer.BlockElements.join(','), this.element);

        debug.time('Preprocessor: building text blocks');
        // Create blocks and build a map of styles and words
        this.blocks = blockElements.map(function(el) {
            var block = new TextBlock(el);

            block.nodes.forEach(function(node) {
                if (node.style && !this.styles.hasOwnProperty(node.style)) {
                    this.styles[node.style] = -1;
                }

                if (node.value && !this.words.hasOwnProperty(node.value)) {
                    this.words[node.value] = -1;
                }
            }, this);

            return block;
        }, this);

        debug.timeEnd('Preprocessor: building text blocks');

        // Assign identifiers to each word and style based on their index.
        // The index starts at `1` so that 0 can be reserved for nodes
        // that do not have a value (and we can thus use unsigned bytes.)
        Object.keys(this.styles).forEach(function(style, index) {
            this.styles[style] = index + 1;
        }, this);

        Object.keys(this.words).forEach(function(word, index) {
            this.words[word] = index + 1;
        }, this);

        debug.time('Preprocessor: building character maps');

        var characters = {};
        this.blocks.forEach(function(block) {
            block.nodes.forEach(function(node) {
                if (node.value) {
                    var word = node.value;

                    if (!characters.hasOwnProperty(node.style)) {
                        characters[node.style] = {};
                    }

                    for (var c = 0; c < word.length; c += 1) {
                        if (c === word.length - 1) {
                            characters[node.style][word[c]] = true;
                        } else {
                            characters[node.style][word[c] + word[c + 1]] = true;
                        }
                        characters[node.style][word[c]] = true;
                    }
                }
            }, this);
        }, this);

        debug.timeEnd('Preprocessor: building character maps');

        // Set the style and word index on each node
        this.blocks.forEach(function(block) {
            block.nodes.forEach(function(node) {
                node.style = node.style ? this.styles[node.style] : 0;
                node.value = node.value ? this.words[node.value] : 0;
            }, this);
        }, this);

        var blob = this.serialize(),
            words = Object.keys(this.words);
    };
});
