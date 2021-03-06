    { expect } = require 'chai'

    {
      Sequence
      map
      sum
      multiply
      isEven
      isOdd
      increment
      rest
      repeat
      cycle
      iterate
      range
      apply
      reduce
      reductions
      interleave
      interpose
      take
      toArray
    } =
      require 'fl'



    describe "a few basics:", ->

      it "does `rest`", ->
        array = toArray rest [0,1,2,3]
        expect array.join ' '
          .to.equal '1 2 3'

      it "does `range`, `interleave`, `toArray`", ->
        array = toArray interleave [0,1,2], range(3,9), [9,10,11,12]
        expect array.join ' '
          .to.equal '0 3 9 1 4 10 2 5 11'

      it "does cast to `Sequence`, `cycle`, `take`", ->
        array = Sequence [1,2,3]
          .cycle()
          .take 10
          .toArray()
        expect array.join ' '
          .to.equal '1 2 3 1 2 3 1 2 3 1'

      it "does `reduce`", ->
        expect Sequence().reduce sum
          .to.equal 0
        expect Sequence().reduce multiply
          .to.equal 1
        expect Sequence([42]).reduce sum
          .to.equal 42
        expect Sequence([42,58]).reduce sum
          .to.equal 100

      it "does `concat`", ->
        array = Sequence [4]
          .concat Sequence.range(1,4).cycle()
          .take 20
          .toArray()
        expect array.join ' '
          .to.equal '4 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1 2 3 1'

      it "does `partition`", ->
        array = Sequence
          .range 40
          .partition 3, 10
          .map (s) -> toArray(s).join ' '
          .toArray()
        expect array.join ' '
          .to.equal '0 1 2 10 11 12 20 21 22 30 31 32'

        array = Sequence
          .range 10
          .partition 4, 2
          .map (s) -> toArray(s).join ' '
          .toArray()
        expect array.join ' '
          .to.equal '0 1 2 3 2 3 4 5 4 5 6 7 6 7 8 9'

        array = Sequence
          .range 10
          .partition 6, 3, [97,98,99]
          .map (s) -> toArray(s).join ' '
          .toArray()
        expect array.join ' '
          .to.equal '0 1 2 3 4 5 3 4 5 6 7 8 6 7 8 9 97 98'

      it "does `partitionBy`", ->
        array = Sequence
          .range 20
          .partitionBy (n) -> ( Math.sqrt n )|0
          .map (s) -> toArray(s).join ' '
          .toArray()
        expect array.join ' / '
          .to.equal '0 / 1 2 3 / 4 5 6 7 8 / 9 10 11 12 13 14 15 / 16 17 18 19'



    describe "examples from external sources", ->

      # http://aphyr.com/posts/304-clojure-from-the-ground-up-sequences
      it "chains [ iterate, filter, partition, map, take, reduce ]", ->
        result = Sequence
          .iterate increment, 0
          .filter isOdd
          .partition 2, 1
          .map Sequence
          .map (s) -> s.reduce multiply
          .take 1000
          .reduce sum
        expect result
          .to.equal 1335333000




    describe "a bit of performance:", ->

      it "skedaddles", ->
        square = (x) -> x * x
        n = 1000; m = 10000
        i = 0; t = Date.now(); while i++ < n
          Sequence
            .range m
            .map square
            .toArray()
        t = Date.now() - t

        console.log "
          (n = #{n}) * (m = #{m}) : range, map, toArray ->
          #{t} ms ->
          #{ n * m * 1000 / t} elem-op/s
        "
