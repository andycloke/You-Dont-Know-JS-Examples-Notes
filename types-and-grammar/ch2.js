/* Chapter 2: Values
Notes and example code from ch2 of the Types & Grammar book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch2.md

--------------------------------------------------------------------------------

ARRAYS

- Arrays are just containers for any type of value.
- You can store a mixture of different types in the same array.
- There's no need to presize arrays.
- The length property will dynamically adjust.
*/
var a = [ ];

a.length;       // 0

a[0] = 1;
a[1] = '2';
a[2] = [ 3 ];

a.length;       // 3

// Be careful with sparse arrays:
var a = [ ];

a[0] = 1;
// a[1] is not set
a[2] = [ 3 ];

a[1];           // undefined
a.length;       // 3

/*
- Arrays can can have key/ property pairs since arrays are objects.
- However keys/ property pairs do not add to the length of the array.
*/
var a = [ ];

a[0] = 1;
a['foobar'] = 2;

a.length;       // 1
a['foobar'];    // 2

a.length;       // 1
a['foobar'];    // 2
a.foobar;       // 2

/*
- Avoid using string values that can be coerced into numbers, since they will be coerced into numerical indexes:
- More generally, avoid using string keys at all with arrays. Use objects instead.
*/
var a = [ ];

a['13'] = 42;

a.length;       // 14

/* Array-Likes

- Sometimes you need to convert an array-like value to an array.
- This is done using slice, whose default values will create a copy of an array/ array-like value:
*/
function foo(){
    var arr = Array.prototype.slice.call( arguments );
    arr.push( 'bam' );
    console.log( arr );
}

foo( 'bar', 'baz');     // ['bar','baz','bam']

// ES6 introduces `Array.from(..)`:
var  arr = Array.from( arguments );

/* STRINGS

- It's a common belief that strings are arrays of characters. They do have some similarites, but this is not entirely accurate.
- They do both have `.length`, `.indexOf(..)` and `.concat(..)`:
*/
var a = 'foo';
var b = ['f','o','o'];

a.length;       // 3
b.length;       // 3

a.indexOf( 'o' );   // 1
b.indexOf( 'o' );   // 1

var c = a.concat( 'bar' );          // 'foobar'
var d = b.concat( ['b','a','r']);   //  ['f','o','o','b','a','r']

a === c;    // false
b === d;    // false

a;  // 'foo'
b;  // ['f','o','o']

// One big difference is that strings are immutable, arrays are mutable:
a[1] = 'l';
b[1] = 'l';

a;  // 'foo'
b;  // ['f', 'l', 'o']

// A consequence of strings' immutability is that string methods must creat and return new strings.
// In contrast array methods can modify the actual arrays.

var a = 'foo';
var c = a.toUpperCase();    // `a` unchanged
a === c;    // false
a   // 'foo'
c;  //'FOO'

var b = ['f','o','o'];
b.push( '!' );
b;  // ['f','o','o','!']

// Many array methods are not available for strings, but we can `borrow` the ones that are non-mutating.
a.join;     // undefined
a.map;     // undefined

var c = Array.prototype.join.call( a, '-');
var d = Array.prototype.map.call( a, (v) => v.toUpperCase() + '.').join('');

a;      // 'f-o-o'
d;      // 'F.O.O.'

// Reversing a string:
a.reverse;      // undefined

b.reverse();    // ['!','o','o','f']
b;              // ['!','o','o','f']

// We cannot borrow reverse since it is mutating, but we can hack it by turning a into a array, then back into a string:
var c = a.split( '' ).reverse().join( '' );
c;  // 'oof'
/*
- This doesn't work for strings with complex (unicode) characters
- If doing a lot of 'borrowing' (i.e. having to call array methods on strings), consider just using
arrays of characters, and converting into strings when needed.

NUMBERS

- The number type is used for both "integer" and fractional decimal values.
- However the integers are not true integers, since they are just values with a fractional decimal, e.g. both '42' and '42.0'.
- Specfically, JS stores numbers using the "double precision" (64-big binary) format of the "floating-point" standard.

- Both the leading and trailing portion of a decimal value are optional.
*/
var a = 42;
var b = 42.3;

var c = 0.42;
var d = .42;

var e = 42.0;
var f = 42.;    // uncommon

// Most numbers will be output as base-10 decimals with trailing fractional 0s removed:
var a = 42.300;

