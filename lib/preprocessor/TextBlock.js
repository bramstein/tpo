goog.provide('tpo.preprocessor.TextBlock');

goog.require('tpo.util.dom');

goog.require('tpo.text.BreakAction');
goog.require('tpo.text.languages');

/*

Prerequisites:
- consider P, LI, DD, (DT?), blockquote, block elements and any child nodes as inline elements
- apply to body or something specific? Or just do everything as it is fast and results in higher quality typesetting.

1) Replace all text nodes of inline or block elements with <span class="tpo-text">...original content...</span> in `container` TODO: This could very well be moved into the preprocessing step.

2) If the document has an element with #tpo-data go to (4).

3) Iterate through all text nodes
    3.1) Retrieve their computed style and create a hash of font and text alignment properties (?)
    3.2) Store the position of each text node
    3.3) Tokenize
    3.4) Find legal break positions
    3.5) Hyphenate
    3.6) Iterate through each box and store single and pairs of characters in a hash table associated with the font/text style hash
    3.7) Store each box with its break action, value and text node association
    3.8) Turn the hash table font/text style hashes into a div with #tpo-characters and insert it into the DOM. Assign a unique id (index in nodelist?) to each text node and store it in a JSON object together with the boxes for that node and block level element. Do the same for other inline elements without text nodes. Insert this hash as a <script> tag into the page (maybe wrapped in #tpo-characters?)

4)

block identifier (somehow?)


Each token should have:
 - box break action: byte
 - box type: byte (glue, element, penalty, box)
 - node index: short
 - token value: string

Serialized text block:
{
    length: <number>                          // ushort(2)
    alignment: <number>                       // byte  (1)
    index: <number>                           // byte  (1)
    boxes: [
        {
            type: GLUE|ELEMENT|PENALTY|BOX,   // byte  (1)
            style: <number>,                  // byte  (1)
            index: <number>,                  // byte  (1)
            flagged: <number>,                // byte  (1)
            penalty: <number>,                // short (2)
            width: <number>,                  // float (4)
            height: <number>,                 // float (4)
            stretch: <number>,                // float (4)
            shrink: <number>                  // float (4)
        },
        ...
    ]
}

index                                                         1
u1    [ 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
i2    [   0   |   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |   9   |   10  |   11  |   12  |   13  |
u2    [   0   |   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |   9   |   10  |   11  |   12  |   13  |
f4    [       0       |       1       |       2       ]       3       |       4       |       5       |       6       |


*/

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
     * @type {!tpo.preprocessor.TextBlock.Alignment}
     */
    this.alignment = tpo.preprocessor.TextBlock.Alignment.LEFT;

    // TODO: This ignores RTL and LTR differences
    if (/right/.test(textAlign)) {
        this.alignment = tpo.preprocessor.TextBlock.Alignment.RIGHT;
    } else if (/justify/.test(textAlign)) {
        this.alignment = tpo.preprocessor.TextBlock.Alignment.JUSTIFY;
    } else if (/center/.test(textAlign)) {
        this.alignment = tpo.preprocessor.TextBlock.Alignment.CENTER;
    }

    this.children = tpo.util.dom.query('.tpo-text, br, img, button', element);
    this.nodes = [];

    this.makeNodes();
};

