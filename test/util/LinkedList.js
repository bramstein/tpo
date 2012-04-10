goog.require('tpo.util.LinkedList');
goog.require('tpo.util.LinkedListNode');

describe('tpo.util.LinkedList', function() {
    var List = tpo.util.LinkedList,
        Node = tpo.util.LinkedListNode;

    describe('#constructor', function() {
        it('should have a head, tail and size property', function() {
            expect(new List()).to.eql({head: null, tail: null, size: 0});
        });
    });
    describe('#isEmpty', function() {
        it('should return true on a new list', function() {
            expect(new List().isEmpty()).to.be(true);
        });
    });
    describe('#push', function() {
        var list = new List();
        
        it('add one item to the list', function() {
            list.push(new Node(2));
            expect(list.getSize()).to.eql(1);
        });
        
        it('add another item to the list', function() {
            list.push(new Node(1));
            expect(list.getSize()).to.eql(2);
        });
    });
    
    describe('#insertAfter', function() {
        var list = new List(),
            one = new Node(1),
            two = new Node(2),
            three = new Node(3),
            four = new Node(4),
            five = new Node(5),
            six = new Node(6);
            
        list.push(one);
        list.push(three);
        
        it('insert the item in the middle', function() {
            list.insertAfter(one, two);
            expect(list.getSize()).to.eql(3);
            expect(list.at(0).value).to.eql(1);
            expect(list.at(1).value).to.eql(2);
            expect(list.at(2).value).to.eql(3);
        });
        
        it('insert the item at the end', function() {
            list.insertAfter(three, four);
            expect(list.getSize()).to.eql(4);
            expect(list.at(3).value).to.eql(4);
        });
        
        it('not modify the list', function() {
            list.insertAfter(five, six);
            expect(list.getSize()).to.eql(4);
            expect(five.next).to.be(null);
            expect(five.prev).to.be(null);
            expect(six.next).to.be(null);
            expect(six.prev).to.be(null);
        });
    });
    
    describe('#insertBefore', function() {
        var list = new List(),
            one = new Node(1),
            two = new Node(2),
            three = new Node(3),
            four = new Node(4),
            five = new Node(5),
            six = new Node(6);
            
        list.push(two);
        list.push(four);
        
        it('insert the item in the middle', function() {
            list.insertBefore(four, three);
            expect(list.getSize()).to.eql(3);
            expect(list.at(0).value).to.eql(2);
            expect(list.at(1).value).to.eql(3);
            expect(list.at(2).value).to.eql(4);
        });
        
        it('insert the item at the start', function() {
            list.insertBefore(two, one);
            expect(list.getSize()).to.eql(4);
            expect(list.at(0).value).to.eql(1);
        });
        
        it('not modify the list', function() {
            list.insertBefore(five, six);
            expect(list.getSize()).to.eql(4);
            expect(five.next).to.be(null);
            expect(five.prev).to.be(null);
            expect(six.next).to.be(null);
            expect(six.prev).to.be(null);
        });
    });

    describe('#toArray', function() {
        var list = new List(),
            one = new Node(1),
            two = new Node(2);
            
        list.push(one);
        list.push(two);
        
        it('return an array', function() {
            expect(list.toArray()).to.be.an('array');
            expect(list.toArray()).to.eql([one, two]);
        });
    });
    
    describe('#forEach', function() {
        var list = new List(),
            one = new Node(1),
            two = new Node(2),
            result = [];
                        
        list.push(one);
        list.push(two);
        
        it('iterates over all items', function() {
            list.forEach(function (node) {
                result.push(node.value);
            });
            expect(result).to.eql([1, 2]);
        });
    });
    
    describe('#contains', function() {
        var list = new List(),
            one = new Node(1),
            two = new Node(2),
            three = new Node(3);
            
        list.push(one);
        list.push(two);
        
        it('contains the correct items', function() {
            expect(list.contains(one)).to.be.ok();
            expect(list.contains(two)).to.be.ok();
        });
        
        it('does not contain others', function() {
            expect(list.contains(three)).not.to.be.ok();
        });
    });

    describe('#pop', function() {
        var list = new List();
        list.push(new Node(1));
        list.push(new Node(2));
                
        it('pop of the last item', function() {
            var item = list.pop();
            expect(item.value).to.eql(2);
            expect(item.next).to.be(null);
            expect(item.prev).to.be(null);
        });
        
        it('reduce the list size', function() {
            expect(list.getSize()).to.eql(1);
        });
        
        it('pop another item', function() {
            var item = list.pop();
            expect(item.value).to.eql(1);
        });
        
        it('be an empty list', function() {
            expect(list.getSize()).to.eql(0);
            expect(list.tail).to.be(null);
            expect(list.head).to.be(null);
        });
        
        it('should return null on an empty list', function() {
            var item = list.pop();
            expect(item).to.be(null);
        });
    });
    
    describe('#shift', function() {
        var list = new List();
        list.push(new Node(1));
        list.push(new Node(2));
                
        it('shift the first item', function() {
            var item = list.shift();
            expect(item.value).to.eql(1);
            expect(item.next).to.be(null);
            expect(item.prev).to.be(null);
        });
        
        it('reduce the list size', function() {
            expect(list.getSize()).to.eql(1);
        });
        
        it('shift another item', function() {
            var item = list.shift();
            expect(item.value).to.eql(2);
        });
        
        it('be an empty list', function() {
            expect(list.getSize()).to.eql(0);
            expect(list.tail).to.be(null);
            expect(list.head).to.be(null);
        });
        
        it('should return null on an empty list', function() {
            var item = list.shift();
            expect(item).to.be(null);
        });
    });
    
    describe('#at', function() {
        var list = new List();
        list.push(new Node(1));
        list.push(new Node(2));
        
        it('return the correct items', function() {
            expect(list.at(0).value).to.eql(1);
            expect(list.at(1).value).to.eql(2);
        });
        
        it('returns null when the index is out of bounds', function() {
            expect(list.at(-1)).to.be(null);
            expect(list.at(3)).to.be(null);
        });
    });
    
    describe('#remove', function() {
        var list = new List(),
            one = new Node(1),
            two = new Node(2),
            three = new Node(3),
            four = new Node(4);
            
        list.push(one);
        list.push(two);
        list.push(three);

        it('remove item not in list', function() {
            list.remove(four);
            expect(list.getSize()).to.eql(3);
        });
        
        it('remove the middle item', function() {
            list.remove(two);
            expect(list.getSize()).to.eql(2);
            expect(two.prev).to.be(null);
            expect(two.next).to.be(null);
        });
    
        it('remove last item', function() {
            list.remove(three);
            expect(list.getSize()).to.eql(1);
        });
        
        it('remove all items', function() {
            list.remove(one);
            expect(list.getSize()).to.eql(0);
            expect(list.head).to.be(null);
            expect(list.tail).to.be(null);
        });
    });
});