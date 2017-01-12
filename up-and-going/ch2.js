/*

Exercises from chapter 2 of YDKJS - Up & Going
https://github.com/getify/You-Dont-Know-JS/blob/master/up%20%26%20going/ch2.md

*/

/* TYPES
- There are 7 built in types available as of ES6, when the symbol type was added:
string, number, boolean, null, undefined, object, symbol/
- The return value of typeof is a string indicating the  type of the input value.
*/

var a;
typeof a;   // 'undefined'

a = 'hello world';
typeof a;    // 'string'

a = true;
typeof a;    // 'boolean'

a = null;
typeof a;   // 'object - this is a bug'

a = undefined;
typeof a;   // 'undefined'

a = {b: 'c'};
typeof a;   // 'object'

a = Symbol();
typeof a;   // 'symbol'

/* OBJECTS
- Objects are essentially compound values - you set named locations within the object that each hold a value.
- Properties are accessed through dot / bracket notation. Dot notation is preferred for aethestic/ readability
reasons.
- Bracket notation is useful when you want to use special characters or the prop name is stored as another variable.
*/

var obj = {
    a: 'hello world',
    b: 42,
    c: true
}

obj.a;       // 'hello world'
obj.b;       // 42
obj['c'];    // true

b = 'a';
obj[b];      // 'hello world'

/* ARRAYS
- Arrays are a subtype of objects that hold values in numerically indexed positioned
- These values can be of any type, and one array can hold a mixture of types
- Arrays have properites that are automatically created and updated, such as length
*/

var arr = ['hello world', 42, true];

arr[0];      // 'hello world'
arr[1];      // 42
arr.length;  // 3
typeof ar;   // object

/* FUNCTIONS
- Functions are a subtype of objects (like arrays)
- typeof called on a function returns function - this means functions are a main type and can have properties,
but these are rarely used
*/

function foo(){
    return 42;
}

foo.bar = 'hello world';

typeof foo;       // 'function'
typeof foo();     // 'number'
typeof foo.bar;   // 'string'

/* BUILT-IN TYPE METHODS
- The built-n types and subtypes have properties and methods that are handled under the hood
*/

var a = 'hello world';
var b = 3.1415;

a.length;           // 11
a.toUpperCase();    // 'HELLO WORLD'
b.toFixed(2);       // 3.14

/* COMPARING VALUES
- We either test for equality or inequality.
- The result of a comparison is always a boolean value (true or false).


Coercion
- When the type of a value is converted

 Explicit coercion: clear from the code that a conversion from one type to another will take place*/
var a = '42';
var b = Number(a);

a;     // '42'
b;     // 42 (the number)

// Implicit coercion: conversion happens as a side-effect of some other operation
var a = '42';
var b = a * 1;;     // '42' implicitly coerced to 42

a;     // '42'
b;     // 42 (the number)

/* Truthy & Falsy
- When a non-boolean value is coerced into a boolean, e.g. when tested in an if
statement, it either becomes truthy or falsy

falsy values:
false
''
0, -0, NaN
null, undefined


truthy values:
true
'hello'
42
[ ], [ 1, '2', 3]
{ }, { a: 42 }
function foo() { ... }

Equality:
== checks values equality, allowing coercion
=== checks values equality, without allowing coercion - 'strict equaity'

Rules:
- If either value (aka side) in a comparison could be the true or false value, avoid == and use ===.
- f either value in a comparison could be of these specific values (0, "", or [] -- empty array),
avoid == and use ===.
- In all other cases, you're safe to use ==. Not only is it safe, but in many cases it simplifies your code
in a way that improves readability.

*/

var a = '42';
var b = 42;

a == b;    // true
a === b;   // false

// testing equality of two non-primitive types compares the references, so two identical arrays are not equal

var a = [ 1, 2, 3];
var b = [ 1, 2, 3];
a == b;               // false

/* INEQUALITY
- strings are compared using alphabetical rules if values are strings
- if one/ both are not a string, both values are coerced into numbers
*/

var a = 41;
var b = '42';
var c = '43';

b < c;    // true
a < b;    // true

var a = 42;
var b = 'foo';

// Here b is coerced into a number, and becomes NaN. NaN is neither geater than, equal to or less than 42.

a < b;  // false
a > b;  // false
a = b;  // false

/* VARIABLES
- Stick to a-z, A-Z, $ and _ symbols to start a variable name.
- You can then include 0-9 in the rest of the name, as needed.
- Reserved words (null, for, if etc) cannot be used for variables, but can for property names.

- Variable declared using the var keyword will belong to the current function scope, or global scope if
declared outside of any function

Hoisting
- wherever a var declaration occurs, it is as if it occured at the top of the current function.
- i.e. it is 'hoisted' to top of the current function.
- Function definitions are also hoisted, so we can call a function and then define it afterwards in our code.
- Hositing of variables is confusing to read, so should be avoided.
*/

// declaration of var a hoisted
function foo(){
    a = 3;
    console.log(a);
    var a;
}
foo();

// function definition hoisted
foo();
function foo(){
    a = 3;
    console.log(a);
    var a;
}
/* Nested Scope
- Once a variable is declared, it is available in that scope, as well as in any lower/inner scopes
*/
function foo(){
    var c = 1;

    function bar(){
        var d = 2;             // c is not available inside of foo(), only within bar()
        console.log(c, d);     // 1 2
    }
    bar();
    console.log(c);            // would not be able to print d here
}
foo();            // 1 2 \n 1

/* let
- ES6 allows you to use let instead of var, a variable declared with let will belong to the block it is
declared within.
- e.g. a variable could belong to an if statement (and have its scope), rather than the parent function:
*/
function foo(){
    var a = 1;
    if (a >= 1){
        let b = 2;
    }
    // b would not be available here
}
