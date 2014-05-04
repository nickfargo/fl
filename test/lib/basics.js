// Generated by CoffeeScript 1.7.1
(function() {
  var Sequence, apply, cycle, expect, increment, interleave, interpose, iterate, map, range, reduce, reductions, repeat, sum, take, toArray, _ref;

  expect = require('chai').expect;

  _ref = require('fl'), Sequence = _ref.Sequence, map = _ref.map, sum = _ref.sum, increment = _ref.increment, repeat = _ref.repeat, cycle = _ref.cycle, iterate = _ref.iterate, range = _ref.range, apply = _ref.apply, reduce = _ref.reduce, reductions = _ref.reductions, interleave = _ref.interleave, interpose = _ref.interpose, take = _ref.take, toArray = _ref.toArray;

  describe("a few basics:", function() {
    it("does `range`, `interleave`, `toArray`", function() {
      var array;
      array = toArray(interleave([0, 1, 2], range(3, 9), [9, 10, 11, 12]));
      return expect(array.join(' ')).to.equal('0 3 9 1 4 10 2 5 11');
    });
    it("does cast to `Sequence`, `cycle`, `take`", function() {
      var array;
      array = Sequence([1, 2, 3]).cycle().take(10).toArray();
      return expect(array.join(' ')).to.equal('1 2 3 1 2 3 1 2 3 1');
    });
    it("does `concat`", function() {
      var array;
      array = Sequence([4]).concat(Sequence.range(1, 4).cycle()).take(20).toArray();
      return expect(array.join(' ')).to.equal('4 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1');
    });
    return it("does `partition`", function() {
      var array;
      array = Sequence.range(40).partition(3, 10).map(function(s) {
        return toArray(s).join(' ');
      }).toArray();
      expect(array.join(' ')).to.equal('0 1 2 10 11 12 20 21 22 30 31 32');
      array = Sequence.range(10).partition(4, 2).map(function(s) {
        return toArray(s).join(' ');
      }).toArray();
      expect(array.join(' ')).to.equal('0 1 2 3 2 3 4 5 4 5 6 7 6 7 8 9');
      array = Sequence.range(10).partition(6, 3, [97, 98, 99]).map(function(s) {
        return toArray(s).join(' ');
      }).toArray();
      return expect(array.join(' ')).to.equal('0 1 2 3 4 5 3 4 5 6 7 8 6 7 8 9 97 98');
    });
  });

  describe("a bit of performance:", function() {
    return it("skedaddles", function() {
      var i, m, n, square, t;
      square = function(x) {
        return x * x;
      };
      n = 1000;
      m = 10000;
      i = 0;
      t = Date.now();
      while (i++ < n) {
        Sequence.range(m).map(square).toArray();
      }
      t = Date.now() - t;
      return console.log("(n = " + n + ") * (m = " + m + ") : range, map, toArray -> " + t + " ms -> " + (n * m * 1000 / t) + " elem-op/s");
    });
  });

}).call(this);