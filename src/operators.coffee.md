## operators

    {
      identity
      increment
      decrement
      isEven
      isOdd
      sum
      multiply
      complement
      nullGenerator
      generatorOf
      callable
      rest
      repeat
      cycle
      iterate
      interleave
      range
      filter
      map
      reduce
      reductions
      concat
      partition
      takeWhile
      dropWhile
      toArray
    } =
      require './runtime'




    apply = ( fn, sequence ) ->
      fn.apply this, toArray sequence


    remove = ( predicate, sequence ) ->
      filter ( complement predicate ), sequence


    interpose = ( separator, sequence ) ->
      drop 1, interleave ( repeat separator ), sequence


    take = ( amount, sequence ) ->
      takeWhile ( ( v, i ) -> i < amount ), sequence


    takeUntil = ( predicate, sequence ) ->
      takeWhile ( complement predicate ), sequence


    drop = ( amount, sequence ) ->
      dropWhile ( ( v, i ) -> i < amount ), sequence


    dropUntil = ( predicate, sequence ) ->
      dropWhile ( complement predicate ), sequence


    splitAt = ( ordinal, sequence ) ->
      [ take ordinal, sequence
        drop ordinal, sequence ]


    splitWith = ( predicate, sequence ) ->
      [ takeWhile predicate, sequence
        dropWhile predicate, sequence ]



    exports.signatures = [

value -> value

      {
        identity
        increment
        decrement
        isEven
        isOdd
        sum
        multiply
        apply
      }

function -> function

      {
        complement
      }

value -> sequence

      {
        generatorOf
        callable
        iterate
        repeat
        range
        map
        concat
        cycle
      }

sequence -> value

      {
        toArray
        reduce
        splitAt
        splitWith
      }

sequence, ... -> sequence

      {
        concat
        interleave
      }

..., sequence -> sequence

      {
        rest
        interpose
        filter
        remove
        map
        reductions
        cycle
        partition
        take
        takeWhile
        takeUntil
        drop
        dropWhile
        dropUntil
      }

    ]

    exports.functions = do ->
      fns = {}; for signature, group of exports.signatures
        fns[name] = fn for name, fn of group
      fns
