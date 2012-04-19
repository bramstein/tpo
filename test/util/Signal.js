goog.require('tpo.util.Signal');

describe('tpo.util.Signal', function() {
    var Signal = tpo.util.Signal;

    function listenerOne() {
    }
    
    function listenerTwo() {
    }

    describe('#constructor', function() {
        it('should have a listeners array', function() {
            expect(new Signal()).to.eql({listeners: [], active: true});
        });
    });
    
    describe('#add', function() {
        var e = new Signal();
        it('have one listener', function() {
            e.add(listenerOne);
            expect(e.listeners.length).to.eql(1);
            expect(e.listeners[0]).to.eql(listenerOne);
        });
                
        it('have two listeners', function() {
            e.add(listenerTwo);
            expect(e.listeners.length).to.eql(2);
            expect(e.listeners[1]).to.eql(listenerTwo);
        });
    });
    
    describe('#has', function() {
        var e = new Signal();
        e.add(listenerOne);
        
        it('have listener one', function() {
            expect(e.has(listenerOne)).to.be(true);
        });
        
        it('not have listener two', function() {
            expect(e.has(listenerTwo)).to.be(false);
        });
    });
    
    describe('#remove', function() {
        var e = new Signal();
        e.add(listenerOne);
        e.add(listenerTwo);
        
        it('remove one', function() {
            e.remove(listenerOne);
            expect(e.listeners.length).to.eql(1);
            expect(e.has(listenerOne)).to.be(false);
        });
        
        it('remove two', function() {
            e.remove(listenerTwo);
            expect(e.listeners.length).to.eql(0);
            expect(e.has(listenerTwo)).to.be(false);
        });
        
        it('remove again', function() {
            e.remove(listenerOne);
            expect(e.listeners.length).to.eql(0);
        });
    });
    
    describe('#removeAll', function() {
        var e = new Signal();
        e.add(listenerOne);
        e.add(listenerTwo);
        it('remove all listeners', function() {
            e.removeAll();
            expect(e.listeners.length).to.eql(0);
        });
    });
    
    describe('#dispatch', function() {
        
        it('dispatch to one listener', function(done) {
            var e = new Signal();
            e.add(function() {
                done();
            });
            e.dispatch();
        });
        
        it('dispatch to two listeners', function(done) {
            var e = new Signal();
            e.add(function() {
            });
            e.add(function() {
                done();
            });
            e.dispatch();
        });
        
        it('dispatch with arguments', function(done) {
            var e = new Signal();
            e.add(function(a, b) {
                expect(a).to.eql(42);
                expect(b).to.eql(20);
                done();
            });
            e.dispatch(42, 20);
        });
        
        it('does not dispatch when not active', function() {
            var e = new Signal();
            e.active = false;
            e.add(function() {
                throw 'Error';
            });
            e.dispatch();
        });
        
        it('set active during event dispatch', function(done) {
            var e = new Signal();
            
            e.add(function() {
                e.active = false;
                setTimeout(function() {
                    done();
                }, 100);
            });
            e.add(function() {
                throw 'Error';
            });
            e.dispatch();
        });
    });
});