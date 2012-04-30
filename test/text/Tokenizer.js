goog.require('tpo.text.Tokenizer');
goog.require('tpo.text.Token');

describe('tpo.text.Tokenizer', function() {
    var Tokenizer = tpo.text.Tokenizer,
        Token = tpo.text.Token,
        // Simple fake language that makes it easier to test
        language = {
            tokens: {
            }
        };

    language.tokens[Token.Class.SP] = /\s/;
    language.tokens[Token.Class.AL] = /[^\s]+/;

    describe('#constructor', function() {
        var t = new Tokenizer(language);
        it('has the tokens and token keys', function() {
            expect(t.tokens).to.eql(language.tokens);
            expect(t.tokenKeys).to.eql([Token.Class.AL.toString(), Token.Class.SP.toString()]);
        });
    });

    describe('#write', function() {
        it('empty input', function(done) {
            var t = new Tokenizer(language);

            t.data.add(function() {
                throw 'Error';
            });
            t.end.add(function() {
                done();
            });
            t.write(null, '');
            t.close();
        });

        it('returns one token', function(done) {
            var t = new Tokenizer(language),
                result = [];
            t.data.add(function(position, token) {
                result.push([token.tokenClass, token.value]);
            });
            t.end.add(function() {
                expect(result.length).to.eql(1);
                expect(result[0][0]).to.eql(Token.Class.SP);
                expect(result[0][1]).to.eql(' ');
                done();
            });
            t.write(null, ' ');
            t.close();
        });

        it('returns more tokens', function(done) {
            var t = new Tokenizer(language),
                result = [];
            t.data.add(function(position, token) {
                result.push([token.tokenClass, token.value]);
            });
            t.end.add(function() {
                expect(result.length).to.eql(3);
                expect(result[0][0]).to.eql(Token.Class.AL);
                expect(result[0][1]).to.eql('some');

                expect(result[1][0]).to.eql(Token.Class.SP);
                expect(result[1][1]).to.eql(' ');

                expect(result[2][0]).to.eql(Token.Class.AL);
                expect(result[2][1]).to.eql('text');
                done();
            });
            t.write(null, 'some text');
            t.close();
        });
    });
});
