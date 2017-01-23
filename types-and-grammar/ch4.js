/* Chapter 4: Coercion
Notes and example code from ch4 of the Types & Grammar book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch4.md

--------------------------------------------------------------------------------

CONVERTING VALUES

- Converting a value is often called "type casting" when done explicitly and "coercion" when done implicitly.
- We will refer to them as explicit coercion, when the coercion is obvious, and implicit coercion, when it is more subtle.
- Coercion will always result in a scalar primitive value.
*/
var a = 42;

var b = a + "";         // implicity coercion

var c = String( a );    // explicit coercion

/*
- The terms explicit and implicit are relative and will depend on the person reading the code's experience and exposure to the different
functions/ syntax etc.
- We're talking in terms of the average, reasonably informed and relatively experienced developer.

ABSTRACT VALUE OPERATIONS

ToString
- When any non-string value is converted to a string representation using `.toString()`, it is handled b te ToString operation.
- Generally quite predictable
    - null -> 'null'
    - undefined -> 'undefined'
    - true -> 'true'
    - 42 -> '42'

- Very small/ large numbers go to their exponential form.
    - 1.07 * 1000000000000000000000 -> '1.07e21'  (exponential form)

- Arrays are concatenated:
    - [1,2,3] -> "1,2,3"

JSON Stringification
- very similar to `.toString()`, except that it will always result in a string.
- Non JSON-safe values are `undefined`, functions, symbols (ES6). These will be omitted if an object property
or replaced with null if part of an array.
- Objects with circular references, where object references create a never-ending cycle though each other,
are also considered non-safe JSON values. Will throw an error if called with JSON.stringify();
*/
JSON.stringify( 42 );           // '42'
JSON.stringify( '42' );         // ''42''
JSON.stringify( null );         // 'null'
JSON.stringify( true );         // 'true'
JSON.stringify( undefined );    // undefined
JSON.stringify( function(){} ); // undefined

JSON.stringify(
    [1,undefined,function(){},4]
);                              // "[1,null,null,4]"
JSON.stringify(
    { a:2, b:function(){} }
);                              // "{"a":2}"
/*
- JSON.stringify will automatically call a toJSON method if the object has one, so this can be used to ensure
JSON.stringify is only called with a JSON-safe object.
*/
var o = { };

var a = {
    b: 42,
    c: o,
    d: function(){}
};

// create a circular reference inside `a`
o.e = a;

// would throw an error on the circular reference
// JSON.stringify( a );

// define a custom JSON value serialization (which will be called be JSON.stringify)
a.toJSON = function(){
    // only include the `b` property
    return { b: this.b };
};

JSON.stringify( a );        //"{"b";42}"
/*
- It's a common misconception that toJSON needs to stringify the value/ object, but stringify does this so
there is no need to do it twice.
- JSON.stringify(..) can be passed an optional second value, an array or function, known as a replacer.
-If it is an array, it should contain strings of allowed property names to be included in the serialization:
*/
var a = {
    b: 42,
    c: '42',
    d: [1,2,3]
};
JSON.stringify( a, ['b','c'] );     // "{"b":42,"c":"42"}"

/* If the replacer is a function, it will be called on the object itself, as well as every property in the object.
Each time it is passed two arguments, a key and value. To skip a key in the serialization, return undefined, else return
the value provided.
- Below, first the object `a` is passed. `k` will be undefined, so the function returns undefined.
- Then each object property is passed as k, which filters out the property named `c`.
- It it recursive, so each value in the array will also be passed into the function.
*/
JSON.stringify( a, function(k,v)
    if (k !== "c") return v;
} );                                // "{"b":"42","d":[1,2,3]}"

/* A third argument, space, can be passed into JSON.stringify.
- If space is a positive integer, that many spaces will be indented in front of each object property.
- If space is a string, that string will be used to indent each property.

ToNumber
- If any number is used in a way that requries it to be a number, `.toNumber()` is called.
    - true -> 1
    - false -> 0
    - undefined -> NaN
    - null -> 0 Wierd!
    - '42' -> 42
    - 'abc' -> NaN
    - '0020' (octal value) -> 20
- Objects/ array: `ToPrimitive` is called, which will look for a `valueOf` method. If one is found
and it returns a primitive value, that value is then coerced into a number using the rules above.
*/
var a = {
    valueOf: function(){
        return '42';
    }
};

var b = {
    toString: function(){
        return '42';
    }
};

var c = [4,2];

c.toString = function(){
    return this.join('');       // '42'
};

Number( a );            // 42
Number( b );            // 42
Number( c );            // 42
Number( '' );           // 0
Number( [] );           // 0
Number( [ 'abc' ] );    // NaN

