# fl.js

Functional lazy operators and sequences.

* Uses standard [Iterator][] protocol
* Accepts ES6 generators as lazy sequences
* Designed to collaborate with modules such as **[pim.js][]**, which provides persistent immutable data structures

> TODO: Compare to mori.js, lazy.js, (underscore | lodash) with api adapter



## API



### General value operators


#### identity

```js
identity( value )
```

Returns `value`.


#### increment

```js
increment( value )
```

Returns `value + 1`.


#### decrement

```js
decrement( value )
```

Returns `value - 1`.


#### isEven

```js
isEven( value )
```

Returns `value % 2 === 0`.


#### isOdd

```js
isOdd( value )
```

Returns `value % 2 === 1 || value % 2 === -1`.


#### sum

```js
sum( ...addends )
```

Returns the sum of `0` and zero or more `addends`.


#### multiply

```js
multiply( ...factors )
```

Returns the product of `1` and zero or more `factors`.


#### toArray

```js
Sequence().toArray()
// >>> array

toArray( sequence )
// >>> array
```

Iterates through a sequence and returns its elements in an array.


#### complement

```js
complement( predicate )
```

Returns a function that returns the logical negation of the result of applying `predicate`.

```js
complement( isEven )(3);
true
```


#### compose

```js
compose( ...fns )
```

Returns the composition of a series of functions `fns`, such that `compose(f,g,h)(x)` is equivalent to `f(g(h(x)))`.


#### partial

```js
partial( fn, ...args )
```

Given a function `fn` and successive arguments `args` fewer in number than the expected number of parameters for `fn`, returns a function that will return the result of applying `fn` to the concatentation of `args` and its own arguments.

```js
addFive = partial( sum, 5 );
addFive(2);
7

rest = partial( dropWhile, function ( value, index ) {
  return index < 1;
});
// >>> function

toArray( rest( range(4) ) );
[ 1, 2, 3 ]

toArray( rest( function* () {
  yield 2; yield 4; yield 6; yield 8;
}));
[ 4, 6, 8 ]
```


#### apply

```js
apply( fn, sequence )
```

Returns the result of applying `fn` with each element in `sequence` as arguments.


#### compare

The default comparator function used with `sort`. Determines the ordinal relation between arguments `x` and `y`.

```js
compare( x, y )
// >>> number
```

Returns `0` if `x` and `y` are of equal precedence, returns `-1` if `x` precedes `y`, or returns `1` if `y` precedes `x`. If `x` and `y` are logical sequences, then the comparison is evaluated recursively over the respective elements of both sequences.


#### comparator

Creates a boolean valued comparison operator.

```js
comparator( predicate )
// >>> function
```

Returns a predicate that returns `true` if applying `predicate` to each adjacent pairing of its arguments also returns `true`, and returns `false` otherwise.

```js
nonconsecutive = comparator( compare );

apply( nonconsecutive, 'fireman' );  // >>> true
apply( nonconsecutive, 'balance' );  // >>> true
apply( nonconsecutive, 'ladders' );  // >>> false
```


#### increasing

```js
increasing( ...values )
// >>> boolean
```

Returns `true` if arguments are provided in a strictly increasing order (`<`) as determined by `compare`; otherwise returns `false`.

Logically equivalent to `comparator( (x,y) => compare(x,y) < 0 )`.

```js
apply( increasing, [0,1,4,9] );  // >>> true
apply( increasing, [1,1,2,3] );  // >>> false
apply( increasing, 'gist' );     // >>> true
apply( increasing, 'bees' );     // >>> false

apply( increasing, Sequence.range().take(5) );
// >>> true
```


#### decreasing

```js
decreasing( ...values )
// >>> boolean
```

Returns `true` if arguments are provided in a strictly decreasing order (`>`) as determined by `compare`; otherwise returns `false`.

```js
apply( decreasing, [9,4,1,0] );  // >>> true
apply( decreasing, [3,2,1,1] );  // >>> false
apply( decreasing, 'wronged' );  // >>> true
apply( decreasing, 'sniffed' );  // >>> false
```


#### nonincreasing

```js
nonincreasing( ...values )
// >>> boolean
```

Returns `true` if arguments are provided in a monotonically decreasing order (`>=`) as determined by `compare`; otherwise returns `false`.

```js
apply( nonincreasing, 'sniffed' );  // >>> true
```


#### nondecreasing

```js
nondecreasing( ...values )
// >>> boolean
```

Returns `true` if arguments are provided in a monotonically increasing order (`<=`) as determined by `compare`; otherwise returns `false`.

```js
apply( nondecreasing, 'bees' );  // >>> true
```



### Sequential functions


#### first

