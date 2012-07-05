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
     * @return {{data: string, words: Array.<string>, styles: !Object}}
     */
    TextContainer.prototype.serialize = function() {
        var size = 2 + (this.blocks.length * 4),
            styles = {},
            words = {},
            characters = {};

        debug.time('Preprocessor: building maps');
        this.blocks.forEach(function(block) {
            size += block.nodes.length * 6;

            block.nodes.forEach(function(node) {
                if (node.style && !styles.hasOwnProperty(node.style)) {
                    styles[node.style] = -1;
                }

                if (node.value && !words.hasOwnProperty(node.value)) {
                    words[node.value] = -1;
                }

                // Store single characters and character pairs in for each style.
                // We can use this information to quickly calculate text dimensions,
                // without creating a DOM node for each node.
                if (node.value) {
                    if (!characters.hasOwnProperty(node.style)) {
                        characters[node.style] = {};
                    }
                    var word = node.value;

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

        // Assign identifiers to each word and style based on their index.
        // The index starts at `1` so that 0 can be reserved for nodes
        // that do not have a value (and we can thus use unsigned bytes.)
        Object.keys(styles).forEach(function(style, index) {
            styles[style] = index + 1;
        }, this);

        Object.keys(words).forEach(function(word, index) {
            words[word] = index + 1;
        }, this);

        // Set the style and word index on each node
        this.blocks.forEach(function(block) {
            block.nodes.forEach(function(node) {
                node.style = node.style ? styles[node.style] : 0;
                node.value = node.value ? words[node.value] : 0;
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

        var data = '';

        for (var i = 0; i < u1.byteLength; i += 1) {
            data += String.fromCharCode(u1[i]);
        }

        data = window.btoa(data);

        debug.timeEnd('Preprocessor: building typed array');

        return {
            data: data,
            words: Object.keys(words),
            styles: characters
        };
    };
});
