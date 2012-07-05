goog.provide('tpo');

goog.require('tpo.preprocessor.Preprocessor');

goog.require('tpo.layout.TextContainer');

goog.require('tpo.util.debug');
goog.require('tpo.util.dom');

/**
 * @define {boolean}
 */
tpo.PREPROCESSED = false;

goog.scope(function() {
    var debug = tpo.util.debug,
        dom = tpo.util.dom,
        TextContainer = tpo.layout.TextContainer,
        Preprocessor = tpo.preprocessor.Preprocessor;

    tpo.load = function(el) {
        if (!tpo.PREPROCESSED) {
            var preprocessor = new Preprocessor();
            preprocessor.process(el);
        }

        var styles = document.getElementById('tpo-styles'),
            data = window['tpo-data'];

        if (styles && data) {
            var container = new TextContainer(el, styles, data);
        } else {
            debug.error('Preprocessing failed or non-existent in this document.');
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

goog.exportSymbol('tpo.load', tpo.load);