```js
Sequence().first()
// >>> *

first( sequence )
// >>> *
```

Returns the first element in `sequence`.

```js
first( range(4) );
0

first([]);
undefined
```

Logically equivalent to `take( 1, sequence )().next().value`.


#### rest

```js
Sequence().rest()
// >>> Sequence

rest( sequence )
// >>> function
```

Returns a logical sequence of the elements that follow the `first` element of `sequence`.

```js
toArray( rest([ 0, 1, 2, 3 ]) );
[ 1, 2, 3 ]

toArray( rest([ 1 ]) );
[]

toArray( rest( [] ) );
[]

Sequence.range( 3, Infinity ).rest().take(4).toArray();
[ 4, 5, 6, 7 ]
```

Logically equivalent to `drop( 1, sequence )`.


#### range

Defines a sequence of numbers from `start` up to but excluding `end` in increments of `step`.

```js
Sequence.range()
Sequence.range( end )
Sequence.range( start, end )
Sequence.range( start, end, step )
// >>> Sequence

range()
range( end )
range( start, end )
range( start, end, step )
// >>> function
```

Defaults for arguments not provided are: `start = 0`, `end = Infinity`, `step = 1`.

Returns a `Sequence` or sequence generator function.

```js
toArray( range(4) );
[ 0, 1, 2, 3 ]

toArray( take( 5, range() ) );
[ 0, 1, 2, 3, 4 ]

toArray( range(-5) );
[]

toArray( range(3,9,2) );
[ 3, 5, 7 ]
```


#### iterate

Given a nominally pure function `f` and *seed* value `x`, defines an infinite sequence of `x`, `f(x)`, `f(f(x))`, etc.

```js
Sequence.iterate( fn, seed )
// >>> Sequence

iterate( fn, seed )
// >>> function
```

Returns a `Sequence` or sequence generator function.

```js
toArray( take( 5, iterate( increment, 42 ) ) );
[ 42, 43, 44, 45, 46 ]
```


#### repeat

Given a value `x`, defines a repeating infinite sequence of `x`, or a finite sequence of `x` repeated up to `limit` times.

```js
Sequence.repeat( value )
Sequence.repeat( value, limit )
// >>> Sequence

repeat( value )
repeat( value, limit )
// >>> function
```

Returns a `Sequence` or sequence generator function.

```js
toArray( take( 5, repeat(42) ) );
[ 42, 42, 42, 42, 42 ]

Sequence.repeat( 'foo', 5 );
[ 'foo', 'foo', 'foo', 'foo', 'foo' ]
```


#### cycle

Defines an infinite sequence that repeats the items in `sequence` indefinitely.

```js
Sequence.cycle()
// >>> Sequence

cycle( sequence )
// >>> function
```

Returns a `Sequence` or sequence generator function.

```js
toArray( take( 10, cycle([3,4,5,6]) ) );
[ 3, 4, 5, 6, 3, 4, 5, 6, 3, 4 ]

Sequence([3,4,5,6]).take(10).toArray();
[ 3, 4, 5, 6, 3, 4, 5, 6, 3, 4 ]
```


#### filter

Applies a nominally pure `predicate` to each item in `sequence` and keeps those items for which `predicate` returns logical true.

```js
Sequence().filter( predicate )
// >>> Sequence

filter( predicate, sequence )
// >>> function
```

Returns a `Sequence`, or sequence generator function, consisting of each element `x` in `this` or `sequence` for which the expression `!!predicate(x)` would equal `true`.

```js
Sequence(["all", "your", "base", "are", "belong"]).filter( function (word) {
  return word.length < 4;
});
[ 'all', 'are' ]
```


#### remove

Performs a `filter` on the `complement` of the provided `predicate`.


#### map

Applies `fn` to successive items of one or more sequences.

```js
Sequence().map( fn, ...sequences )
// >>> Sequence

map( fn, sequence, ...sequences )
// >>> function
```

The arity of `fn` should correspond with the number of sequences to be mapped.

Returns a `Sequence`, or sequence generator function, consisting of the result of applying `fn` to successive items taken from `sequence` and any additional `sequences`, in parallel, until any of `sequence` or `sequences` is exhausted.

```js
toArray( map( increment, [1,2,3] ) );
[ 2, 3, 4 ]

Sequence([1,2,3]).map( increment ).toArray();
[ 2, 3, 4 ]

toArray( map( sum, [1,2,3], [10,20,30] ) );
[ 11, 22, 33 ]

Sequence([1,2,3]).map( sum, [10,20,30], [100,200,300] ).toArray();
[ 111, 222, 333 ]

Sequence([1,2,3]).map( sum, [10,20] ).toArray();
[ 11, 22 ]

Sequence( iterate increment, 1 ).map( sum, range(10,50,10) ).toArray();
[ 11, 22, 33, 44 ]
```


