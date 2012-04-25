goog.require('tpo.util.Stream');

describe('tpo.util.Stream', function() {
    var Stream = tpo.util.Stream;

    function ReadStream() {
        var that = this;
        Stream.call(that);
        
        window.setTimeout(function() {
            that.data.dispatch(1);
            window.setTimeout(function() {
                that.data.dispatch(2);
                that.end.dispatch();
            }, 10);
        }, 10);
    }
    goog.inherits(ReadStream, Stream);

    function WriteStream(write, close) {
        var that = this;
        tpo.util.Stream.call(that);
        
        this.write = write;
        this.close = close;
    }
    goog.inherits(WriteStream, Stream);
    
    
    function ErrorStream() {
        var that = this;
        Stream.call(that);
        
        this.write = function() {
            that.error.dispatch('Error');
        };
    }
    goog.inherits(ErrorStream, Stream);
    
    describe('#constructor', function() {
        var s = new Stream();
        it('creates a stream', function() {
            expect(s.writable).to.eql(true);
            expect(s.readable).to.eql(true);
            expect(s.data).to.be.ok();
            expect(s.error).to.be.ok();
            expect(s.end).to.be.ok();
        });
    });
    
    describe('#pipe', function() {
        it('pipes a read stream to a write stream', function(done) {
            var i = 0,
                r = new ReadStream(),
                w = new WriteStream(function(v) {
                    if (i == 0) {
                        expect(v).to.eql(1);
                        i += 1;
                    } else {
                        expect(v).to.eql(2);
                        done();
                    }
                }, function() {});
                
            r.pipe(w);
        });
        
        it('calls close when the readstream has finished writing', function(done) {
            var r = new ReadStream(),
                w = new WriteStream(function() {}, done);
        
            r.pipe(w);
        });
        
        it('throws an exception when there is no error handler', function() {
            var r = new Stream(),
                e = new ErrorStream();

            r.pipe(e);
            
            expect(function() { r.data.dispatch('whoops!'); }).to.throwError();
        });
        
        it('does not throw an exception when there is an error handler', function(done) {
            var r = new Stream(),
                e = new ErrorStream();
            
            e.error.add(function() {
                done();
            });
            r.pipe(e);
            r.data.dispatch('whoops!');
        });
    });
});