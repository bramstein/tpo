goog.provide('tpo');

goog.require('tpo.layout.Paragraph');
goog.require('tpo.layout.Justification');
goog.require('tpo.text.Hyphenator');
goog.require('tpo.text.Hyphenation');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.BreakAction');
goog.require('tpo.text.Serializer');
goog.require('tpo.text.Parser');
goog.require('tpo.text.languages.en_us');
goog.require('tpo.util.debug');
goog.require('tpo.util.dom');

goog.scope(function() {
    var debug = tpo.util.debug,
        dom = tpo.util.dom,
        Tokenizer = tpo.text.Tokenizer,
        BreakAction = tpo.text.BreakAction,
        Parser = tpo.text.Parser,
        Serializer = tpo.text.Serializer,
        Hyphenator = tpo.text.Hyphenator,
        Hyphenation = tpo.text.Hyphenation;

    tpo.init = function(query, root) {
        var fragment = window.document.createDocumentFragment(),
            hyphenation = new Hyphenation(tpo.text.languages.en_us),
            elements = dom.query(query, root);

        fragment.appendChild(root);

        debug.info('Start tokenizing and hyphenating');

        elements.forEach(function(element) {
            var parser = new Parser(),
                tokenizer = new Tokenizer(tpo.text.languages.en_us),
                breakAction = new BreakAction(),
                hyphenator = new Hyphenator(hyphenation),
                serializer = new Serializer();

            parser.pipe(tokenizer);
            tokenizer.pipe(breakAction);
            breakAction.pipe(hyphenator);
            hyphenator.pipe(serializer);

            parser.write(element);
            parser.close();
        });

        window.document.body.appendChild(fragment);
        debug.info('Tokenized and hyphenated all words, triggering reflow');
        window.document.documentElement.classList.add('tpo-loaded');
        debug.info('Waiting for tpo.load');
    };

    tpo.load = function(query, root) {
        debug.info('Starting measurements');
        var elements = dom.query(query, root);

        elements.forEach(function(element) {
            var nodes = [],
                style = window.getComputedStyle(element, null);

            //console.log(style['text-align']);

            dom.walk(element, function(el) {
                var parent = el.parentNode,
                    breakClass = parent.getAttribute('data-break');

                if (parent.classList.contains('box')) {
                    //console.log('box', el.textContent, breakClass);
                } else if (parent.classList.contains('glue')) {
                    //console.log('glue', breakClass);
                } else {
                    // hyphenated box

                }
            });
        });

/*
        for (var i = 0; i < rulers.length; i += 1) {
            tmp = window.getComputedStyle(rulers[i], null);
            widths[i] = tmp['width'] + tmp['font-family'] + tmp['font-size'] + tmp['font-style'] + tmp['height'];//rulers[i].scrollWidth;
        }
*/
        debug.info('Done measuring rulers');
    };

    tpo.boot = function() {
        var root = document.getElementById('tpo-content'),
            query = 'p';

        debug.info('Starting tpo...');

        WebFont.load({
            typekit: {
              id: 'gmt7wca'
            },
            active: function() {
                debug.info('Fonts loaded, calling tpo.load');
                tpo.load(query, root);
            },
            inactive: function() {
                debug.info('Fonts failed to load, calling tpo.load regardless');
                tpo.load(query, root);
            }
        });
        tpo.init(query, root);

        //tpo.load(query, root);
    };

    if (window.document.querySelectorAll) {
        tpo.boot();
    } else {
        debug.error('Missing required querySelectorAll');
    }
});
