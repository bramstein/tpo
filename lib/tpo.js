goog.provide('tpo');

goog.require('tpo.preprocessor.Preprocessor');

goog.require('tpo.layout.TextContainer');
goog.require('tpo.layout.TextFlow');

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
        TextFlow = tpo.layout.TextFlow,
        Preprocessor = tpo.preprocessor.Preprocessor;

    tpo.load = function(el) {
        if (!tpo.PREPROCESSED) {
            var preprocessor = new Preprocessor();
            preprocessor.process(el);
        }

        window.document.body.offsetWidth;

        function createTextNode(x, y, text) {
            var span = dom.createElement('span');
            span.style.position = 'absolute';
            span.style.left = x + 'px';
            span.style.top = y + 'px';
            span.textContent = text;
            return span;
        }

        var styles = document.getElementById('tpo-styles'),
            data = window['tpo-data'];

        if (styles && data) {
            var container = new TextContainer(el, styles, data),
                textFlow = new TextFlow();

            debug.time('setting type');
            var boxes = container.blocks.map(function(b) {
               return textFlow.flow(b);
            });
            debug.timeEnd('setting type');

            var fragment = window.document.createDocumentFragment();

            fragment.appendChild(el);

            debug.time('removing old type');
            var textNodes = dom.query('.tpo-text', fragment);

            for (var i = 0; i < textNodes.length; i += 1) {
                dom.empty(textNodes[i]);
            }
            debug.timeEnd('removing old type');

            debug.time('layout type');
            container.blocks.forEach(function(block, j) {
                var y = 0;

                for (var b = 0; b < boxes[j].length; b += 1) {
                    var nodes = boxes[j][b].nodes;

                    for (var i = 0; i < nodes.length; i += 1) {
                        var node = nodes[i],
                            text = block.getText(node);

                        if (text) {
                            var span = createTextNode(block.getX(node), y, text);
                            block.getPosition(node).appendChild(span);
                        }
                    }
                    y += Math.max(boxes[j][b].height);
                }

                block.element.style.height = y + 'px';
                block.element.style.position = 'relative';
            });
            window.document.body.appendChild(fragment);
            debug.timeEnd('layout type');
        } else {
            debug.error('Preprocessing failed or non-existent in this document.');
        }
    };
});

goog.exportSymbol('tpo.load', tpo.load);
