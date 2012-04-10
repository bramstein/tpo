goog.provide('tpo.text.token');

/**
 * This is a collection of utility functions to tokenize text
 * in various ways. The way we tokenize paragraphs is very
 * specific to our approach. In contrast with TeX we would like
 * to have as few as possible boxes, because we are going to
 * absolute position them. Ideally we would also like to include
 * punctuation in the box, so that:
 * 
 *     "To hyphenate, or not to hyphenate?"
 * 
 * Would be split into the following boxes (excluding glue:)
 *
 *     ['"To', 'hyphenate,', 'or', 'not', 'to', 'hyphenate?"']
 *
 * This works well unless a box needs to be hyphenated. In that
 * case we would like to temporarily remove punctuation,
 * hyphenate the box, and put the punctuation back. So if the
 * last box in the above example were to be hyphenated we would
 * like the result to be:
 *
 *      ['hy', 'phen', 'ate?"']
 *
 * We can quickly do that by splitting the box on word
 * boundaries, which will result in word and non-word tokens.
 * If we had cycles to spare, we could then identify words and
 * punctuation. We instead decide to skip that and assume the
 * length of punctuation boxes are below the threshold for 
 * hyphenation.
 */
goog.scope(function() {

    /**
     * Split a string into boxes including punctuation. This
     * assumes a language where words are deliminated by
     * whitespace.
     *
     * @param {string} str
     * @return {Array.<string>}
     */
    tpo.text.token.tokenizeString = function(str) {
        return str.split(/\s/);
    };
    
    /**
     * Tokenize a box into word and non-word boxes (e.g.
     * punctuation).
     *
     * @param {string} box
     * @return {Array.<string>}
     */
    tpo.text.token.tokenizeBox = function(box) {
        return box.replace('&nbsp;', '\u00A0').split(/\b/);
    };
});