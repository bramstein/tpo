goog.provide('tpo');

goog.require('tpo.text.Hyphenator');
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
        Hyphenator = tpo.text.Hyphenator;

    tpo.init = function(root, selector) {
        var fragment = window.document.createDocumentFragment(),
            elements = null;

        fragment.appendChild(root);

        debug.info('Start wrapping and hyphenating.');
        elements = array.toArray(fragment.querySelectorAll(selector));

        elements.forEach(function(node) {
            var parser = new Parser(),
                tokenizer = new Tokenizer(tpo.text.languages.en_us),
                breakAction = new BreakAction(),
                serializer = new Serializer(),
                debugStream = new DebugStream();

            parser.pipe(tokenizer);
            tokenizer.pipe(breakAction);
            breakAction.pipe(serializer);

            parser.write(node);
            parser.close();
        });

        window.document.body.appendChild(fragment);
        debug.info('Wrapped and hyphenated all words, triggering reflow');
        window.document.documentElement.classList.add('tpo-loaded');

        debug.info('Starting measurements');
        var rulers = array.toArray(root.querySelectorAll('.box')),
            widths = [],
            tmp = null;

        for (var i = 0; i < rulers.length; i += 1) {
            tmp = window.getComputedStyle(rulers[i], null);
            widths[i] = tmp['width'] + tmp['font-family'] + tmp['font-size'] + tmp['font-style'] + tmp['height'];//rulers[i].scrollWidth;
        }
        debug.info('Done measuring rulers');
    };

    if (window.document.querySelectorAll) {
        debug.info('Starting...');
        tpo.init(document.getElementById('tpo-content'), 'p');
    } else {
        debug.error('Missing required querySelectorAll');
    }
});
