goog.provide('tpo.text.languages');

goog.require('tpo.text.Hyphenation');
goog.require('tpo.text.Tokenizer');

goog.require('tpo.text.languages.en_us');

 /**
 * @typedef {!{ hyphenation: { patterns: !Object, leftmin: number, rightmin: number}, tokens: !Object.<tpo.text.Token.Class, RegExp>, id: string }}
 */
tpo.text.languages.Language;

/**
 * @type {!Object}
 */
tpo.text.languages.cache = {};

/**
 * @param {string} identifier
 * @return {!tpo.text.Tokenizer}
 */
tpo.text.languages.lookup = function(identifier) {
    if (tpo.text.languages.cache[identifier]) {
        return tpo.text.languages.cache[identifier];
    } else {
        return tpo.text.languages.cache['en_us'];
    }
};

/**
 * @param {tpo.text.languages.Language} language
 */
tpo.text.languages.register = function(language) {
    var identifier = language.id;

    if (!tpo.text.languages.cache[identifier]) {
        tpo.text.languages.cache[identifier] = new tpo.text.Tokenizer(language);
    }
};