/* ToBoolean
- JS has the actual keywords `true` and `false`.
- You can coerce the number `1` to the boolean `true` and `0` to `false`, but that does not make
`1` the same as `true` and `0` the same as `false`. They are different.

Falsy Values
- All JS values can ber coerced into two categories:
    - Values tht will become `false` if coerced to boolean (known as falsy values).
        - undefined
        - null
        - false
        - +0, -0, NaN
        - ""
    - Values that will become `true` if coerced to boolean.
        - everything else

Falsy Objects
- A falsy obejct is a value that looks and acts like a normal object, but evaluates to false when coered into a boolean.
    - They are not objects wrapped around false values, e.g. `var a = new Boolean( false )`, which are actually true.
- `document.all`, provided by the DOM, is the most well-known case.
    - Used to be used to detect old versions of IE. `if (document.all) { // It's IE }`
    - Can't get rid of as lots of legacy code still has it, so easier to make it equivalent evaluate to false.

Truthy Values
- Anything not on the list of falsy values is truthy, including the following strings.
*/
var a = 'false';        // true
var b = '0';            // true
var c = "''";           // true
// All these are truthy as well:
var a = [];             // true
var b = {};             // true
var c = function(){};   // true

/* EXPLICIT COERCION

Explicitly: Strings <--> Numbers
- Use the `String(..)` and `Number(..)` functions.
- By omitting the `new` keyword we avoid creating object wrappers, and instead explicitly coerce between the two types.
    - i.e. it is a function call which returns the value in the String/ Number type, not an object wrapper.
*/
var a = 42;
var b = String( a );        // uses ToString rules discussed earlier
b;          // '42'

var c = "3.14";
var d = Number( c );        // uses ToNumber rules discussed earlier
d;          // 3.14

// Other options:
var a = 42;
var b = a.toString();   // actually boxes the primitive value 42 as an object, then converts it

var c = '3.14';
var d = +c;             // "unary operator" form (operator with onlu one operand) - explicit once you know it!

/* Date to number
- Another common use of the unary operator (seen above) is to coerce a Date object into a number, which will be the
Unix timestamp.
*/
var d = new Date( 'Mon, 18 Aug 2014 08:53:06 CDT');

+d;        // 1408369986000

// often seen as:
var timestamp = +new Date();

// when a constructor call has no arguments, you can omit the ():
var timestamp = +new Date;

// Avoiding coercion is better as it's more explicit:
var timestamp = new Date().getTime();

// Or even better (ES5):
var timestamp = Date.now();

/* The curious case of the ~
- the ~ operator represents bitwise NOT.
- Bitwise operations are defined only for 32-bit operations, which means they force their operands to conform to 32-bit
value representations.
- They will therfoer coerce values into a 32-bit value represenation using `ToInt32`.
    - Initially `ToInt32` does a ToNumber coercion.
    - Then coerces into 32-bit value represenation.
    - Then flips each bit (e.g. 0 -> 1)
- Similar to how `!` coerces into boolean, then flips.
- ~ is equivalent to -(x+1).
    - The only value that returns a falsy 0 is -1, ~ of everything else returns a truthy value.
    - Useful for `indexOf(..)`, which returns -1 if the string is not found.
*/
var a = 'Hello World';

~a.indexOf( 'lo' );     // -4   // truthy
~a.indexOf( 'ol' );     // 0   // falsy
!~a.indexOf( 'ol' );    // 0   // true

// better than:
var a = 'Hello World';

if (a.indexOf( 'lo' ) >= 0){
    // found it!
}
// or:
if (a.indexOf( 'lo' ) != -1){
    // found it!
}
/* Truncating Bits
- ~~ often used in place of `Math.floor(..)`, to get an integer value.
- However it doesn't work the same on negative numbers and can't be used on non 32-bit values.

Explicitly: Parsing Numeric Strings
- Can achieve similar results by parsing a number out of a string's character contents, bu there are differences:
*/
var a = '42';
Number( a );        // 42
parseInt( a );      // 42

var b = '42px';
Number( b );        // NaN // Coercion is not tolerant of non-numeric characters. It fails when it hits one.
parseInt( b );      // 42  // parsing is tolerant of non-numeric characters. It just stops parsing when it hits one.

/*
- `parseInt(..)` only operates on string values. It would make no sense to use it on any other type of value.
- If you do pass another type of value, the value will be coerced into a string, which might have unexpected results.
- `parseInt(..)` pre-ES5 required a second character to specify the base to determine the int in, otherwise the first
letter of the string determined it (x/X -> hexadecimal. 0 -> octal).
    - Now the default is base-10, but the optional second parameter can be used to specify another base.

Explicitly: * --> Boolean.

- Where * is any non-boolean value.
- `Boolean(..)` is a way of  forcing the ToBoolean coercion:
*/
Boolean( '0' );     // true
Boolean( [] );      // true
Boolean( {} );      // true

Boolean( '' );      // false
Boolean( 0 );       // false
Boolean( null );    // false
var g;
Boolean( g );       // false

/*
- Using the `!` operator will coerce a number into the boolean type. However it will also flip the parity.
- We can use `!!` to coerce and flip the parity twice, i.e. preserve the parity.
*/
var a = '0';
!!a;            // true

var d = '';
!!d;            // false

/* IMPLICIT COERCION

- Implicit coercion makes code harder to understand.
- Most complaints about coercion in JS are about implicit coercion.
- Doesn't to be all bad:
    - Let's define the goal of implicit coercion as reducing verbosity, boilerplate and/or
    unecessary implemenatation detail - noise.

Simplifying Implicitly
*/
