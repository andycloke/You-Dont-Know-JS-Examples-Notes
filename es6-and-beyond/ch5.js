/* Chapter 5: Collections
Notes and example code from ch5 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch5.md

--------------------------------------------------------------------------------

TypedArrays
- Not what you might imagine - an array of values of one type only (e.g. an array of strings).
- More like a buffer/bucket of bits which can be used with array-like semantics.
- The 'type' in the name refers to how they should be viewed - as an array of 8-bit/ 16-bit
signed intergers etc.
*/
var buf = new ArrayBuffer( 32 );
buf.byteLength;                     // 32
// `buf` is now a binary buffer of 0s that is 32 bytes long.

// We can now layer a 'view', which comes in the form of a typed array:
var arr = new Uint16Array( buf );
arr.length;                         // 16
/*
- `arr` is a typed array of 16-bt unsigned integers mapped over the 256-bit buffer, meaning you get
16 elements.

Endianness
- When you have a multi-byte number, e.g. a 16 bit (2 byte) integer. One byte will represent the lower
numbers and one will represent the higher ones.
- Endianness refers to whether this low-order byte if on the left or the right of the numbers bytes.
- Usually it'll be on the left, but now for all browsers, so you'll need to check.

Maps

- Objects are primarily used for creating key/ value pairs - maps.
- However the drawback of objects is that we must use strings as the key.
Consider:
*/
var m = {};

var x = { id: 1 }, y = { id: 2 };

m[x] = 'foo', m[y] = 'bar';

m[x];       // 'bar'
m[y];       // 'bar'
/*
- Both objects stringify to '[object Object]', so only one key is being set in m. The second
assignment overwrites the first.
- We can use parallel arrays for keys and values, but this makes the complexity of access O(n)
rather than O(1).
- As of ES6 we now have `Map(..)`.
- NB you can no longer use the [] access syntax.
*/
var m = new Map();

var x = { id: 1 },
    y = { id: 2 };

m.set( x, 'foo' );
m.set( y, 'bar' );

m.get( x );             // 'foo'
m.get( y );             // 'bar'

// To delete an element, don't use the `delete` operator, but instead use the `delete(..)` method:
m.delete( y );

// use the `size` property to get the length of a map an `clear()` method to delete an entire map's contents:
m.set( x, 'foo' );
m.set( y, 'bar' );
m.size;                 // 2

m.clear();
m.size;                 // 0

//- The map can also recieve an iterable, which must produce a list of arrays. The first item
// in each array should be the key and the second the value:
var x = { id: 1 },
    y = { id: 2 };

var m = new Map( [
    [ x, 'foo' ],
    [ y, 'bar' ]
] );

m.get( x );         // 'foo'
m.get( y );         // 'bar'

// This format is identical to that produced by the `entries()` method:
var m2 = new Map( m.entries() );

// Because a map instance is an iterable, and its default iterator is the same as `entries()`, this
// is the same as doing:
var m2 = new Map( m );
/*
- The above form is preferable, since it is shorter.

Map Values
- `values(..)` returns an iterator and can be used to get the list of values from a map:
*/
var m = new Map();

var x = { id: 1 },
    y = { id: 2 };

m.set( x, 'foo' );
m.set( y, 'bar' );

var vals = [ ...m.values() ];

vals;                           // ['foo','bar']
Array.from( m.values() );       // ['foo','bar']

// you can iterator over  map's entries using `entries()`:

var vals = [ ...m.entries() ];

vals[0][0] === x;       // true
vals[0][1];             // 'foo'

vals[1][0] === y;       // true
vals[1][1] === y;       // 'bar'

// Map Keys
// Similarly, use `keys()` to get an iterator over the keys in a map:

var keys = [ ...m.keys() ];

keys[0] === x;          // true
keys[1] === x;          // true

// use `has(..)` to determine if a map has a given key:
var m = new Map();

var x = { id: 1 },
    y = { id: 2 };

m.set( x, 'foo' );

m.has( x );             // true
m.has( y );             // false
/*
- Maps let you associate some extra piece of information (the value) with an object (ths key)
without actually putting that information on the object itself.

Sets

- A set is a collection of unique values - duplicates are ignored.
- Similar to the API for maps, but `add` replaces `set` and there is not `get`.
*/
var s = new Set();

var x = { id: 1 },
    y = { id: 2 };

s.add( x );
s.add( y );
s.add( x );

s.size;                 // 2

s.delete( y );
s.size;                 // 1

s.clear();
s.size;                 // 0

// `Set(..)` contrcutor can receive an iterable, such as another set or an array of values,
// in the same was the `Map(..)` constructor can:

var x = { id: 1 },
    y = { id: 2 };

var s = new Set( [x,y] );

// You test whether a value is present in a set using `has(..)`:
var s = new Set();

var x = { id: 1 },
    y = { id: 2 };

s.add( x );

s.has( x );             // true
s.has( y );             // false

// Inherenet uniqueness of a set is its most useful trait:
var s = new Set( [1,2,3,4,'1',2,4,'5'] ),
    uniques = [ ...s ];

uniques;                        // [1,2,3,4,'1','5']    // NB no coercion allowed
