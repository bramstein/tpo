goog.provide('tpo.text.Serializer');

goog.require('tpo.util.Stream');
goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.BreakAction');

tpo.text.Serializer = function() {
    tpo.util.Stream.call(this);
};

goog.inherits(tpo.text.Serializer, tpo.util.Stream);

goog.scope(function() {
    var Serializer = tpo.text.Serializer,
        Tokenizer = tpo.text.Tokenizer;
    
    Serializer.prototype.write = function(parent, nextSibling, type, value, breakAction) {
        var span = window.document.createElement('span');
        if (type === Tokenizer.Class.SP) {
            span.textContent = ' ';
            span.classList.add('glue');
        } else {
            span.classList.add('box');
            span.textContent = value;
        }
        parent.insertBefore(span, nextSibling);
    };
    
    /**
     * @override
     */
    Serializer.prototype.close = function() {
        this.end.dispatch();
    };
});