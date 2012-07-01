goog.provide('tpo.preprocessor.TextBlock');

goog.require('tpo.util.dom');

goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.languages.en_us');

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
            penalty: <number>                 // short (2)
            value: <string>                   // char* ??
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
tpo.preprocessor.TextBlock = function(element, styles) {
    var style = window.getComputedStyle(element, null),
        textAlign = style['textAlign'];

    /**
     * @type {!Element}
     */
    this.element = element;

    /**
     * @type {!tpo.layout.Paragraph.Alignment}
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
    
    this.makeNodes(styles);
};

goog.scope(function() {
    var TextBlock = tpo.preprocessor.TextBlock,
    
        Tokenizer = tpo.text.Tokenizer,
        en_us = tpo.text.languages.en_us,
        
        dom = tpo.util.dom;

    /**
     * @enum {number}
     */
    TextBlock.Alignment = {
        JUSTIFY: 1,
        LEFT: 2,
        RIGHT: 3,
        CENTER: 4
    };
    
    TextBlock.prototype.makeNodes = function(styles) {
        var tokenizer = new Tokenizer(en_us);
        
        this.children.forEach(function(child) {
            var style = this.getTextStyleHash(child),
                text = child.textContent,
                tokens = [];

            if (!styles[style]) {
                styles[style] = [];
            }
            
            tokens = tokenizer.parse(text);
            
            console.log(tokens[0]);
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
