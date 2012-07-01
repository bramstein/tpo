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

    describe('#parse', function() {
        it('empty input', function() {
            var t = new Tokenizer(language);

            expect(t.parse('')).to.eql([]);
        });

        it('returns one token', function() {
            var t = new Tokenizer(language),
                result = [];
                
            result = t.parse(' ');
            expect(result.length).to.eql(1);
            expect(result[0].tokenClass).to.eql(Token.Class.SP);
            expect(result[0].value).to.eql(' ');
        });

        it('returns more tokens', function() {
            var t = new Tokenizer(language),
                result = [];

            result = t.parse('some text');
            expect(result.length).to.eql(3);
            expect(result[0].tokenClass).to.eql(Token.Class.AL);
            expect(result[0].value).to.eql('some');

            expect(result[1].tokenClass).to.eql(Token.Class.SP);
            expect(result[1].value).to.eql(' ');

            expect(result[2].tokenClass).to.eql(Token.Class.AL);
            expect(result[2].value).to.eql('text');
        });
    });
});
