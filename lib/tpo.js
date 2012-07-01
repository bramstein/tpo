goog.provide('tpo');

goog.require('tpo.layout.Paragraph');
goog.require('tpo.layout.TextFlow');
goog.require('tpo.text.Hyphenator');
goog.require('tpo.text.Hyphenation');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.BreakAction');
goog.require('tpo.text.Serializer');
goog.require('tpo.text.Optimizer');
goog.require('tpo.text.Parser');
goog.require('tpo.text.languages.en_us');
goog.require('tpo.preprocessor.TextContainer');
goog.require('tpo.util.debug');
goog.require('tpo.util.dom');
goog.require('tpo.util.TextMetrics');

goog.scope(function() {
    var debug = tpo.util.debug,
        dom = tpo.util.dom,
        TextMetrics = tpo.util.TextMetrics,
        Paragraph = tpo.layout.Paragraph,
        TextFlow = tpo.layout.TextFlow,
        Tokenizer = tpo.text.Tokenizer,
        BreakAction = tpo.text.BreakAction,
        Parser = tpo.text.Parser,
        Optimizer = tpo.text.Optimizer,
        Serializer = tpo.text.Serializer,
        TextContainer = tpo.preprocessor.TextContainer,
        Hyphenator = tpo.text.Hyphenator,
        Hyphenation = tpo.text.Hyphenation;


    /**
     * @param {!Element} el
     */
    tpo.preprocess = function(el) {
        debug.info('Preprocessing started');

        var data = document.createElement('div'),
            textContainer = new TextContainer(el);

        debug.info('Preprocessing finished');

        data.id = 'tpo-data';
        window.document.body.appendChild(data);

        return data;
    };

    tpo.init = function(query, root) {
    /*
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
        debug.info('Waiting for tpo.load to be called');*/
    };

    tpo.load = function(el) {
        //var metrics = new TextMetrics();
        var data = document.getElementById('tpo-data');

        if (!data) {
            data = tpo.preprocess(el);
        }


/*
        var textFlow = new TextFlow();

        debug.info('Start measuring');

        //console.time('measuring');
        var elements = root.querySelectorAll(query),
            paragraphs = [];

        for (var i = 0; i < elements.length; i += 1) {
            paragraphs.push(new Paragraph(elements[i]));
        }
        //console.timeEnd('measuring');

        debug.info('Finished measurements, creating DOM fragment');


        var fragment = document.createDocumentFragment();

        fragment.appendChild(root);

        debug.info('Created DOM fragment, cleaning');

        var textNodes = fragment.querySelectorAll('.text');

        for (var i = 0; i < textNodes.length; i += 1) {
            dom.empty(textNodes[i]);
        }

        debug.info('Finished cleaning, start typesetting');

        //console.time('typesetting');
        var boxes = paragraphs.map(function(p) {
            return textFlow.flow(p.text);
        });
        //console.timeEnd('typesetting');

        debug.info('Finished typesetting, start layout');

        //console.time('layout');
        paragraphs.forEach(function(p, j) {
            var y = 0,
                textRun = p.text;

            for (var b = 0; b < boxes[j].length; b += 1) {
                var nodes = boxes[j][b].nodes;

                for (var i = 0; i < nodes.length; i += 1) {
                    var node = nodes[i],
                        span = document.createElement('span'),
                        text = textRun.getText(node);

                    if (text) {
                        span.style.position = 'absolute';
                        span.style.left = textRun.getX(node).toFixed(3) + 'px';
                        span.style.top = y.toFixed(3) + 'px';
                        span.textContent = text;

                        textRun.getPosition(node).appendChild(span);
                    }
                }
                y += Math.max(p.lineHeight, boxes[j][b].height);
            }

            p.element.style.height = y + 'px';
            p.element.style.position = 'relative';
        });
        //console.timeEnd('layout');

        debug.info('Finished layout, all done.');

        window.document.body.appendChild(fragment);
*/
    };
});

goog.exportSymbol('tpo.init', tpo.init);
goog.exportSymbol('tpo.load', tpo.load);
