## operators

    {
      generatorOf
      iteratorOf
      sum
      multiply
      compare
      comparisonOperator
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

    increasing     = comparisonOperator ( x, y ) -> 0 > compare x, y
    decreasing     = comparisonOperator ( x, y ) -> 0 < compare x, y
    notIncreasing  = comparisonOperator ( x, y ) -> 0 <= compare x, y
    notDecreasing  = comparisonOperator ( x, y ) -> 0 >= compare x, y


    complement = ( predicate ) -> -> not predicate.apply this, arguments


    compose = ->
      fns = slice.call arguments
      ( value ) -> i = fns.length; value = fns[i] value while i--; value


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


    sort = ( fn, sequence ) ->
      if not sequence? then sequence = fn; fn = compare
      generatorOf ( toArray sequence ).sort fn


    take = ( amount, sequence ) ->
      takeWhile ( ( v, i ) -> i < amount ), sequence


    drop = ( amount, sequence ) ->
      dropWhile ( ( v, i ) -> i < amount ), sequence


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
        compare
        comparisonOperator
        increasing
        decreasing
        notIncreasing
        notDecreasing
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
        sort
        filter
        remove
        reductions
        cycle
        partition
        partitionBy
        take
        takeWhile
        drop
        dropWhile
      }

    ]

    exports.functions = do ->
      fns = {}; for signature, group of exports.signatures
        fns[name] = fn for name, fn of group
      fns
