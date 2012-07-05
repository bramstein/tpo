goog.provide('tpo.preprocessor.TextBlock');

goog.require('tpo.util.dom');

goog.require('tpo.layout.TextBlock');

goog.require('tpo.text.BreakAction');
goog.require('tpo.text.languages');

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

    this.children = tpo.util.dom.query(tpo.layout.TextBlock.FlowElements, element);
    this.nodes = [];
    this.makeNodes();
};

goog.scope(function() {
    var TextBlock = tpo.preprocessor.TextBlock,

        BreakAction = tpo.text.BreakAction,
        languages = tpo.text.languages,
        en_us = tpo.text.languages.en_us,

        dom = tpo.util.dom;

    TextBlock.prototype.makeNodes = function() {
      var breakAction = new BreakAction();

        this.children.forEach(function(child, index) {
            var style = this.getTextStyleHash(child);

            if (child.nodeName === 'SPAN') {
                var text = child.textContent,
                    tokens = [],
                    language = languages.lookup(child.getAttribute('lang'));

                tokens = language.parse(text);
                breakAction.find(tokens);

                tokens.forEach(function(token) {
                    this.nodes.push({
                        value: token.value,
                        index: index,
                        style: style,
                        action: token.breakAction
                    });
                }, this);
            } else if (child.nodeName === 'BR') {
                this.nodes.push({
                    index: index,
                    style: style,
                    action: BreakAction.Type.EXPLICIT
                });
            } else {
                this.nodes.push({
                    index: index,
                    style: style,
                    action: BreakAction.Type.PROHIBITED
                });
            }
        }, this);
    };

    /**
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
