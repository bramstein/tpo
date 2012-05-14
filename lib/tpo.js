goog.provide('tpo');

goog.require('tpo.text.Hyphenator');
goog.require('tpo.text.Hyphenation');
goog.require('tpo.text.languages.en_us');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.BreakAction');
goog.require('tpo.text.Serializer');
goog.require('tpo.text.Parser');
goog.require('tpo.util.DebugStream');
goog.require('tpo.util.debug');
goog.require('tpo.util.array');

goog.scope(function() {
    var debug = tpo.util.debug,
        array = tpo.util.array,
        Tokenizer = tpo.text.Tokenizer,
        BreakAction = tpo.text.BreakAction,
        Parser = tpo.text.Parser,
        Serializer = tpo.text.Serializer,
        DebugStream = tpo.util.DebugStream,
        Hyphenator = tpo.text.Hyphenator,
        Hyphenation = tpo.text.Hyphenation;

    tpo.init = function(root, selector) {
        var fragment = window.document.createDocumentFragment(),
            hyphenation = new Hyphenation(tpo.text.languages.en_us),
            elements = null;

        fragment.appendChild(root);

        debug.info('Start tokenizing and hyphenating');
        elements = array.toArray(fragment.querySelectorAll(selector));

        elements.forEach(function(node) {
            var parser = new Parser(),
                tokenizer = new Tokenizer(tpo.text.languages.en_us),
                breakAction = new BreakAction(),
                hyphenator = new Hyphenator(hyphenation),
                serializer = new Serializer(),
                debugStream = new DebugStream();

            parser.pipe(tokenizer);
            tokenizer.pipe(breakAction);
            breakAction.pipe(hyphenator);
            hyphenator.pipe(serializer);

            parser.write(node);
            parser.close();
        });

        window.document.body.appendChild(fragment);
        debug.info('Tokenized and hyphenated all words, triggering reflow');
        window.document.documentElement.classList.add('tpo-loaded');
        debug.info('Waiting for tpo.load');
    };

    tpo.load = function(root, selector) {
        debug.info('Starting measurements');
        var rulers = array.toArray(root.querySelectorAll('.glue, .box')),
            widths = [],
            tmp = null;

        for (var i = 0; i < rulers.length; i += 1) {
            tmp = window.getComputedStyle(rulers[i], null);
            widths[i] = tmp['width'] + tmp['font-family'] + tmp['font-size'] + tmp['font-style'] + tmp['height'];//rulers[i].scrollWidth;
        }
        debug.info('Done measuring rulers');
    };

    tpo.boot = function() {
        var root = document.getElementById('tpo-content'),
            selector = 'p';

        debug.info('Starting tpo...');

        WebFont.load({
            google: {
              families: ['Droid Serif']
            },
            active: function() {
                debug.info('Fonts loaded, calling tpo.load');
                tpo.load(root, selector);
            }
        });
        tpo.init(root, selector);
    };

    if (window.document.querySelectorAll) {
        tpo.boot();
    } else {
        debug.error('Missing required querySelectorAll');
    }
});
