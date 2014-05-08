## runtime

> *Ye olde imperatif guhk*

Low-level functions and iterators, implemented imperatively for performance.
This module is imported by the `operators` module, which in turn exports these
functions together with a set of derived operations expressed functionally.

##### Conventions

An **iterator** is any object that conforms to the [ES6 Iterator protocol][0].

A **sequence**, and likewise values dereferenced from a `sequence` identifier,
may be either a proper `Sequence` instance, or a function that creates and
returns an iterator, such as a generator function.

Most of this module’s **sequencing functions** are paired with a corresponding
**iterator class** (e.g. `range` and `RangeIterator`) that defines a `next`
method.

In most `next` method definitions there is a `source` identifier, which refers
to an iterator.

[0]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol


    { slice } = Array::




### Utility functions

    throwIteratorFinished = -> throw new Error "Iterator has already finished"
    throwNotSequential = -> throw new Error "Object is not sequential"

    assertUnfinished = ( iteratorOutput ) ->
      do throwIteratorFinished if iteratorOutput.done

    generatorOf = ( iterable ) ->
      return empty unless iterable?
      if typeof iterable is 'function'
        -> iterable()
      else if typeof iterable.__iterator__ is 'function'
        -> iterable.__iterator__()
      else if typeof iterable.next is 'function'
        -> iterable
      else if typeof iterable.length is 'number'
        -> new ArrayIterator iterable
      else empty

    iteratorOf = ( sequence ) ->
      iterator = ( callable sequence )?.call?()
      do throwNotSequential unless typeof iterator?.next is 'function'
      iterator

    callable = ( object ) ->
      if typeof object.call is 'function'
      then object
      else generatorOf object

    identity  = (x) -> x
    increment = (x) -> x + 1
    decrement = (x) -> x - 1
    isEven    = (x) -> x % 2 is 0
    isOdd     = (x) -> y = x % 2; y is 1 or y is -1

    sum = ->
      x = 0; i = 0; while i < arguments.length
        x += arguments[i++]
      x

    multiply = ->
      x = 1; i = 0; while i < arguments.length
        x *= arguments[i++]
      x

    compare = ( a, b ) -> if a < b then -1 else if a > b then 1 else 0

    complement = ( predicate ) -> -> not predicate.apply this, arguments

    __send_to_output__ = ( out, value, done ) ->
      out.value = value
      out.done = done
      out

    __send_part_to_output__ = ( out, array ) ->
      a = array.slice()
      __send_to_output__ out, ( -> new ArrayIterator a ), no



### IteratorOutput

    class IteratorOutput
      constructor: ( @value ) -> @done = no



### General iterator classes


#### ArrayIterator

    class ArrayIterator
      constructor: ( @array ) ->
        @index = 0
        @out = new IteratorOutput

      next: ->
        { array, index, out } = this
        assertUnfinished out
        if index < array.length
          out.value = array[ index ]
        else
          out.value = undefined
          out.done = yes
        @index += 1
        out


#### PairwiseArrayIterator

    class PairwiseArrayIterator
      constructor: ( @array ) ->
        throw new Error "Odd number of elements" if array.length % 2
        @index = 0
        @out = new IteratorOutput []

      next: ->
        { array, index, out } = this
        assertUnfinished out
        if index < array.length
          out.value[0] = array[ index ]
          out.value[1] = array[ index + 1 ]
        else
          out.value[0] = undefined
          out.value[1] = undefined
          out.done = yes
        @index += 2
        out



### Sequencing functions

Return sequences as functions that return specifically typed iterators.


#### empty

    empty = -> new EmptyIterator

    class EmptyIterator
      constructor: -> @out = new IteratorOutput

      next: ->
        { out } = this
        assertUnfinished out
        out.done = yes
        out


#### repeat

    repeat = ( value ) -> -> new RepeatIterator value

    class RepeatIterator
      constructor: ( value ) -> @out = new IteratorOutput value
      next: -> @out


#### cycle

    cycle = ( sequence ) -> -> new CycleIterator sequence

    class CycleIterator
      constructor: ( @sequence ) ->
        @source = iteratorOf sequence
        @out = new IteratorOutput

      next: ->
        assertUnfinished out = @out
        { value, done } = @source.next()
        if done
          { value, done } = ( @source = iteratorOf @sequence ).next()
        out.value = value
        out.done = done
        out