a;      // 42.3

// Very large /small numbers will be output in exponential format (the same as if you called `.toExponential()`):
var a = 5E10;       // N.B. - specified in exponent form - useful for large numbers
a;                  // 50000000000
a.toExponential();  //'5e+10'

var b = a * a;
b;                  // 2.5e+21

var c = 1 / a;
c;                  // 2e-11

/*
- number values can be boxed with the `Number` object wrapper (see chapter 3)
- They can therefore access methods that are built into `Number.prototype`
- e.g. `toFixed(..)` method allows you to specify how many fractional decimal places to use.
- If you ask for more than are available, it 0-pads the RHS.
- N.B. the return value is a string.
*/
var a = 42.59;

a.toFixed( 0 );     // "43"
a.toFixed( 1 );     // '42.6'
a.toFixed( 2 );     // '42.59'
a.toFixed( 3 );     // '42.590'
a.toFixed( 4 );     // '42.5900'

// toPrecision(..) is similar, but uses significant digits instead:
var a = 42.59;

a.toPrecision( 1 );     // '4e+1'
a.toPrecision( 2 );     // '43'
a.toPrecision( 3 );     // '42.6'
a.toPrecision( 4 );     // '42.59'
a.toPrecision( 5 );     // '42.590'
a.toPrecision( 6 );     // '42.5900'

// If using directly on the number, be careful as the `.` will be interpreted as part of the number:
42.toFixed( 3 );        // SyntaxError

// Okay:
(42).toFixed( 3 );      // '42.000'
0.42.toFixed( 3 );      // '0.420'
42..toFixed( 3 );       // '42.000'     // uncommon
42 .toFixed( 3 );       // '42.000'     // valid but confusing - avoid

// Can specify numbers in hexadecimal:
0xf3;       // hexadecimal for 243
0Xf3;       // ditto

// And octal (not allowed in ES6 + Strict mode)
0363;   // octal for 243

// New in ES6:
0o363;  // octal for 243
0O363;  // ditto - but very confusing to have adjacent 0 and O - Avoid.

0b11110011;     // binary for: 243
0B11110011;     // ditto

/* SMALL DECIMAL VALUES
- The representations of small decimal values in binary floating point are not exact.
Famously:
*/
0.1 + 0.2 === 0.3;      // false
/*
- 0.1 + 0.2 actually equals 0.30000000000000004.
- If we need to do a comparison such as the one above, we use a small "tolerance" value,
known as machine epsilon, often 2^-52.
    - As of ES6, thic can be accessed as Number.EPSILON.
*/
function numbersCloseToEqual(n1,n2){
    return Math.abs( n1 - n2 ) < Number.EPSILON;
}
numbersCloseToEqual( (0.1 + 0.2), 0.3);     // true
/*
- The maximum possible number is about 1.798e+308, represented as `Number.MAX_VALUE`
- Similarly the minimum is about 5e-324, stored as `Number.MIN_VALUE`;

Safe Integer Ranges
- The max numbers that can be "safely" represented - i.e. stored unambiguously is about 2^53 - 1
represented as `Number.MAX_SAFE_INTEGER` in ES6.
- Similarly there is `Number.MIN_SAFE_INTEGER`

- Use (ES6) `Number.isInteger` and `Number.isSafeInteger` to that a number is an integer and a safe
integer respectively.

SPECIAL VALUES

The Nonvalue Values
- For both `undefined` & `null`, the label is both its type and its value.
- `null` cannot be used as an identifier. Unfortunately `undefined` can:

Undefined
- In non-strict mode, undefined can be reassigned to other values:
*/
function foo(){
    undefined = 2;      // really bad idea;
}
foo();

function foo(){
    'use strict';
    undefined = 2;      // TypeError!
}
foo();
// In both strict/ non-strict mode, you can create a local variable with the name undefined:
function foo(){
    'use strict';
    var undefined = 2;
    console.log( undefined );   // 2
}
foo();

/* `void`

- The expression `void x` "voids" out `x`, so that the result of the expression is always the `undefined` value.
*/
var a = 42;
console.log( void a );       // undefined
console.log( a );            // 42

