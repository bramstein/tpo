goog.provide('tpo.preprocessor.TextBlock');

goog.require('tpo.util.dom');
goog.require('tpo.util.array');

goog.require('tpo.layout.TextBlock');

goog.require('tpo.text.BreakAction');
goog.require('tpo.text.languages');
goog.require('tpo.text.Token');

/**
 * @constructor
 */
tpo.preprocessor.TextBlock = function(element) {
    var style = window.getComputedStyle(element, null),
        textAlign = style['textAlign'];

    /**
     * @type {!Element}
     */
    this.element = element;

    /**
     * @type {!tpo.layout.TextBlock.Alignment}
     */
    this.alignment = tpo.layout.TextBlock.Alignment.LEFT;

    // TODO: This ignores RTL and LTR differences
    if (/right/.test(textAlign)) {
        this.alignment = tpo.layout.TextBlock.Alignment.RIGHT;
    } else if (/justify/.test(textAlign)) {
        this.alignment = tpo.layout.TextBlock.Alignment.JUSTIFY;
    } else if (/center/.test(textAlign)) {
        this.alignment = tpo.layout.TextBlock.Alignment.CENTER;
    }

    /**
     * @type {Array.<Object>}
     */
    this.nodes = this.makeNodes();

    /**
     * @type {number}
     */
    this.size = this.getSize();
};

goog.scope(function() {
    var TextBlock = tpo.preprocessor.TextBlock,

        BreakAction = tpo.text.BreakAction,
        Token = tpo.text.Token,
        languages = tpo.text.languages,
        en_us = tpo.text.languages.en_us,

        array = tpo.util.array,
        dom = tpo.util.dom;

    /**
     * @private
     */
    TextBlock.prototype.makeNodes = function() {
        var children = tpo.util.dom.query(tpo.layout.TextBlock.FlowElements, this.element),
            result = [],
            nodes = [],
            breaks = [],
            breakAction = new BreakAction(),
            tokens = [];

        children.forEach(function(child, index) {
            var style = this.getTextStyleHash(child),
                language = languages.lookup(child.getAttribute('lang'));

            if (child.nodeName === 'SPAN') {
                var text = language.parse(child.textContent);

                array.append(tokens, text);

                text.forEach(function(t) {
                    nodes.push({
                        value: t.value,
                        index: index,
                        style: style
                    });
                });
            } else if (child.nodeName === 'BR') {
                tokens.push(new Token('\n', Token.Class.NL));
                nodes.push({
                    index: index,
                    style: style
                });
            } else {
                tokens.push(new Token(null, Token.Class.AL));
                nodes.push({
                    index: index,
                    style: style
                });
            }
        }, this);

        breaks = breakAction.find(tokens);

        // Set the break action for each node
        for (var i = 0; i < nodes.length; i += 1) {
            // Merge consecutive nodes that are prohibited to have a break between them
            if (breaks[i] === BreakAction.Type.PROHIBITED) {
                nodes[i].action = breaks[i];
                result.push(nodes[i]);

                for (var j = i + 1; j < nodes.length; j += 1) {
                    if (breaks[j] !== BreakAction.Type.PROHIBITED) {
                        i = j - 1;
                        break;
                    }
                    nodes[i].value += nodes[j].value;
                }
            } else {
                nodes[i].action = breaks[i];
                result.push(nodes[i]);
            }
        }
        return result;
    };

    /**
     * @private
     * @return {number}
     */
    TextBlock.prototype.getSize = function() {
        var size = 0;

        if (this.alignment === tpo.layout.TextBlock.Alignment.CENTER) {
            size += 2;
        }

        this.nodes.forEach(function(node) {
            if (node.value) {
                if (node.action === BreakAction.Type.INDIRECT) {
                    if (this.alignment === tpo.layout.TextBlock.Alignment.CENTER) {
                        size += 6;
                    } else if (this.alignment === tpo.layout.TextBlock.Alignment.JUSTIFY) {
                        size += 1;
                    } else {
                        size += 3;
                    }
                } else if (node.action === BreakAction.Type.EXPLICIT) {
                    size += 3;
                } else if (node.action === BreakAction.Type.DIRECT) {
                    if (node.value === '\u00AD') {
                        size += 1;
                    } else {
                        size += 2;
                    }
                } else {
                    size += 1;
                }
            } else {
                if (node.action === BreakAction.Type.EXPLICIT) {
                    size += 2;
                } else {
                    size += 1;
                }
            }
        }, this);

        return size;
    };

    /**
     * @private
     * @param {!Element} element
     * @return {string}
     */
    TextBlock.prototype.getTextStyleHash = function(element) {
        var style = window.getComputedStyle(element, null),
            fontFamily = style['fontFamily'],
            fontSize = style['fontSize'],
            fontStyle = style['fontStyle'] || 'normal',
            fontWeight = style['fontWeight'] || 'normal',
            fontVariant = style['fontVariant'] || 'normal',
            lineHeight = style['lineHeight'],
            textTransform = style['textTransform'] || 'none',
            textRendering = style['textRendering'] || 'optimizespeed';

        return 'font:' + fontStyle + ' ' +
                         fontVariant + ' ' +
                         fontWeight + ' ' +
                         fontSize + '/' + lineHeight + ' ' +
                         fontFamily + ';' +
                'text-transform:' + textTransform + ';' +
                'text-rendering:' + textRendering + ';';
    };
});
