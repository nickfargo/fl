    { expect } = require 'chai'

    {
      Sequence
      map
      sum
      increment
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