#### reduce

Iteratively calls `fn`, with two arguments:

  1. `seed` on the first iteration; thereafter, the result of the previous iteration

  2. each successive value in `sequence`.

If no `seed` is provided, the first value of the sequence is used as the `seed` and reduction proceeds on the remainder of the sequence.

```js
Sequence().reduce( fn, seed )
Sequence().reduce( fn )
// >>> *

reduce( fn, seed, sequence )
reduce( fn, sequence )
// >>> *
```

Returns the result of the final iteration of `fn`. If the length of `sequence` is zero, returns the result of calling `fn` with no arguments. If the length of `sequence` is `1`, the single element of `sequence` is returned.

```js
function factorial (n) {
  return Sequence.range(n).map( increment ).reduce( multiply );
}
```


#### reductions

Produces a sequence of the intermediate values in a `reduce` operation.

```js
Sequence().reductions( fn, seed )
Sequence().reductions( fn )
// >>> Sequence

reductions( fn, seed, sequence )
reductions( fn, sequence )
// >>> function
```

Returns a `Sequence`, or sequence generator function, of reductions.

```js
Sequence.range(1,10).reductions( multiply ).toArray();
[ 1, 2, 6, 24, 120, 720, 5040, 40320, 362880 ]

function factorialSequence (n) {
  return Sequence.range(n).map( increment ).reductions( multiply );
}
factorialSequence(10).toArray();
[ 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800 ]
```


#### take

Defines a sequence of up to `amount` items taken successively from `sequence`, or

```js
Sequence().take( amount )
// >>> Sequence

take( amount, sequence )
// >>> function
```

Returns a `Sequence` or sequence generator function.


#### takeWhile

Defines a sequence of items taken successively from `sequence` so long as the expression `!!predicate( item )` remains equal to `true`.

```js
Sequence().takeWhile( predicate )
// >>> Sequence

takeWhile( predicate, sequence )
// >>> function
```

Returns a `Sequence` or sequence generator function.

```js
Sequence
  .range()
  .takeWhile( function (x) {
    return Math.log(x) < 1;
  })
  .toArray();
[ 0, 1, 2 ]
```


#### drop

```js
Sequence().drop( amount )
// >>> Sequence

drop( amount, sequence )
// >>> function
```

Returns a sequence of the items in `sequence` that would be excluded from the subsequence returned by an equivalent `take` operation.


#### dropWhile

```js
Sequence().dropWhile( predicate )
// >>> Sequence

dropWhile( predicate, sequence )
// >>> function
```

Returns a sequence of the items in `sequence` that would be excluded from the subsequences returned by an equivalent `takeWhile` operation.


#### concat

Concatenates sequences.

```js
Sequence().concat( ...sequences )
// >>> Sequence

concat( sequence, ...sequences )
// >>> function
```

Returns a single `Sequence`, or a sequence generator function, that is the concatentation of each sequence in the order they are provided.

```js
Sequence.range(3).concat( range(5) ).toArray();
[ 0, 1, 2, 0, 1, 2, 3, 4 ]

Sequence('abc').concat('def', 'ghi').toArray();
[ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ]

toArray( concat() );
[]
```


#### splitAt

Divides a `sequence` into two sequences, where the first contains the first `n` elements of `sequence`, and the second contains the remaining elements of `sequence`.

```js
Sequence().splitAt( n )
// >>> array

splitAt( n, sequence )
// >>> array
```

Returns a two-element array containing both partitions of `sequence`.

```js
Sequence('qwerty')
  .splitAt(4)
  .map( Sequence )
  .map( function (s) {
    return s.toArray().join('');
  });
[ 'quer', 'ty' ]
```


#### splitWith

Divides a `sequence` into two sequences, where the first contains elements, starting from the head of `sequence`, that return logical true when `predicate` is applied to the element.

```js
Sequence().splitWith( predicate )
// >>> array

splitWith( predicate, sequence )
// >>> array
```

Returns a two-element array containing both partitions of `sequence`.

```js
function isConsonant (char) {
  return /[^aeiouy]/i.test(char);
}
Sequence('schtick')
  .splitWith( isConsonant )
  .map( Sequence )
  .map( function (s) {
    return s.toArray().join('');
  });
[ 'scht', 'ick' ]
```


#### partition

Partitions `sequence` into subsequences of `size` elements at offsets `stride` elements apart, where `stride` defaults to `size` such that partitions do not overlap. If the final partition is shorter than `size`, then: if a `padding` sequence is provided, that partition is filled with elements from `padding` until it grows to `size`; if no `padding` exists, the short partition is dropped.

