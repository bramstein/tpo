goog.require('tpo.text.BreakAction');
goog.require('tpo.text.Token');
goog.require('tpo.text.Tokenizer');

describe('tpo.text.BreakAction', function() {
    var BreakAction = tpo.text.BreakAction,
        Token = tpo.text.Token;

    describe('#write', function(done) {
        it('handles empty input', function() {
            var breakAction = new BreakAction();

            var actions = breakAction.find([]);

            expect(actions.length).to.eql(0);
        });

        it('handle a single token', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.SP)];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handle two tokens', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.AL), new Token(2, Token.Class.AL)];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[1]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handle indirect breaks (AL, SP, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.AL), new Token(2, Token.Class.SP), new Token(3, Token.Class.AL)];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[1]).to.eql(BreakAction.Type.INDIRECT);
            expect(actions[2]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles direct breaks (AL, B2, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [new Token(1, Token.Class.AL), new Token(2, Token.Class.B2), new Token(3, Token.Class.AL)];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.DIRECT);
            expect(actions[1]).to.eql(BreakAction.Type.DIRECT);
            expect(actions[2]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles explicit breaks (AL, NL, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.NL),
                    new Token(3, Token.Class.AL),
                    new Token(4, Token.Class.AL)
                ];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[1]).to.eql(BreakAction.Type.EXPLICIT);
            expect(actions[2]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[3]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles prohibited breaks (AL, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.AL),
                    new Token(3, Token.Class.AL)
                ];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[1]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[2]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles soft hyphens (AL, BA, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.BA),
                    new Token(3, Token.Class.AL),
                    new Token(4, Token.Class.AL)
                ];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[1]).to.eql(BreakAction.Type.DIRECT);
            expect(actions[2]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[3]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles question marks (AL, EX, SP, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.EX),
                    new Token(3, Token.Class.SP),
                    new Token(4, Token.Class.AL),
                    new Token(5, Token.Class.AL)
                ];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[1]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[2]).to.eql(BreakAction.Type.DIRECT);
            expect(actions[3]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[4]).to.eql(BreakAction.Type.EXPLICIT);
        });

        it('handles em dashes (AL, B2, AL, AL)', function() {
            var breakAction = new BreakAction(),
                tokens = [
                    new Token(1, Token.Class.AL),
                    new Token(2, Token.Class.B2),
                    new Token(3, Token.Class.AL),
                    new Token(4, Token.Class.AL)
                ];

            var actions = breakAction.find(tokens);

            expect(actions[0]).to.eql(BreakAction.Type.DIRECT);
            expect(actions[2]).to.eql(BreakAction.Type.DIRECT);
            expect(actions[3]).to.eql(BreakAction.Type.PROHIBITED);
            expect(actions[4]).to.eql(BreakAction.Type.EXPLICIT);

        });
        // TODO: Test combining classes
    });
});
