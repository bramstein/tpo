goog.provide('tpo');

goog.require('tpo.text.Hyphenation');
goog.require('tpo.text.languages.en_us');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.util.debug');
goog.require('tpo.util.array');

goog.scope(function() {
    var debug = tpo.util.debug,
        array = tpo.util.array,
        Tokenizer = tpo.text.Tokenizer;

/*
    function rewrite(root) {
        var queue = [root],
            h = new tpo.text.Hyphenation(tpo.text.language.en_us),
            node = null,
            parent = null,
            boxes = null,
            span = null;
        
        while(queue.length !== 0) {
            node = queue.pop();
            
            if (node.nodeType === 3 && !/^\s*$/.test(node.textContent)) {
                parent = node.parentNode;
                parent.removeChild(node);
                boxes = token.tokenizeString(node.textContent);
                
                boxes.forEach(function(box, i) {
                    var span = document.createElement('span'),
                        tokens = null;
                                                
                    span.classList.add('ruler');
                    
                    if (box.length > 5) {
                        tokens = token.tokenizeBox(box);
                        
                        for (var j = 0, len = tokens.length; j < len; j += 1) {
                            if (tokens[j].length > 5) {
                                tokens[j] = h.hyphenate(tokens[j]).join('\u00AD');
                            }
                        }
                        span.textContent = tokens.join('');
                    } else {
                        span.textContent = box;
                    }
                    
                    parent.insertBefore(span, node.nextSibling);
                    
                    if (i < boxes.length - 1) {
                        parent.insertBefore(document.createTextNode(' '), node.nextSibling);
                    }
                });
            } else {
                for(var j=0; j < node.childNodes.length; j++) {
                    queue.push(node.childNodes[j]);
                }
            }
        }
    }
*/
    tpo.init = function(root, selector) {
        var fragment = window.document.createDocumentFragment(),
            elements = null,
            h = new tpo.text.Hyphenation(tpo.text.languages.en_us),
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
                    boxes = tokenizer.parse(child.textContent);
                    
                    boxes.forEach(function(box, i) {
                        var span = document.createElement('span'),
                            items = null;
                            
                        span.classList.add('ruler');
                        
                        if (box.length > 50000) {
                            items = h.hyphenate(box);
                            
                            if (items.length === 1 && items[0].length > 1) {
                                items[0].forEach(function(part) {
                                    var subspan = document.createElement('span');
                                    subspan.classList.add('sub-ruler');
                                    subspan.textContent = part;
                                    span.appendChild(subspan);
                                });
                            } else if (items.length === 1 && items[0].length === 1) {
                                span.textContent = box;
                            } else {
                                //console.log(items);
                            }
                        } else {
                            if (box.charAt(0) === ' ') {
                                span.innerHTML = box.replace(' ', '&nbsp;');
                            } else {
                                span.textContent = box;
                            }
                        }
                        parent.insertBefore(span, nextSibling);
                    });
                }
            });
        });
        //rewrite(fragment);
        window.document.body.appendChild(fragment);
        debug.info('Wrapped and hyphenated all words, triggering reflow');
        window.document.documentElement.classList.add('tpo-loaded');
    
        debug.info('Starting measurements');
        var rulers = array.toArray(root.querySelectorAll('.ruler')),
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