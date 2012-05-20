goog.provide('tpo');

goog.require('tpo.layout.Paragraph');
goog.require('tpo.layout.Justification');
goog.require('tpo.text.Hyphenator');
goog.require('tpo.text.Hyphenation');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.BreakAction');
goog.require('tpo.text.Serializer');
goog.require('tpo.text.Optimizer');
goog.require('tpo.text.Parser');
goog.require('tpo.text.languages.en_us');
goog.require('tpo.util.debug');
goog.require('tpo.util.dom');

goog.scope(function() {
    var debug = tpo.util.debug,
        dom = tpo.util.dom,
        Paragraph = tpo.layout.Paragraph,
        Justification = tpo.layout.Justification,
        Tokenizer = tpo.text.Tokenizer,
        BreakAction = tpo.text.BreakAction,
        Parser = tpo.text.Parser,
        Optimizer = tpo.text.Optimizer,
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
                optimizer = new Optimizer(),
                hyphenator = new Hyphenator(hyphenation),
                serializer = new Serializer();

            parser.pipe(tokenizer);
            tokenizer.pipe(breakAction);
            breakAction.pipe(hyphenator);
            hyphenator.pipe(optimizer);
            optimizer.pipe(serializer);

            parser.write(element);
            parser.close();
        });

        window.document.body.appendChild(fragment);
        debug.info('Tokenized and hyphenated all words, triggering reflow');
        window.document.documentElement.classList.add('tpo-loaded');
        debug.info('Waiting for tpo.load');
    };

    tpo.reflow = function(paragraphs) {
        paragraphs.forEach(function(p) {
            var tolerances = [2, 3, 6, 12, 24],
                lines = [];

            for (var i = 0; i < tolerances.length; i += 1) {
                lines = p.makeLines(tolerances[i]);

                if (lines.length === 0) {
                    debug.warn('Could not set paragraph ' + (i + 1) + ' with tolerance `' + tolerances[i] + '`.');
                } else {
                    break;
                }
            }

            if (lines.length === 0) {
                debug.error('Failed to set paragraph ' + (i + 1));
            } else {
                var y = 0;

                lines.forEach(function(line) {
                    var x = 0,
                        maxHeight = p.lineHeight;

                    line.nodes.forEach(function (node, index, array) {
                        var span = document.createElement('span'),
                            el = node.position.nextSibling;

                        if (node.isBox) {
                            el.style.position = 'absolute';
                            el.style.left = x.toFixed(4) + 'px';
                            el.style.top = y + 'px';
                            x += node.width;
                            maxHeight = Math.max(maxHeight, node.height);
                        } else if (node.isGlue) {
                            x += node.width + line.ratio * (line.ratio < 0 ? node.shrink : node.stretch);
                        } else if (node.isPenalty && node.penalty === Justification.Demerits.HYPHEN && index === array.length - 1) {
                            el.style.position = 'absolute';
                            el.style.left = x.toFixed(4) + 'px';
                            el.style.top = y + 'px';
                            x += node.width;
                            el.done = true;
                        } else if (node.isPenalty && node.penalty === Justification.Demerits.HYPHEN && !el.done) {
                            el.style.display = 'none';
                        }
                    });
                    y += maxHeight;
                });
            }

            p.element.style.height = y + 'px';
            p.element.style.position = 'relative';
        });
    };

    tpo.load = function(query, root) {
        debug.info('Starting measurements');
        var elements = dom.query(query, root),
            paragraphs = elements.map(function(element) {
                return new Paragraph(element);
            });

        debug.info('Finished measurements, start typesetting');
        tpo.reflow(paragraphs);

        /*window.addEventListener('resize', function() {
            paragraphs.forEach(function(p) {
                p.widths = [p.element.clientWidth];
            });
            tpo.reflow(paragraphs);
        }, false);*/
        debug.info('Finished typesetting');
    };

    tpo.boot = function() {
        var root = document.getElementById('tpo-content'),
            query = 'p';

        debug.info('Starting tpo...');

        /*WebFont.load({
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
        });*/
        tpo.init(query, root);

        tpo.load(query, root);
    };

    if (window.document.querySelectorAll) {
        tpo.boot();
    } else {
        debug.error('Missing required querySelectorAll');
    }
});
