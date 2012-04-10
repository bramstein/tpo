goog.require('tpo.text.token');

describe('tpo.text.token', function() {
    var t = tpo.text.token;

    describe('#tokenizeString', function() {
        it('tokenize plain text correctly', function() {
            expect(t.tokenizeString('A sample text')).to.eql(['A', 'sample', 'text']);
        });
        
        it('tokenize punctuation correctly', function() {
            expect(t.tokenizeString('Short. Sentence.')).to.eql(['Short.', 'Sentence.']);
            expect(t.tokenizeString('"A quote". Why not?')).to.eql(['"A', 'quote".', 'Why', 'not?']);
            expect(t.tokenizeString('Some exclamation marks!!')).to.eql(['Some', 'exclamation', 'marks!!']);
            
            expect(t.tokenizeString('A sentence, with a large $400,000 number.')).to.eql(['A', 'sentence,', 'with', 'a', 'large', '$400,000', 'number.']);
            expect(t.tokenizeString('There is something to be said w.r.t. the solution.')).to.eql(['There', 'is', 'something', 'to', 'be', 'said', 'w.r.t.', 'the', 'solution.']);
            expect(t.tokenizeString('to be; or not')).to.eql(['to', 'be;', 'or', 'not']);
        });
        
        it('tokenize html entities', function() {
            expect(t.tokenizeString('&copy;&amp;')).to.eql(['&copy;&amp;']);
            expect(t.tokenizeString('two&nbsp;words')).to.eql(['two&nbsp;words']);
        });
    });

    describe('#tokenizeBox', function() {
        it('tokenizes boxes correctly', function() {
            expect(t.tokenizeBox('marks!!')).to.eql(['marks', '!!']);
            expect(t.tokenizeBox('$400,000')).to.eql(['$', '400', ',', '000']);
            expect(t.tokenizeBox('something,')).to.eql(['something', ',']);
        });
    
        it('treat &nbsp; correctly', function() {
            expect(t.tokenizeBox('two&nbsp;words')).to.eql(['two', '\u00A0', 'words']);
        });
    });
});