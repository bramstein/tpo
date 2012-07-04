goog.require('tpo.text.BreakAction');
goog.require('tpo.text.Token');
goog.require('tpo.text.Tokenizer');

describe('tpo.text.BreakAction', function() {
    var BreakAction = tpo.text.BreakAction,
        Token = tpo.text.Token;

    describe('#write', function(done) {
        it('handle a single token', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.SP)];

            breakAction.find(tokens);

            expect(tokens[0].tokenClass).to.eql(Token.Class.SP);
            expect(tokens[0].breakAction).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handle two tokens', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.AL), new Token(2, Token.Class.AL)];

            breakAction.find(tokens);

            expect(tokens[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[1].breakAction).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handle indirect breaks (AL, SP, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.AL), new Token(2, Token.Class.SP), new Token(3, Token.Class.AL)];

            breakAction.find(tokens);

            expect(tokens[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[1].breakAction).to.eql(BreakAction.Type.INDIRECT);
            expect(tokens[2].breakAction).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles direct breaks (AL, B2, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.AL), new Token(2, Token.Class.B2), new Token(3, Token.Class.AL)];

            breakAction.find(tokens);

            expect(tokens[0].breakAction).to.eql(BreakAction.Type.DIRECT);
            expect(tokens[1].breakAction).to.eql(BreakAction.Type.DIRECT);
            expect(tokens[2].breakAction).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles explicit breaks (AL, NL, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.NL),
                    new Token(3, Token.Class.AL),
                    new Token(4, Token.Class.AL)
                ];

            breakAction.find(tokens);

            expect(tokens[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[1].breakAction).to.eql(BreakAction.Type.EXPLICIT);
            expect(tokens[2].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[3].breakAction).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles prohibited breaks (AL, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.AL),
                    new Token(3, Token.Class.AL)
                ];

            breakAction.find(tokens);

            expect(tokens[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[1].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[2].breakAction).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles soft hyphens (AL, BA, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.BA),
                    new Token(3, Token.Class.AL),
                    new Token(4, Token.Class.AL)
                ];

            breakAction.find(tokens);

            expect(tokens[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[1].breakAction).to.eql(BreakAction.Type.DIRECT);
            expect(tokens[2].breakAction).to.eql(BreakAction.Type.PROHIBITED);
            expect(tokens[3].breakAction).to.eql(BreakAction.Type.EXPLICIT);
        });

        // TODO: Test combining classes
    });
});
