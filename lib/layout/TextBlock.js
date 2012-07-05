goog.provide('tpo.layout.TextBlock');

/**
 * @constructor
 */
tpo.layout.TextBlock = function() {

    /**
     * @type {tpo.layout.TextBlock.Alignment}
     */
    this.alignment = tpo.layout.TextBlock.Alignment.JUSTIFY;
};

goog.scope(function() {
    var TextBlock = tpo.layout.TextBlock;

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
});
