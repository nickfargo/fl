## operators

    {
      generatorOf
      iteratorOf
      sum
      multiply
      toArray
      empty
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
      partitionBy
      takeWhile
      dropWhile
    } =
      require './runtime'


    { slice } = Array::




    identity  = (x) -> x
    increment = (x) -> x + 1
    decrement = (x) -> x - 1
    isEven    = (x) -> x % 2 is 0
    isOdd     = (x) -> y = x % 2; y is 1 or y is -1
    compare   = (x,y) -> if x < y then -1 else if x > y then 1 else 0


    complement = ( predicate ) -> -> not predicate.apply this, arguments


    compose = ->
      fns = slice.call arguments
      ( value ) -> value = fn value for fn in fns; value


    partial = ( fn ) ->
      applied = slice.call arguments, 1
      -> fn.apply this, applied.concat slice.call arguments


    apply = ( fn, sequence ) -> fn.apply this, toArray sequence


    first = ( sequence ) -> ( iteratorOf sequence ).next().value


    rest = partial dropWhile, ( v, i ) -> i < 1


    remove = ( predicate, sequence ) ->
      filter ( complement predicate ), sequence


    interpose = ( separator, sequence ) ->
      rest interleave ( repeat separator ), sequence


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
        compose
        partial
      }

value -> sequence

      {
        generatorOf
        iterate
        repeat
        range
        map
        concat
        cycle
        interleave
      }

sequence -> value

      {
        first
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

arg, sequence, ... -> sequence

      {
        map
      }

..., sequence -> sequence

      {
        rest
        interpose
        filter
        remove
        reductions
        cycle
        partition
        partitionBy
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