goog.scope(function() {
    var TextBlock = tpo.preprocessor.TextBlock,

        BreakAction = tpo.text.BreakAction,
        languages = tpo.text.languages,
        en_us = tpo.text.languages.en_us,

        dom = tpo.util.dom;

    // TODO: Move these out of the preprocessor so they
    // are also available in the runtime code.

    /**
     * @enum {number}
     */
    TextBlock.Alignment = {
        JUSTIFY: 1,
        LEFT: 2,
        RIGHT: 3,
        CENTER: 4
    };

    /**
     * @enum {number}
     */
    TextBlock.NodeType = {
        BOX: 1,
        GLUE: 2,
        PENALTY: 3,
        ELEMENT: 4
    };

    TextBlock.prototype.addBox = function(index, style, width, height, value) {
        this.nodes.push({
            type: TextBlock.NodeType.BOX,
            index: index,
            style: style,
            width: width,
            height: height,
            value: value
        });
    };

    TextBlock.prototype.addGlue = function(index, style, width, height, stretch, shrink) {
        this.nodes.push({
            type: TextBlock.NodeType.GLUE,
            index: index,
            style: style,
            width: width,
            height: height,
            stretch: stretch,
            shrink: shrink
        });
    };

    TextBlock.prototype.addPenalty = function(index, style, width, height, penalty, flagged) {
        this.nodes.push({
            type: TextBlock.NodeType.PENALTY,
            index: index,
            style: style,
            width: width,
            height: height,
            penalty: penalty,
            flagged: flagged
        });
    };

    TextBlock.prototype.addElement = function(index, style, width, height) {
        this.nodes.push({
            type: TextBlock.NodeType.ELEMENT,
            index: index,
            style: style,
            width: width,
            height: height
        });
    };

    TextBlock.prototype.makeNodes = function() {
        var breakAction = new BreakAction();

        this.children.forEach(function(child, index) {
            var style = this.getTextStyleHash(child);

            if (index === 0 && this.alignment === TextBlock.Alignment.CENTER) {
                this.addBox(index, style, 0, 0, '');
                this.addGlue(index, style, 0, 0, 12, 0);
            }

            if (child.nodeName === 'SPAN') {
                var text = child.textContent,
                    tokens = [],
                    language = languages.lookup(child.getAttribute('lang'));

                tokens = language.tokenizer.parse(text);
                breakAction.find(tokens);

                tokens.forEach(function(token) {
                    // FIXME: Handle hyphenated words better.
                    if (token.value.length > 6) {
                        var parts = language.hyphenator.hyphenate(token.value);

                        if (parts.length > 1) {
                            token.value = parts;
                        }
                    }

                    if (token.breakAction === BreakAction.Type.INDIRECT) {
                        if (this.alignment === TextBlock.Alignment.CENTER) {
                            this.addGlue(index, style, 0, 0, 12, 0);
                            this.addPenalty(index, style, 0, 0, 0, 0);
                            this.addGlue(index, style, -1, -1, -24, 0);
                            this.addBox(index, style, 0, 0, '');
                            this.addPenalty(index, style, 0, 0, 10000, 0);
                            this.addGlue(index, style, 0, 0, 12, 0);
                        } else if (this.alignment === TextBlock.Alignment.JUSTIFY) {
                            this.addGlue(index, style, -1, -1, -1, -1);
                        } else {
                            this.addGlue(index, style, 0, 0, 12, 0);
                            this.addPenalty(index, style, 0, 0, 0, 0);
                            this.addGlue(index, style, -1, -1, -12, 0);
                        }
                    } else if (token.breakAction === BreakAction.Type.EXPLICIT) {
                        if (this.alignment === TextBlock.Alignment.CENTER) {
                            this.addBox(index, style, -1, -1, token.value);
                            this.addGlue(index, style, 0, 0, 12, 0);
                            this.addPenalty(index, style, 0, 0, -10000, 1);
                        } else {
                            this.addBox(index, style, -1, -1, token.value);
                            this.addGlue(index, style, 0, 0, 10000, 0);
                            this.addPenalty(index, style, 0, 0, -10000, 1);
                        }
                    } else if (token.breakAction === BreakAction.Type.DIRECT) {
                        this.addBox(index, style, -1, -1, token.value);
                        this.addGlue(index, style, 0, 0, 0, 0);
                    } else {
                        this.addBox(index, style, -1, -1, token.value);
                    }
                }, this);
            } else if (child.nodeName === 'BR') {
                this.addGlue(index, style, 0, 0, 10000, 0);
                this.addPenalty(index, style, 0, 0, -10000, 1);
            } else {
                this.addElement(index, style, -1, -1);
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
