goog.provide('tpo');

goog.require('tpo.text.Hyphenator');
goog.require('tpo.text.languages.en_us');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.util.debug');
goog.require('tpo.util.array');

goog.scope(function() {
    var debug = tpo.util.debug,
        array = tpo.util.array,
        Tokenizer = tpo.text.Tokenizer,
        Hyphenator = tpo.text.Hyphenator;

    tpo.init = function(root, selector) {
        var fragment = window.document.createDocumentFragment(),
            elements = null,
            hyphenator = new Hyphenator(tpo.text.languages.en_us),
            tokenizer = new Tokenizer(tpo.text.languages.en_us);
                    
        fragment.appendChild(root);
        
        debug.info('Start wrapping and hyphenating.');
        elements = array.toArray(fragment.querySelectorAll(selector));
        
        elements.forEach(function(el) {
            var children = array.toArray(el.childNodes);
            
            children.forEach(function(child) {
                var parent = child.parentNode,
                    nextSibling = child.nextSibling,
                    boxes = null;
                
                if (child.nodeType === 3 && !/^\s*$/.test(child.textContent)) {
                    parent.removeChild(child);
                    boxes = tokenizer.parse(child.textContent, child.nodeName !== 'P');
                    boxes = boxes.map(function(box) {
                        if (box.type === Tokenizer.LineBreakClass.AL && box.value.length > 5) {
                            box.value = hyphenator.hyphenate(box.value);
                            if (box.value.length === 1) {
                                box.value = box.value[0];
                            }
                        }
                        return box;
                    });

                    boxes.forEach(function (box, i) {
                        var span = document.createElement('span');

                        if (box.type === Tokenizer.LineBreakClass.SP) {
                            span.classList.add('glue');
                        } else {
                            span.classList.add('box');
                            span.setAttribute('data-type', box.type);
                            span.setAttribute('data-action', box.breakAction);
                        }

                        if (Array.isArray(box.value)) {
                            box.value.forEach(function(part) {
                                var subspan = document.createElement('span');
                                subspan.textContent = part;
                                span.appendChild(subspan);
                            });
                        } else {
                            span.textContent = box.value;
                        }
                        parent.insertBefore(span, nextSibling);
                    });
                }
            });
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
        tpo.init(document.getElementById('tpo-content'), 'p, p > em, p > strong, p > i, p > bold, p > span');
    } else {
        debug.error('Missing required querySelectorAll');
    }
});