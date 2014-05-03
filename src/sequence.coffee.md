    operators = require './operators'



    module.exports =




## [Sequence]()

    class Sequence

      { slice } = Array::
      { generatorOf } = operators.functions

      [
        VALUE_TO_VALUE
        FUNCTION_TO_FUNCTION
        VALUE_TO_SEQUENCE
        SEQUENCE_TO_VALUE
        SEQUENCE_AND_REST_TO_SEQUENCE
        REST_AND_SEQUENCE_TO_SEQUENCE
      ] =
        operators.signatures




### Constructor

      constructor: ( iterable ) ->
        return new Sequence iterable unless this instanceof Sequence
        @__hash__ = null
        @generator = generatorOf iterable



### Static functions

      for name, fn of VALUE_TO_VALUE
        @[name] = fn

      for name, fn of VALUE_TO_SEQUENCE
        @[name] = do ( fn ) -> -> new Sequence fn.apply null, arguments



### Methods

      __iterator__: ->
        @generator.apply this, arguments

      call: ( context ) ->
        @generator.call context, slice.call arguments, 1

      apply: ( context, args ) ->
        @generator.apply context, args

      for name, fn of SEQUENCE_TO_VALUE
        @::[name] = do ( fn ) -> -> fn arguments..., this

      for name, fn of SEQUENCE_AND_REST_TO_SEQUENCE
        @::[name] = do ( fn ) -> -> new Sequence fn this, arguments...

      for name, fn of REST_AND_SEQUENCE_TO_SEQUENCE
        @::[name] = do ( fn ) -> -> new Sequence fn arguments..., this
