/* Chapter 2: Values
Notes and example code from ch2 of the Types & Grammar book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch2.md

--------------------------------------------------------------------------------

ARRAYS

- Arrays are just containers for any type of value.
- You can store a mixture of different types in one array.
- There's no need to presize arrays.
- The length property will dynamically adjust.
*/
var a =[ ];

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
- Arrays can can key/ property pairs since they are objects.
- These do not add to the length of the array.
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

// Strings are immutable, arrays are mutable:
a[1] = 'l';
b[1] = 'l';

a;  // 'foo'
b;  // ['f', 'l', 'o']

/*
- A consequence of strings' immutability is that string methods must creat and return new strings.
- In contrast array methods can modify the actual arrays.
*/
var a = 'foo';
var c = a.toUpperCase();    // `a` unchanged
a === c;    // false
a   // 'foo'
c;  //'FOO'

var b = ['f','o','o'];
b.push( '!' );
b;  // ['f','o','o','!']

// Many array methods are not available for strings, but we can `borrow` the ones that ar nonmutating.
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
- If doing a lot of 'borrowing', consider just using arrays of characters, and converting into strings when needed.

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
0o363;  // octl for 243
0O363;  // ditto - but very confusing to have adjacent 0 and O - Avoid.

0b11110011;     // binary for: 243
0B11110011;     // ditto
