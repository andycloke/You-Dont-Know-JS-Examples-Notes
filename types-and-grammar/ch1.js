/* Chapter 1: Types
Notes and example code from ch1 of the Types & Grammar book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch1.md

--------------------------------------------------------------------------------

- A type is  built-in set of characteristics that uniquely identifies the behaviour of a particular value.
    - e.g. if both the engine and the developer treat 42 and '42' differently, they have different types.

BUILT-IN TYPES

- null
- undefined
- boolean
- number
- string
- object
- symbol (new in ES6)

- All of these except object are considered `primitives`.

- We can use the `typeof` operator to determine  variable's type, but watch out fot the `null` bug:
*/
typeof undefined === 'undefined';   // true
typeof true === 'boolean';          // true
typeof 42 === 'number';             // true
typeof '42'=== 'string';            // true
typeof { life: 42 } === 'object';   // true
typeof Symbol() === 'symbol';       // true
// bug:
typeof null = 'object';             // true

// To test for null using its type you need to use the fact it is falsy:
const a = null;
(!a && typeof a === 'object');      // true

// `typeof` can also test for functions, even though functions are actually a subtype of object
typeof function a(){ /* .. */ } === 'function';     // true
/*
- Functions being objects is useful, since they can hve properties.
- e.g. `.length` gives the number of formal parameters of a functions
*/
function a(b,c){
    // ...
}
a.length;   // 2
// Arrays are a "subtype" of object, but unlike functions have type "object":
typeof [1,2,3] === 'object';        // true

/* VALUES AS TYPES

- In JS variables don't have types, values have types.
- A variable can hold a value of one type, then hold a value of a different type in the next assignment.
- `typeof` returns the type of the value stored in a variable, not the type of a variable, since variables don't have types.
*/
var a = 42;
typeof a;           // number

var a = '42';
typeof a;           // string

typeof typeof a;    // string

var b;
typeof b;           // undefined

b = 42;
var c;
b = c;
typeof b;           // undefined
typeof c;           // undefined

// undefined is different to undeclared. A declared value with no value is undefined:
var a;

a;      // undefined
b;      // ReferenceError: b is not defined     // b is actually undeclared, but browsers give this misleading error message.

// `typeof` reinforces this buggy behaviours by returning 'undefined' for undeclared variables:
var a;

typeof a;       // undefined
typeof b;       // undefined
/*
- This can be considered a "safety guard" in the behaviour of `typeof`.
-  e.g. imagine having  a `DEBUG` flag, which you use to decide whether or not to print error messages to the console.
- This flag will only be set in development. Once the site is live it will be undeclared.
*/
if (DEBUG){                                     // Error , since `DEBUG` is undeclared
    console.log( 'Debugging is starting ');
}
// No error:
if (typeof DEBUG !== 'undefined'){
    console.log( 'Debugging is starting');
}

// Can also use to check for a built-in API, to avoid overwriting it:
if(typeof atob === 'undefined'){
    atob = function(){ /*..*/ };
}

// alternatively, and if the JS is only running in the browser, use the global window object, which will avoid ReferenceErrors:
if (window.DEBUG){
    // ..
}

if (!window.DEBUG){
    // ..
}
