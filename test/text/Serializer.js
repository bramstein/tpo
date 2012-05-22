goog.require('tpo.text.Serializer');
goog.require('tpo.text.Token');
goog.require('tpo.util.DomPosition');

describe('tpo.text.Serializer', function() {
    var Serializer = tpo.text.Serializer,
        Token = tpo.text.Token,
        DomPosition = tpo.util.DomPosition;

    describe('#write', function() {
        it('handles elements without closing tags', function(done) {
            var serializer = new Serializer(),
                parent = document.createElement('div'),
                pre = null,
                post = null,
                el = null;

            parent.innerHTML = 'some<img>text';

            pre = parent.childNodes[0];
            el = parent.childNodes[1];
            post = parent.childNodes[2];

            serializer.data.add(function() {
            });

            serializer.end.add(function() {
                expect(parent.childNodes[0].classList.contains('ruler')).to.be.ok();
                expect(parent.childNodes[1].nodeName).to.eql('IMG');
                expect(parent.childNodes[2].classList.contains('ruler')).to.be.ok();
                done();
            });

            serializer.write(new DomPosition(parent, pre.nextSibling), new Token(pre.textContent, 0));
            serializer.write(new DomPosition(parent, post.nextSibling), new Token(post.textContent, 0));
            parent.removeChild(pre);
            parent.removeChild(post);

            serializer.close();
        });
    });
});
