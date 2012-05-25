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
        debug.info('Waiting for tpo.load to be called');
    };

    tpo.reflow = function(paragraphs, root) {
        var fragment = window.document.createDocumentFragment();

        fragment.appendChild(root);

        dom.query('.container', fragment).forEach(function(container) {
            container.parentNode.replaceChild(container.childNodes[0], container);
        });

        dom.query('.ruler, .type', fragment).forEach(function(ruler) {
            ruler.parentNode.removeChild(ruler);
        });

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
                        if (node.isBox || node.isGlue || node.isPenalty) {
                            var span = document.createElement('span');

                            span.classList.add('type');

                            span.style.left = x.toFixed(3) + 'px';
                            span.style.top = y.toFixed(3) + 'px';

                            if (node.isBox) {
                                span.textContent = node.value;
                                x += node.width;
                                maxHeight = Math.max(maxHeight, node.height);
                            } else if (node.isGlue) {
                                span.textContent = '\u00A0';
                                x += node.width + line.ratio * (line.ratio < 0 ? node.shrink : node.stretch);
                            } else if (node.isPenalty && node.penalty === Justification.Demerits.HYPHEN && index === array.length - 1) {
                                span.textContent = '\u2010';
                                x += node.width;
                            }
                            node.position.parent.insertBefore(span, node.position.nextSibling);
                        } else if (node.isElement) {
                            var span = document.createElement('span');

                            span.classList.add('container');
                            span.classList.add('type');
                            span.style.left = x.toFixed(3) + 'px';
                            span.style.top = y.toFixed(3) + 'px';

                            node.element.parentNode.replaceChild(span, node.element);
                            span.appendChild(node.element);
                            x += node.width;
                        }
                    });
                    y += maxHeight;
                });
            }

            p.element.style.height = y + 'px';
            p.element.style.position = 'relative';
        });

        window.document.body.appendChild(fragment);
    };

    tpo.load = function(query, root) {

        debug.info('Starting measurements');
        var elements = dom.query(query, root),
            resizing = false,
            paragraphs = elements.map(function(element) {
                return new Paragraph(element);
            });

        debug.info('Finished measurements, start typesetting');

        tpo.reflow(paragraphs, root);

        window.addEventListener('resize', function() {

            if (!resizing) {
                resizing = true;
                paragraphs.forEach(function(p) {
                    p.widths = [p.element.clientWidth];
                });
                tpo.reflow(paragraphs, root);
            }

            window.setTimeout(function() {
                resizing = false;
            }, 100);
        }, false);
        debug.info('Finished typesetting');
    };
});

goog.exportSymbol('tpo.init', tpo.init);
goog.exportSymbol('tpo.load', tpo.load);