```js
Sequence().partition( size, stride, padding )
Sequence().partition( size, stride )
Sequence().partition( size )
// >>> Sequence

partition( size, stride, padding, sequence )
partition( size, stride, sequence )
partition( size, sequence )
// >>> function
```

Returns a `Sequence` of partitions, or a sequence generator function that returns an iterator over the partitions, where each partition is itself a sequence generator function that returns an iterator over the elements of the partition.

```js
Sequence.range(12).partition(4).map( toArray ).toArray();
[ [ 0, 1, 2, 3 ], [ 4, 5, 6, 7 ], [ 8, 9, 10, 11 ] ]

Sequence.range(11).partition(4).map( toArray ).toArray();
[ [ 0, 1, 2, 3 ], [ 4, 5, 6, 7 ] ]

Sequence.range(16).partition(4,6).map( toArray ).toArray();
[ [ 0, 1, 2, 3 ], [ 6, 7, 8, 9 ], [ 12, 13, 14, 15 ] ]

Sequence.range(14).partition(4, 6, ['a']).map( toArray ).toArray();
[ [ 0, 1, 2, 3 ], [ 6, 7, 8, 9 ], [ 12, 13, 'a' ] ]

Sequence.range(14).partition(4, 6, 'abc').map( toArray ).toArray();
[ [ 0, 1, 2, 3 ], [ 6, 7, 8, 9 ], [ 12, 13, 'a', 'b' ] ]

Sequence.range(4).partition(10).map( toArray ).toArray();
[]

Sequence.range(4).partition(10,10,[]).map( toArray ).toArray();
[ [ 0, 1, 2, 3 ] ]
```


#### partitionBy

Applies `fn` to each value in `sequence`, partitioning it into subsequences each time `fn` returns a new value.

```js
Sequence().partitionBy( fn )
// >>> Sequence

partitionBy( fn, sequence )
// >>> function
```

Returns a `Sequence` of partitions, or a sequence generator function that returns an iterator over the partitions, where each partition is itself a sequence generator function that returns an iterator over the elements of the partition.

```js
Sequence
  .range(1,6)
  .partitionBy( function (x) { return x === 3 } )
  .map( toArray )
  .toArray();

[ [ 1, 2 ], [ 3 ], [ 4, 5 ] ]


Sequence( [1,1,1,2,2,3,3] ).partitionBy( isOdd ).map( toArray ).toArray();
[ [ 1, 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]

Sequence( [1,1,1,2,2,3,3] ).partitionBy( isEven ).map( toArray ).toArray();
[ [ 1, 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]


Sequence("Leeeeeerrrrooyyy")
  .partitionBy( identity )
  .map( toArray )
  .toArray();

[ [ 'L' ],
  [ 'e', 'e', 'e', 'e', 'e', 'e' ],
  [ 'r', 'r', 'r', 'r' ],
  [ 'o', 'o' ],
  [ 'y', 'y', 'y' ] ]
```


#### interleave

```js
Sequence().interleave( ...sequences )
// >>> Sequence

interleave( ...sequences )
// >>> function
```

Given one or more `sequences`, defines a sequence consisting of the first item from each of the `sequences`, continuing with the second item from each of the `sequences`, etc., stopping after any one of the `sequences` has been exhausted.

```js
Sequence.interleave( range(), [7,8,9] ).toArray();
[ 0, 7, 1, 8, 2, 9 ]  // no `3`
```


#### interpose

Places a `value` between each element in a `sequence`.

```js
Sequence().interpose( value )
// >>> Sequence

interpose( value, sequence )
// >>> function
```

Returns a new logical sequence containing the `value` interposed within the elements of the original sequence.

```js
Sequence("dmtr").interpose('e').toArray();
[ 'd', 'e', 'm', 'e', 't', 'e', 'r' ]
```


#### sort

Sorts the contents of a finite, homogeneous logical sequence, as directed by a pure function `comparator` if provided, or by `compare` otherwise. Elements of the sequence which are themselves sequences are compared by recursively comparing the respective elements of both nested sequences.

```js
Sequence().sort( comparator )
Sequence().sort()
// >>> Sequence

sort( comparator, sequence )
sort( sequence )
// >>> function
```

Returns a new logical sequence containing the sorted elements of the original sequence.

```js
Sequence([ 'abduct', 'abacus', 'abated', 'abate' ])
  .map( Sequence )
  .sort( compare )
  .map( toArray )
  .map( function (a) { return a.join(''); } )
  .toArray();
[ 'abacus', 'abate', 'abated', 'abduct' ]
```




* * *

### &#x1f44b;




[Iterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/The_Iterator_protocol
[pim.js]: http://npmjs.org/package/pim
