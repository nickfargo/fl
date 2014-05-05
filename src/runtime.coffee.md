## runtime

> *Ye olde imperatif guhk*

Low-level functions and iterators, implemented imperatively for performance.
This module is imported by the `operators` module, which in turn exports these
functions together with a set of derived operations expressed functionally.

    { slice } = Array::




### Utility functions

    throwIteratorFinished = -> throw new Error "Iterator has already finished"

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



### Iterating functions


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

> TODO: memoize values from first iteration of sequence

    cycle = ( sequence ) -> -> new CycleIterator sequence

    class CycleIterator
      constructor: ( @sequence ) ->
        @source = ( callable sequence ).call()
        @out = new IteratorOutput

      next: ->
        assertUnfinished out = @out
        { value, done } = @source.next()
        if done
          @source = ( callable @sequence ).call()
          { value, done } = @source.next()
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


#### interleave

    interleave = ( sequence, rest ) ->
      if not sequence?
        empty
      else if not rest?
        callable sequence
      else
        sequences = slice.call arguments
        i = 0; while i < sequences.length
          sequences[i] = callable( sequences[i] ).call()
          i++
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
      new FilterIterator predicate, ( callable sequence ).call()

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
      else if not rest?
        -> new MapIterator fn, ( callable sequence ).call()
      else
        sequences = slice.call arguments, 1
        i = 0; while i < sequences.length
          sequences[i] = ( callable sequences[i] ).call()
        -> new MapIterator_variadic fn, sequences

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
      -> new ReductionIterator fn, seed, ( callable sequence ).call()

    class ReductionIterator
      constructor: ( @fn, @seed, @source ) ->
        @out = new IteratorOutput
        if seed?
          out.value = seed
        else
          first = source.next()
          out.value = first.value
          out.done = first.done

      next: ->
        { fn, source, out } = this
        assertUnfinished out
        previous = out.value
        { value, done } = @source.next()
        if out.done = done
          out.value = undefined
        else
          out.value = fn previous, value
        out


#### concat

    concat = ->
      return empty unless arguments.length
      sequences = slice.call arguments
      -> new ConcatIterator sequences

    class ConcatIterator
      constructor: ( @sequences ) ->
        @source = ( callable sequences[0] ).call()
        @index = 0
        @out = new IteratorOutput

      next: ->
        assertUnfinished out = @out
        { value, done } = @source.next()
        if done
          if sequence = @sequences[ ++@index ]
            out.value = value
            out.done = no
            @source = ( callable sequence ).call()
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
      else -> new PartitionIterator size, stride, padding,
                ( callable sequence ).call()

    class PartitionIterator
      constructor: ( @size, stride, @padding, @source ) ->
        @gap = stride - size
        @part = null
        @out = new IteratorOutput

      pad = ( part, padding, amount ) ->
        if padding? and source = ( callable padding ).call()
          i = 0; while i < amount
            { value, done } = source.next()
            break if done
            part.push value
            i++
        part

      send = ( out, value, done ) ->
        out.value = value
        out.done = done
        out

      sendPart = ( out, part ) ->
        send out, ( new ArrayIterator part if part? ), no

      next: ->
        { size, source, gap, out } = this
        assertUnfinished out
        return send out, undefined, yes unless @source?

        i = 0; part = gap < 0 and @part or []; while part.length < size
          { value, done } = source.next()
          if done
            @source = null
            return send out, undefined, yes if i is 0
            pad part, @padding, size - part.length if part.length > 0
            return sendPart out, part
          i = part.push value

        if gap < 0
          @part = part.slice gap
        else if gap > 0
          i = 0; while i++ < gap
            if source.next().done then @source = null; break

        sendPart out, part


#### takeWhile

    takeWhile = ( predicate, sequence ) -> ->
      new TakeIterator predicate, ( callable sequence ).call()

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
      new DropIterator predicate, ( callable sequence ).call()

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
      iterator = ( callable sequence ).call()
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
      TakeIterator
      DropIterator
    }