/* SPECIAL NUMBERS

The not number, number
- `NaN` is the result when you perform a mathematical operation without both operands being numbers.
- `NaN` stands for "not a number", but this is very confusing. It should be thought of as a failed number.
- The `typeof NaN` is, confusingly, 'number'.
*/
var a = 2 / 'foo';      // Nan
typeof a === 'number';  // true
/*
- NaN is the only value which is never equal to itself.
- using the built-in `isNaN(..)` to test for NaN is flawed, since anything that is not a number
will return as true, when we actually just wnt things that are equal to NaN.
*/
var a = 2 / 'foo';
var b = 'foo';

isNaN( a );     // true
isNaN( b );     // true  - bug! - should be false

/*
- ES6 provides Number.isNaN(..), which has the expected behaviour.

Infinities
*/
var a = 1 / 0;      // Infinity (Number.POSITIVE_INFINITY)
var b = -1 / 0;     // -Infinity (Number.NEGATIVE_INFINITY)

// Infinity also results when you calculate a number outside the range of values handled by JS:

var a = Number.MAX_VALUE;   // 1.798e+308
a + a;                      // Infinity
a + Math.pow( 2, 970 );     // Infinity
a + Math.pow( 2, 969 );     // 1.798e+308
/*
- In a crude sense, JS rounds to nearest specified value, so Number.MAX_VALUE + Math.pow( 2, 969 ) is closer to
Number.MAX_VALUE, whilst Number.MAX_VALUE + Math.pow( 2, 970 ) is closer to Infinity.

Zeroes
- Javascript has a negative zero, which can be the result of multiplication/ division, but not addition/ subtraction.
- This is useful in order to store directional data.*/
var a = 0 / -3;     // -0
var b = 0 * -3;     // -0
/*
- If you stringify a negative 0, it will always be reported as '0'.
- The reverse, going from a string representation of a negative 0 to a number, doesn't lose the negative.*/
a = 0 / -3;             // -0
a.toString();           // '0'
a + '';                 // '0'
JSON.stringify( a );    // '0'

// Reverse:
+'-0';                  // -0
Number( '-0' );         // -0
JSON.parse( '-0' );     // -0

// -0 is equal to 0
var a = 0;
var b = 0 / -3;
a == b;             // true
-0 == 0;            // true
a === b;            // true
-0 === 0;           // true
a > b;              // false
0 > -0;             // false

// to determine if negative 0:
function isNegZero(n){
    n = Number( n );
    return (n === 0) && (1/n === -Infinity);
}
isNegZero( -0 );    // true
isNegZero( 0 );     // false

/* SPECIAL EQUALITY
- ES6 provides `Object.is(..)` which tests for equality of two special values, without the weird
exceptions described above.
*/
var a = 2 / 'foo';
Object.is( a, NaN );    // true

var b = -3 * 0;
Object.is( b, -0 );     // false

/* VALUE VERSUS REFERENCE
- A reference in JS points at a shared value, so if you have 10 different references, they are always distinct
references to the a single shared value.
- There are no syntactic hints tht control value/ reference (e.g `&` and `*` in C).
- Instead the type of the value alone determines whetehr the value is assigned by value-copy or reference-copy.
    - Simple values (scalar primitives) are always passed/ assigned by value-copy:
        null, undefined, string, number, boolean, symbol (ES6)

    - Compount values create a copy of the reference:
        - objects (including arrays and all boxed object wrappers) and functions.
*/
var a = 2;
var b = a;      // since `a` is a number, `b` is always a copy of the value in `a`
b++;
a;      // 2
b;      // 3

var c = [1,2,3];
var d = c;          // `d` is a reference to the shared `[1,2,3]` value, since the value is an array (object)
d.push( 4 );
c;      // [1,2,3,4]
d;      // [1,2,3,4]
/*
- To effectively pass an array by value-copy, rather than reference, you can use `slice()` with its default parameters to make a
shallow copy of it.
*/
foo( a.slice() );   // copy of array a

// To do the reverse - pass a scalar primitive by "reference", use a wrapper object:
function foo(wrapper){
    wrapper.a = 42;
}
var obj = {
    a: 2
};

foo ( obj );
obj.a;          // 42

/* You cannot do this by using a `Number` object wrapper, since the underlying scalar primitive value is immutable and a copy will be created;
*/
function foo(x){
    x = x + 1;
    x;          // 3
}

var a = 2;
var b = new Number( a );    // or equivalently 'Object(a)'

foo ( b );
console.log( b );       // 2, not 3
