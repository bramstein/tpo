goog.provide('tpo.layout.TextBlock');

/*
    struct TextBlock {
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

/**
 * @constructor
 * @param {number} size
 */
tpo.layout.TextBlock = function(size) {
    /**
     * @type {number}
     */
    this.size = size;

    /**
     * @type {Array.<string>}
     */
    this.text = [];

    /**
     * @type {Array.<Element>}
     */
    this.positions = [];

    /**
     * @type {number}
     */
    this.index = 0;

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
    TextBlock.Types = {
        BOX: 1,
        GLUE: 2,
        PENALTY: 3,
        ELEMENT: 4
    };

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     * @param {string} text
     */
    TextBlock.prototype.addBox = function(parent, width, height, text) {
        var i = this.index;

        this.positions[i] = parent;
        this.u1[i * 28] = TextBlock.Types.BOX;
        this.f4[i * 7 + 3] = width;
        this.f4[i * 7 + 4] = height;
        this.text[i] = text;
        this.index += 1;
    };

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     * @param {number} stretch
     * @param {number} shrink
     */
    TextBlock.prototype.addGlue = function(parent, width, height, stretch, shrink) {
        var i = this.index;

        this.positions[i] = parent;
        this.u1[i * 28] = TextBlock.Types.GLUE;
        this.f4[i * 7 + 3] = width;
        this.f4[i * 7 + 4] = height;
        this.f4[i * 7 + 5] = stretch;
        this.f4[i * 7 + 6] = shrink;
        this.index += 1;
    };

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     * @param {number} penalty
     * @param {number} flagged
     */
    TextBlock.prototype.addPenalty = function(parent, width, height, penalty, flagged) {
        var i = this.index;

        this.positions[i] = parent;
        this.u1[i * 28] = TextBlock.Types.PENALTY;
        this.u1[i * 28 + 1] = flagged;
        this.i2[i * 14 + 1] = penalty;
        this.f4[i * 7 + 3] = width;
        this.f4[i * 7 + 4] = height;
        this.index += 1;
    };

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     */
    TextBlock.prototype.addElement = function(parent, width, height) {
        var i = this.index;

        this.positions[i] = parent;
        this.u1[i * 28] = TextBlock.Types.ELEMENT;
        this.f4[i * 7 + 3] = width;
        this.f4[i * 7 + 4] = height;
        this.index += 1;
    };

    /**
     * @param {number} index
     * @return {number}
     */
    TextBlock.prototype.getType = function(index) {
        return this.u1[index * 28];
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
     * @return {number}
     */
    TextBlock.prototype.getPenalty = function(index) {
        return this.i2[index * 14 + 1];
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
     * @return {number}
     */
    TextBlock.prototype.getHeight = function(index) {
        return this.f4[index * 7 + 4];
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
     * @return {number}
     */
    TextBlock.prototype.getShrink = function(index) {
        return this.f4[index * 7 + 6];
    };

    /**
     * @param {number} index
     * @return {?Element}
     */
    TextBlock.prototype.getPosition = function(index) {
        return this.positions[index];
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
     * @return {number}
     */
    TextBlock.prototype.getX = function(index) {
        return this.f4[index * 7 + 1];
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
    TextBlock.prototype.setX = function(index, value) {
        this.f4[index * 7 + 1] = value;
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
