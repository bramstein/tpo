goog.provide('tpo.layout.TextContainer');

goog.require('tpo.util.TextMetrics');

goog.require('tpo.util.debug');

/**
 * @constructor
 * @param {!Element} el
 * @param {!Element} styles
 * @param {!Object} data
 */
tpo.layout.TextContainer = function(el, styles, data) {

    /**
     * @type {Array.<tpo.util.TextMetrics>}
     */
    this.styles = [];

    /**
     * @type {Array.<tpo.layout.TextBlock>}
     */
    this.blocks = [];

    this.parseStyles(styles);
    this.parseData(data);
};

goog.scope(function() {
    var TextContainer = tpo.layout.TextContainer,
        TextMetrics = tpo.util.TextMetrics,

        debug = tpo.util.debug;

    /**
     * The text nodes of the following elements will be treated as containing
     * text when they are contained by a BlockElement.
     *
     * @const
     * @type {string}
     */
    TextContainer.TextElements = 'p, p em, p a, p abbr, p span, p strong, p acronym';


    /**
     * Top-level element that may contain text.
     *
     * @const
     * @type {string}
     */
    TextContainer.BlockElements = 'p';

    /**
     * @param {!Element} characters
     */
    TextContainer.prototype.parseStyles = function(characters) {
        debug.time('parsing styles');
        var styleNodes = characters.childNodes;

        for (var i = 0; i < styleNodes.length; i += 1) {
            this.styles[i] = new TextMetrics(styleNodes[i]);
        }

        debug.timeEnd('parsing styles');
    };

    TextContainer.prototype.parseData = function(data) {
        debug.time('decode nodes');
        var bin = window.atob(data.nodes),
            buffer = new ArrayBuffer(bin.length),
            u1 = new Uint8Array(buffer),
            u2 = new Uint16Array(buffer);

        for (var i = 0; i < bin.length; i += 1) {
            u1[i] = bin.charCodeAt(i);
        }

        var size = u2[0],
            o1 = 2,
            o2 = 1;

        for (var i = 0; i < size; i += 1) {
            var blockAlignment = u1[o1 + 0],
                blockIndex =     u1[o1 + 1],
                blockLength =    u2[o2 + 1];

            o1 += 4;
            o2 += 2;

            for (var j = 0; j < blockLength; j += 1) {
                var nodeIndex =  u1[o1 + (j * 6) + 0],
                    nodeStyle =  u1[o1 + (j * 6) + 1],
                    nodeAction = u1[o1 + (j * 6) + 2],
                    nodeValue =  u2[o2 + (j * 3) + 2];
            }

            o1 += 6 * blockLength;
            o2 += 3 * blockLength;
        }
        debug.timeEnd('decode nodes');
    };
});
