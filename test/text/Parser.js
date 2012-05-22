goog.require('tpo.text.Parser');

describe('tpo.text.Parser', function() {
    var Parser = tpo.text.Parser;

    function createElement(content) {
        var el = document.createElement('div');
        el.innerHTML = content;
        return el;
    }

    describe('#write', function() {
        it('fires events correctly', function(done) {
            var parser = new Parser(),
                el = createElement('text');

            parser.data.add(function(p, t) {
                expect(t).to.eql('text');
                expect(p).to.eql({ parent: el, nextSibling: null});
            });
            parser.end.add(done);
            parser.write(el);
            parser.close();
        });

        it('detaches the node from its parent', function(done) {
            var parser = new Parser(),
                el = createElement('text');

            parser.data.add(function(p) {
                expect(p.parent.childNodes.length).to.eql(0);
            });

            parser.end.add(done);
            parser.write(el);
            parser.close();
        });

        it('parses complex content', function(done) {
            var parser = new Parser(),
                result = [],
                el = createElement('text <a href="#">some <strong>bold</strong></a> text');

            parser.data.add(function() {
                result.push(arguments);
            });

            parser.end.add(function() {
                expect(result[0][1]).to.eql('text ');
                expect(result[0][0].parent).to.eql(el);
                expect(result[1][1]).to.eql('some ');
                expect(result[1][0].parent).to.eql(el.childNodes[0]);
                expect(result[2][1]).to.eql('bold');
                expect(result[2][0].parent).to.eql(el.childNodes[0].childNodes[0]);
                expect(result[3][1]).to.eql(' text');
                expect(result[3][0].parent).to.eql(el);
                done();
            });

            parser.write(el);
            parser.close();
        });

        it('handles <br> correctly', function(done) {
            var parser = new Parser(),
                result = [],
                el = createElement('some<br>text');

            parser.data.add(function() {
                result.push(arguments);
            });

            parser.end.add(function() {
                expect(result[0][1]).to.eql('some');
                expect(result[0][0].parent).to.eql(el);
                expect(result[1][1]).to.eql('\u0085');
                expect(result[1][0].parent).to.eql(el);
                expect(result[2][1]).to.eql('text');
                expect(result[2][0].parent).to.eql(el);
                done();
            });

            parser.write(el);
            parser.close();
        });
    });
});