#### iterate

    iterate = ( fn, seed ) -> -> new IterateIterator fn, seed

    class IterateIterator
      constructor: ( @fn, seed ) ->
        @iterated = no
        @out = new IteratorOutput seed

      next: ->
        { out } = this
        if @iterated
          out.value = @fn out.value
        else
          @iterated = yes
        out.done = no
        out


#### interleave

    interleave = ( sequence, rest ) ->
      if not sequence?
        empty
      else if not rest?
        callable sequence
      else
        sequences = toArray map iteratorOf, arguments
        -> new InterleaveIterator sequences

    class InterleaveIterator
      constructor: ( @sources ) ->
        @column = []
        @index = 0
        @out = new IteratorOutput

      next: ->
        { sources, column, index, out } = this
        assertUnfinished out
        { length } = sources
        unless index
          column.length = 0
          i = 0; while i < length
            sourceIteration = sources[ i++ ].next()
            if out.done = sourceIteration.done
              out.value = undefined
              return out
            else
              column.push sourceIteration.value
        out.value = column[ index ]
        @index = ( index + 1 ) % length
        out


#### range

    range = ( start, end, step ) -> switch arguments.length
      when 0 then -> new RangeIterator 0, Infinity, 1
      when 1 then -> new RangeIterator 0, start, 1
      when 2 then -> new RangeIterator start, end, 1
      else        -> new RangeIterator start, end, step

    class RangeIterator
      constructor: ( start, @end, @step ) ->
        @value = start
        @out = new IteratorOutput

      next: ->
        { value, out } = this
        assertUnfinished out
        if out.done = @end <= value
          out.value = undefined
        else
          out.value = value
          @value = value + @step
        out


#### filter

    filter = ( predicate, sequence ) -> ->
      new FilterIterator predicate, iteratorOf sequence

    class FilterIterator
      constructor: ( @predicate, @source ) ->
        @out = new IteratorOutput

      next: ->
        { predicate, source, out } = this
        assertUnfinished out
        loop
          { value, done } = source.next()
          if out.done = done
            out.value = undefined
          else if predicate value
            out.value = value
          else continue
          return out


#### map

    map = ( fn, sequence, rest ) ->
      if not sequence? then empty
      else if not rest? then __map_one__ fn, sequence
      else __map_variadic__ fn, slice.call arguments, 1

    __map_one__ = ( fn, sequence ) -> ->
      new MapIterator fn, iteratorOf sequence

    __map_variadic__ = ( fn, sequences ) -> ->
      new MapIterator_variadic fn, toArray __map_one__ iteratorOf, sequences

    class MapIterator_variadic
      constructor: ( @fn, @sources ) ->
        @values = []
        @out = new IteratorOutput

      next: ->
        { sources, values, out } = this
        assertUnfinished out
        for source in sources
          { value, done } = source.next()
          if out.done = done
            out.value = undefined
            return out
          else
            values.push value
        out.value = @fn.apply null, values
        out.done = no
        values.length = 0
        out

    class MapIterator
      constructor: ( @fn, @source ) ->
        @out = new IteratorOutput

      @variadic = MapIterator_variadic

      next: ->
        assertUnfinished out = @out
        { value, done } = @source.next()
        if out.done = done
          out.value = undefined
        else
          out.value = @fn value
        out


#### reduce

    reduce = ( fn, seed, sequence ) ->
      source = reductions( fn, seed, sequence ).call()
      loop
        iteration = source.next()
        return value if iteration.done
        { value } = iteration


#### reductions

    reductions = ( fn, seed, sequence ) ->
      unless sequence?
        sequence = seed
        seed = undefined
      -> new ReductionIterator fn, seed, iteratorOf sequence

    class ReductionIterator
      constructor: ( @fn, seed, @source ) ->
        if seed?
          value = seed
        else
          { value, done } = source.next()
          if done
            value = fn()
            @fn = null # signals `next` that `source` is 0 length
        @pre = value
        @out = new IteratorOutput

      next: ->
        { fn, out, source, pre } = this
        assertUnfinished out

        unless source?
          return __send_to_output__ out, undefined, yes

        unless fn?
          @source = null
          return __send_to_output__ out, pre, no

        { value, done } = source.next()
        __send_to_output__ out, pre, no
        if done
          @source = null
        else
          @pre = fn pre, value
        out


