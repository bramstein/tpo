goog.provide('tpo.preprocessor.Preprocessor');

goog.require('tpo.preprocessor.TextContainer');

goog.require('tpo.util.dom');
goog.require('tpo.util.debug');

goog.require('tpo.text.languages');
goog.require('tpo.text.languages.en_us');

/**
 * @constructor
 */
tpo.preprocessor.Preprocessor = function() {
    tpo.text.languages.register(tpo.text.languages.en_us);
};

goog.scope(function() {
    var Preprocessor = tpo.preprocessor.Preprocessor,
        TextContainer = tpo.preprocessor.TextContainer,

        dom = tpo.util.dom,
        debug = tpo.util.debug;

    /**
     * @param {!Element} el
     */
    Preprocessor.prototype.process = function (el) {
        debug.info('Preprocessor: starting');

        var container = new TextContainer(el),
            styles = dom.createElement('div'),
            script = dom.createElement('script'),
            serialized = container.serialize();

        script.textContent = 'window["tpo-data"] = ' + window.JSON.stringify({words: serialized.words, nodes: serialized.data}) + ';';

        Object.keys(serialized.styles).forEach(function(style) {
            var characterGroup = dom.createElement('div'),
                chars = Object.keys(serialized.styles[style]);

            characterGroup.style.cssText = style;

            chars.forEach(function(c) {
                var span = dom.createElement('span'),
                    word = c;
                span.style.cssText = 'position: relative; display: inline-block;';

                if (word === ' ') {
                    word = '\u00A0';
                } else if (word === '\u00AD') {
                    word = '\u2010';
                }
                span.textContent = word;
                characterGroup.appendChild(span);
            });

            styles.appendChild(characterGroup);
        });

        styles.style.cssText = 'position: absolute; visibility:hidden; top: 0; left: 0;';
        styles.id = 'tpo-styles';

        script.id = 'tpo-data';

        window.document.body.appendChild(script);
        window.document.body.appendChild(styles);

        debug.info('Preprocessor: finished');
    };
});
