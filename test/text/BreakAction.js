goog.require('tpo.text.BreakAction');
goog.require('tpo.text.Token');
goog.require('tpo.text.Tokenizer');

describe('tpo.text.BreakAction', function() {
    var BreakAction = tpo.text.BreakAction,
        Token = tpo.text.Token;

    describe('#write', function(done) {
        it('handle a single token', function(done) {
            var breakAction = new BreakAction();

            breakAction.data.add(function(p, t) {
                expect(t.tokenClass).to.eql(Token.Class.WJ);
                expect(t.breakAction).to.eql(BreakAction.Type.EXPLICIT);
            });
            breakAction.end.add(done);

            breakAction.write(null, new Token(1, Token.Class.SP));
            breakAction.close();
        });

        it('handle two tokens', function(done) {
            var breakAction = new BreakAction(),
                result = [];

            breakAction.data.add(function(p, t) {
                result.push(t);
            });
            breakAction.end.add(function() {
                expect(result[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
                expect(result[1].breakAction).to.eql(BreakAction.Type.EXPLICIT);
                done();
            });

            breakAction.write(null, new Token(1, Token.Class.AL));
            breakAction.write(null, new Token(2, Token.Class.AL));
            breakAction.close();
        });

        it('handle indirect breaks (AL, SP, AL)', function(done) {
            var breakAction = new BreakAction(),
                result = [];

            breakAction.data.add(function(p, t) {
                result.push(t);
            });
            breakAction.end.add(function() {
                expect(result[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
                expect(result[1].breakAction).to.eql(BreakAction.Type.INDIRECT);
                expect(result[2].breakAction).to.eql(BreakAction.Type.EXPLICIT);
                done();
            });

            breakAction.write(null, new Token(1, Token.Class.AL));
            breakAction.write(null, new Token(2, Token.Class.SP));
            breakAction.write(null, new Token(3, Token.Class.AL));
            breakAction.close();
        });

        it('handles direct breaks (AL, B2, AL)', function(done) {
            var breakAction = new BreakAction(),
                result = [];

            breakAction.data.add(function(p, t) {
                result.push(t);
            });

            breakAction.end.add(function() {
                expect(result[0].breakAction).to.eql(BreakAction.Type.DIRECT);
                expect(result[1].breakAction).to.eql(BreakAction.Type.DIRECT);
                expect(result[2].breakAction).to.eql(BreakAction.Type.EXPLICIT);
                done();
            });

            breakAction.write(null, new Token(1, Token.Class.AL));
            breakAction.write(null, new Token(2, Token.Class.B2));
            breakAction.write(null, new Token(3, Token.Class.AL));
            breakAction.close();
        });

        it('handles explicit breaks (AL, NL, AL)', function(done) {
            var breakAction = new BreakAction(),
                result = [];

            breakAction.data.add(function(p, t) {
                result.push(t);
            });

            breakAction.end.add(function() {
                expect(result[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
                expect(result[1].breakAction).to.eql(BreakAction.Type.EXPLICIT);
                expect(result[2].breakAction).to.eql(BreakAction.Type.EXPLICIT);
                done();
            });

            breakAction.write(null, new Token(1, Token.Class.AL));
            breakAction.write(null, new Token(2, Token.Class.NL));
            breakAction.write(null, new Token(3, Token.Class.AL));
            breakAction.close();
        });

        it('handles prohibited breaks (AL, AL, AL)', function(done) {
            var breakAction = new BreakAction(),
                result = [];

            breakAction.data.add(function(p, t) {
                result.push(t);
            });

            breakAction.end.add(function() {
                expect(result[0].breakAction).to.eql(BreakAction.Type.PROHIBITED);
                expect(result[1].breakAction).to.eql(BreakAction.Type.PROHIBITED);
                expect(result[2].breakAction).to.eql(BreakAction.Type.EXPLICIT);
                done();
            });

            breakAction.write(null, new Token(1, Token.Class.AL));
            breakAction.write(null, new Token(2, Token.Class.AL));
            breakAction.write(null, new Token(3, Token.Class.AL));
            breakAction.close();
        });

        // TODO: Test combining classes
    });
});
