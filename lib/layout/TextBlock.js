goog.provide('tpo.layout.TextBlock');

/*
 struct Component {
    unsigned char type;      // 1
    unsigned char flagged;   // 1
    unsigned short penalty;  // 2
    long x;                  // 4
    long y;                  // 4
    long width;              // 4
    long height;             // 4
    long stretch;            // 4
    long shrink;             // 4
};
 */
 
/**
 * @constructor
 * @param {number} size
 */
tpo.layout.TextBlock = function(size) {
    this.size = size;
    this.view = new ArrayBuffer(((size + 1) * 32));
    this.u1 = new Uint8Array(this.view);
    this.u2 = new Uint16Array(this.view);
    this.f4 = new Float32Array(this.view);

    this.text = [];
    this.positions = [];

    this.index = 0;
};

goog.scope(function() {
    var TextBlock = tpo.layout.TextBlock;

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     * @param {string} text
     */
    TextBlock.prototype.addBox = function(parent, width, height, text) {
        this.positions[this.index / 32 | 0] = parent;
        this.u1[(this.index << 2) + 0] = 1;
        this.f4[this.index + 3] = width;
        this.f4[this.index + 4] = height;
        this.text[this.index / 32 | 0] = text;
        this.index += 32;
    };

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     * @param {number} stretch
     * @param {number} shrink
     */
    TextBlock.prototype.addGlue = function(parent, width, height, stretch, shrink) {
        this.positions[this.index / 32 | 0] = parent;
        this.u1[(this.index << 2) + 0] = 2;
        this.f4[this.index + 3] = width;
        this.f4[this.index + 4] = height;
        this.f4[this.index + 5] = stretch;
        this.f4[this.index + 6] = shrink;
        this.index += 32;
    };

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     * @param {number} penalty
     * @param {number} flagged
     */
    TextBlock.prototype.addPenalty = function(parent, width, height, penalty, flagged) {
        this.positions[this.index / 32 | 0] = parent;
        this.u1[(this.index << 2) + 0] = 3;
        this.u1[(this.index << 2) + 1] = flagged;
        this.u2[(this.index << 1) + 1] = penalty;
        this.f4[this.index + 3] = width;
        this.f4[this.index + 4] = height;
        this.index += 32;
    };

    /**
     * @param {!Element} parent
     * @param {number} width
     * @param {number} height
     */
    TextBlock.prototype.addElement = function(parent, width, height) {
        this.positions[this.index / 32 | 0] = parent;
        this.u1[(this.index << 2) + 0] = 4;
        this.f4[this.index + 3] = width;
        this.f4[this.index + 4] = height;
        this.index += 32;
    };

    /**
     * @return {Array.<Object>}
     */
    TextBlock.prototype.toJSON = function() {
        var result = [];

        for (var i = 0; i < this.size; i += 1) {
            result.push({
                type: this.u1[((i * 32) << 2) + 0],
                width: this.f4[(i * 32) + 3],
                height: this.f4[(i * 32) + 4]
            });
        }

        return result;
    };
});