#### concat

    concat = ->
      return empty unless arguments.length
      sequences = slice.call arguments
      -> new ConcatIterator sequences

    class ConcatIterator
      constructor: ( @sequences ) ->
        @source = iteratorOf sequences[0]
        @index = 0
        @out = new IteratorOutput

      next: ->
        assertUnfinished out = @out
        { value, done } = @source.next()
        if done
          if sequence = @sequences[ ++@index ]
            out.value = value
            out.done = no
            @source = iteratorOf sequence
            return @next()
          else
            value = undefined
            done = yes
        out.value = value
        out.done = done
        out


#### partition

    partition = ( size, stride, padding, sequence ) -> switch arguments.length
      when 0, 1 then throw new TypeError
      when 2 then partition size, size, null, stride
      when 3 then partition size, stride, null, padding
      else -> new PartitionIterator size, stride, padding, iteratorOf sequence

    class PartitionIterator
      constructor: ( @size, stride, @padding, @source ) ->
        @gap = stride - size
        @part = null
        @out = new IteratorOutput

      pad = ( part, padding, amount ) ->
        if padding? and source = iteratorOf padding
          i = 0; while i < amount
            { value, done } = source.next()
            break if done
            part.push value
            i++
        part

      next: ->
        { size, padding, source, gap, out } = this
        assertUnfinished out
        return __send_to_output__ out, undefined, yes unless @source?

        i = 0; part = gap < 0 and @part or []; while part.length < size
          { value, done } = source.next()
          if done
            @source = null
            unless i and padding?
              return __send_to_output__ out, undefined, yes
            if part.length
              pad part, padding, size - part.length
            return __send_part_to_output__ out, part
          i = part.push value

        if gap < 0
          @part = part.slice gap
        else if gap > 0
          i = 0; while i++ < gap
            if source.next().done then @source = null; break

        __send_part_to_output__ out, part


#### partitionBy

    partitionBy = ( fn, sequence ) -> ->
      new PartitionByIterator fn, iteratorOf sequence

    class PartitionByIterator
      constructor: ( @fn, @source ) ->
        { value, done } = source.next()
        return new EmptyIterator if done
        @backvalue = value
        @label = fn value
        @part = []
        @out = new IteratorOutput

      next: ->
        { fn, source, part, out } = this
        assertUnfinished out
        return __send_to_output__ out, undefined, yes unless source?

        loop
          { value, done } = source.next()
          if done
            @source = null
            part.push @backvalue
            __send_part_to_output__ out, part, no
            break

          part.push @backvalue
          @backvalue = value

          if @label isnt label = fn value
            @label = label
            __send_part_to_output__ out, part, no
            break

        part.length = 0
        out


#### takeWhile

    takeWhile = ( predicate, sequence ) -> ->
      new TakeIterator predicate, iteratorOf sequence

    class TakeIterator
      constructor: ( @predicate, @source ) ->
        @count = 0
        @out = new IteratorOutput

      next: ->
        assertUnfinished out = @out
        { value, done } = @source.next()
        if not done and @predicate value, @count++
          out.value = value
          out.done = no
        else
          out.value = undefined
          out.done = yes
        out


#### dropWhile

    dropWhile = ( predicate, sequence ) -> ->
      new DropIterator predicate, iteratorOf sequence

    class DropIterator
      constructor: ( @predicate, @source ) ->
        count = 0; while not done and predicate value, count++
          { value, done } = source.next()
        @count = count
        @out = new IteratorOutput value
        @out.done = done

      next: ->
        assertUnfinished out = @out
        { value, done } = @source.next()
        if out.done = done
          out.value = undefined
        else
          out.value = value
        out


#### toArray

    toArray = ( sequence, limit = Infinity ) ->
      throw new TypeError unless sequence?
      iterator = iteratorOf sequence
      out = []
      i = 0; while i++ < limit
        { value, done } = iterator.next()
        break if done
        out.push value
      out





    module.exports = {
      identity
      increment
      decrement
      isEven
      isOdd
      sum
      multiply
      complement
      empty
      generatorOf
      iteratorOf
      callable
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
      toArray

      IteratorOutput
      ArrayIterator
      PairwiseArrayIterator
      EmptyIterator
      RepeatIterator
      InterleaveIterator
      RangeIterator
      FilterIterator
      MapIterator
      ReductionIterator
      ConcatIterator
      PartitionIterator
      PartitionByIterator
      TakeIterator
      DropIterator
    }
