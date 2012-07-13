goog.provide('tpo.layout.TextBlock');

/**
 * @constructor
 * @param {!Element} element
 * @param {number} size
 * @param {tpo.layout.TextBlock.Alignment} alignment
 */
tpo.layout.TextBlock = function(element, size, alignment) {
    /**
     * @type {!Element}
     */
    this.element = element;

    /**
     * @type {number}
     */
    this.size = size;

    /**
     * @type {tpo.layout.TextBlock.Alignment}
     */
    this.alignment = alignment;

    /**
     * @type {Array.<string>}
     */
    this.text = [];

    /**
     * @type {Array.<Node>}
     */
    this.positions = [];

    this.widths = [580];

    /*
        struct Node {
            unsigned char type;      // 1
            unsigned char flagged;   // 1
            short penalty;           // 2
            long x;                  // 4
            long y;                  // 4
            long width;              // 4
            long height;             // 4
            long stretch;            // 4
            long shrink;             // 4
        };

        index                                                         1
        u1    [ 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
        i2    [   0   |   1   |   2   |   3   |   4   |   5   |   6   |   7   |   8   |   9   |   10  |   11  |   12  |   13  |
        f4    [       0       |       1       |       2       ]       3       |       4       |       5       |       6       |
    */
    this.buffer = new ArrayBuffer(size * 28);
    this.u1 = new Uint8Array(this.buffer);
    this.i2 = new Int16Array(this.buffer);
    this.f4 = new Float32Array(this.buffer);
};

goog.scope(function() {
    var TextBlock = tpo.layout.TextBlock;

    /**
     * @enum {number}
     */
    TextBlock.NodeType = {
        BOX: 1,
        GLUE: 2,
        PENALTY: 3,
        ELEMENT: 4
    };

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
     * Elements that should be included in a text block even though they
     * might not contain text.
     *
     * @const
     * @type {string}
     */
    TextBlock.FlowElements = '.tpo-text, br, img, button';

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getType = function(index) {
        return this.u1[index * 28];
    };

    /**
     * @inline
     * @param {number} index
     * @param {number} type
     */
    TextBlock.prototype.setType = function(index, type) {
        this.u1[index * 28 + 0] = type;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getFlagged = function(index) {
        return this.u1[index * 28 + 1];
    };

    /**
     * @param {number} index
     * @param {number} flagged
     */
    TextBlock.prototype.setFlagged = function(index, flagged) {
        this.u1[index * 28 + 1] = flagged;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getPenalty = function(index) {
        return this.i2[index * 14 + 1];
    };

    /**
     * @param {number} index
     * @param {number} penalty
     */
    TextBlock.prototype.setPenalty = function(index, penalty) {
        this.i2[index * 14 + 1] = penalty;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getWidth = function(index) {
        return this.f4[index * 7 + 3];
    };

    /**
     * @param {number} index
     * @param {number} width
     */
    TextBlock.prototype.setWidth = function(index, width) {
        this.f4[index * 7 + 3] = width;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getHeight = function(index) {
        return this.f4[index * 7 + 4];
    };

    /**
     * @param {number} index
     * @param {number} height
     */
    TextBlock.prototype.setHeight = function(index, height) {
        this.f4[index * 7 + 4] = height;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getStretch = function(index) {
        return this.f4[index * 7 + 5];
    };

    /**
     * @param {number} index
     * @param {number} stretch
     */
    TextBlock.prototype.setStretch = function(index, stretch) {
        this.f4[index * 7 + 5] = stretch;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getShrink = function(index) {
        return this.f4[index * 7 + 6];
    };

    /**
     * @param {number} index
     * @param {number} shrink
     */
    TextBlock.prototype.setShrink = function(index, shrink) {
        this.f4[index * 7 + 6] = shrink;
    };

    /**
     * @param {number} index
     * @return {?Node}
     */
    TextBlock.prototype.getPosition = function(index) {
        return this.positions[index];
    };

    /**
     * @param {number} index
     * @param {!Node} position
     */
    TextBlock.prototype.setPosition = function(index, position) {
        this.positions[index] = position;
    };

    /**
     * @param {number} index
     * @return {?string}
     */
    TextBlock.prototype.getText = function(index) {
        return this.text[index];
    };

    /**
     * @param {number} index
     * @param {string} text
     */
    TextBlock.prototype.setText = function(index, text) {
        this.text[index] = text;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getX = function(index) {
        return this.f4[index * 7 + 1];
    };

    /**
     * @param {number} index
     * @param {number} value
     */
    TextBlock.prototype.setX = function(index, value) {
        this.f4[index * 7 + 1] = value;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getY = function(index) {
        return this.f4[index * 7 + 2];
    };

    /**
     * @param {number} index
     * @param {number} value
     */
    TextBlock.prototype.setY = function(index, value) {
        this.f4[index * 7 + 2] = value;
    };

    /**
     * @return {Array.<Object>}
     */
    TextBlock.prototype.toJSON = function() {
        var result = [];

        for (var i = 0; i < this.size; i += 1) {
            result.push({
                type:    this.getType(i),
                flagged: this.getFlagged(i),
                penalty: this.getPenalty(i),
                x:       this.getX(i),
                y:       this.getY(i),
                width:   this.getWidth(i),
                height:  this.getHeight(i),
                stretch: this.getStretch(i),
                shrink:  this.getShrink(i),
                position: this.positions[i],
                text: this.text[i]
            });
        }
        return result;
    };
});
