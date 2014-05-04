// Generated by CoffeeScript 1.7.1
(function() {
  var apply, callable, complement, concat, cycle, decrement, drop, dropUntil, dropWhile, filter, generatorOf, identity, increment, interleave, interpose, isEven, isOdd, iterate, map, multiply, nullGenerator, partition, range, reduce, reductions, remove, repeat, splitAt, splitWith, sum, take, takeUntil, takeWhile, toArray, _ref;

  _ref = require('./runtime'), identity = _ref.identity, increment = _ref.increment, decrement = _ref.decrement, isEven = _ref.isEven, isOdd = _ref.isOdd, sum = _ref.sum, multiply = _ref.multiply, complement = _ref.complement, nullGenerator = _ref.nullGenerator, generatorOf = _ref.generatorOf, callable = _ref.callable, repeat = _ref.repeat, cycle = _ref.cycle, iterate = _ref.iterate, interleave = _ref.interleave, range = _ref.range, filter = _ref.filter, map = _ref.map, reduce = _ref.reduce, reductions = _ref.reductions, concat = _ref.concat, partition = _ref.partition, takeWhile = _ref.takeWhile, dropWhile = _ref.dropWhile, toArray = _ref.toArray;

  apply = function(fn, sequence) {
    return fn.apply(this, toArray(sequence));
  };

  remove = function(predicate, sequence) {
    return filter(complement(predicate), sequence);
  };

  interpose = function(separator, sequence) {
    return drop(1, interleave(repeat(separator), sequence));
  };

  take = function(amount, sequence) {
    return takeWhile((function(v, i) {
      return i < amount;
    }), sequence);
  };

  takeUntil = function(predicate, sequence) {
    return takeWhile(complement(predicate), sequence);
  };

  drop = function(amount, sequence) {
    return dropWhile((function(v, i) {
      return i < amount;
    }), sequence);
  };

  dropUntil = function(predicate, sequence) {
    return dropWhile(complement(predicate), sequence);
  };

  splitAt = function(ordinal, sequence) {
    return [take(ordinal, sequence), drop(ordinal, sequence)];
  };

  splitWith = function(predicate, sequence) {
    return [takeWhile(predicate, sequence), dropWhile(predicate, sequence)];
  };

  exports.signatures = [
    {
      identity: identity,
      increment: increment,
      decrement: decrement,
      isEven: isEven,
      isOdd: isOdd,
      sum: sum,
      multiply: multiply,
      apply: apply
    }, {
      complement: complement
    }, {
      generatorOf: generatorOf,
      callable: callable,
      iterate: iterate,
      repeat: repeat,
      range: range,
      map: map,
      concat: concat,
      cycle: cycle
    }, {
      toArray: toArray,
      reduce: reduce,
      splitAt: splitAt,
      splitWith: splitWith
    }, {
      concat: concat,
      interleave: interleave
    }, {
      interpose: interpose,
      filter: filter,
      remove: remove,
      map: map,
      reductions: reductions,
      cycle: cycle,
      partition: partition,
      take: take,
      takeWhile: takeWhile,
      takeUntil: takeUntil,
      drop: drop,
      dropWhile: dropWhile,
      dropUntil: dropUntil
    }
  ];

  exports.functions = (function() {
    var fn, fns, group, name, signature, _ref1;
    fns = {};
    _ref1 = exports.signatures;
    for (signature in _ref1) {
      group = _ref1[signature];
      for (name in group) {
        fn = group[name];
        fns[name] = fn;
      }
    }
    return fns;
  })();

}).call(this);