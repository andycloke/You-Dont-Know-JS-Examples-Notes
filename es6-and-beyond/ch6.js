/* Chapter 6: API Additions
Notes and example code from ch6 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch6.md

--------------------------------------------------------------------------------

Array
*/
var a = new Array( 4 );
a.length;                   // 4
a[0];                       // undefined
// This creates an array of empty slots 4 elements long, even though we expect it
// to create `[4]`.

//In ES6, `Array.of(..)` replaces `Array(..)`, and does not have this quirk:
var b = Array.of( 4 );
a.length;                   // 1
a[0];                       // 4

// You might use this when creating a subclass of `Array`:
class MyCoolArray extends Array {
    sum() {
        return this.reduce( function reducer(acc,curr){
            return acc + curr;
        }, 0 );
    }
}

var x = MyCoolArray( 3 );
x.length;                       // 3 - oops!
x.sum();                        // 0 - oops!

var y = [3];                    // Array, not MyCoolArray
y.length;                       // 1
y.sum();                        // `sum` is not a function

var z = MyCoolArray.of( 3 );
z.length;                       // 1
z.sum();                        // 3

// Array-like objects in JS are objects with a `length` property on them:
var arrLike = {
    length: 3,
    0: 'foo',
    1: 'bar'
}
// Often have to be converted into an array to call array methods on them (e.g. `indexOf(..)`):
var arr = Array.prototype.slice.call( arrLike );

// or to duplicate:
var arr2 = arr.slice();

// ES6 `Array.from(..)` makes this much easier:
var arr = Array.from( arrLike );
var arrCopy = Array.from( arr );

// If you pass `Array.from(..)` an iterable, it use the iterator to produce values to copy into an array.

// If you pass it an array-like object, it simply loops over the value, accessing numerically named properties
// from 0 up to whatever the value of length is:
var arrLike = {
    length: 4,
    2: 'foo'
};

Array.from( arrLike );
// [ undefined, undefined, 'foo', undefined ]

// `Array.from(..)` accepts a callback as the second argument:
Array.from( arrLike, function mapper(val,idx){
    if (typeof val == 'string' ) {
        return val.toUpperCase();
    }
    else {
        return idx;
    }
} );
// [ 0, 1, 'FOO', 3 ]

// `Array#copyWithin(..)` copies a portion of an array to another location within that array:
// Arguments: target - index to copy to, start - index to start the copying from (inclusive),
// end (optional) - exclusive end to stop copying
[1,2,3,4,5].copyWithin( 3, 0 );         // [1,2,3,1,2]
[1,2,3,4,5].copyWithin( 3, 0, 1 );      // [1,2,3,1,5]
[1,2,3,4,5].copyWithin( 0, -2 );        // [4,5,3,4,5]
[1,2,3,4,5].copyWithin( 0, -2, -1 );    // [4,2,3,4,5]

// `Array#fill(..)` allows you to fill an array with a specified value.
var a = Array( 4 ).fill( undefined );
a;
// [undefined,undefined,undefined,undefined]

// It takes optional start and end parameters.
var b = [ null, null, null, null ].fil( 42, 1, 3 );
a;
// [null,42,42,null]

// `.find(..)`
// `find` allows you to test for a value in array, and returns that value.
// We can also test for == rather than just === (which `indexOf` is limited to):
var a = [1,2,3,4,5];

a.find( function matched(v){
    return v == '2';
} );                            // 2

a.find( function matcher(v){
    return v == 7;              // undefined
} );

// `findIndex` allows us to access the index of the matching value.
// Again, the improvement over `indexOf` is that we can do == rather than just ===.
// We can even test for matching objects:

var points = [
    { x: 10, y: 20 },
    { x: 20, y: 30 },
    { x: 30, y: 40 },
    { x: 40, y: 50 },
    { x: 50, y: 60 },
];

points.findIndex( function matched(point) {
    return (
        point.x % 3 == 0 &&
        point.y % 4 == 0
    );
} );                        // 2

// Object

// `Object.is(..)` is === but without the wierd NaN !== NaN and -0 === 0 exceptions

// `Object.getOwnPropertySymbols(..)` returns symbols properties directly on an object:
var o = {
    foo: 42,
    [ Symbol( 'bar' ) ]: 'hello world',
    baz: true
};

Object.getOwnPropertySymbols( o );      // [ Symbol(bar) ]

// `Object.setPrototypeOf(..)` sets the [[Prototype]] of an object:

var o1 = {
    foo() { console.log( 'foo' ); }
};

Object.setPrototypeOf( o2, o1 );

// delegates to `o1.foo()`:
o2.foo();                               // foo
/*
- `Object.assign(..)` copies a source object(s) to a target object.
- The enumerable and own (not iherited) properties are copied into the target object.
- 'read only' properties on source objects will be converted into normal, writable properties.

Math
- Lots of `math.x` methods added where x is, e.g., `log10(..)`.

Number

Static Properties:
`Number.EPSILON`, `Number.MAX_SAFE_INTEGER` & `Number.MIN_SAFE_INTEGER` added (see
ch2 of Types & Grammar book).

`Number.isNaN(..)`
*/
var a = NaN, b = 'NaN', c =  42;

isNaN( a );             // true
isNaN( b );             // true - oops - bug in pre-ES6 `isNaN`
isNaN( c );             // false

Number.isNaN( a );      // true
Number.isNaN( b );      // false -- fixed
Number.isNaN( c );      // false

// `Number.isFinite(..)` - omits the coercion of the pre-ES6 `isFinite(..)`:
var a = NaN, b = Infinity, c = 42, d = '42';

Number.isFinite( a );               // false
Number.isFinite( b );               // false

Number.isFinite( c );               // true

isFinite( d );                      // true - coerced '42' to 42
Number.isFinite( d );               // false
/*
- `Math.isInteger(..)` is slightly more efficient than doing `x === Math.floor( x )` and avoids
the issues you get with `NaN` and `Infinity`.
- ES6 also defines `Number.isSafeInterger`, which checks to make sure a value is both an integer and
within the range of `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER` (inclusive).

String
- In some langages like Python and Ruby you can do this: */
'foo' * 3;              // 'foofoofoo'

// Doesn't work in JS, as * is only defined for Numbers, so 'foo' is coerced to NaN
// ES6 defines `repeat` in order to achieve this:
'foo'.repeat( 3 );      // 'foofoofoo'

// 3 new string inspection functions:
var palindrome = 'step on no pets';

palindrome.startsWith( 'step on' );     // true
palindrome.startsWith( 'on', 5 );       // true

palindrome.endsWith( 'no pets' );       // true
palindrome.endsWith( 'no', 10 );        // true

palindrome.includes( 'on' );            // true
palindrome.includes( 'on', 6 );         // false
