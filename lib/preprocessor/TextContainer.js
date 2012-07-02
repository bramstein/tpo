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

        debug.time('Replacing text nodes with text elements');
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
        debug.timeEnd('Replacing text nodes with text elements');
    };

    TextContainer.prototype.createTextBlocks = function() {
        var blockElements = dom.query(TextContainer.BlockElements.join(','), this.element),
            styles = {};

        blockElements.forEach(function(el) {
            this.blocks.push(new TextBlock(el, styles));
        }, this);


        var total = 0;

        this.blocks.forEach(function(block) {
            total += block.nodes.length;
        });

        console.log(total * 3);

/*

                tokens.forEach(function(token) {
                    var word = token.value;

                    for (var c = 0; c < word.length; c += 1) {
                        if (c === word.length - 1) {
                            styles[style][word[c]] = true;
                        } else {
                            styles[style][word[c] + word[c + 1]] = true;
                        }
                        styles[style][word[c]] = true;
                    }
                });
*/

        console.log(styles);
    };
});
