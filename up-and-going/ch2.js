/*
Exercises and notes from chapter 2 of YDKJS - Up & Going
https://github.com/getify/You-Dont-Know-JS/blob/master/up%20%26%20going/ch2.md

--------------------------------------------------------------------------------

TYPES
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
typeof a;   // 'object' - this is a bug

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
- Bracket notation is useful when you want to use special characters or the prop name is stored as another
variable.
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
- Arrays are a subtype of objects that hold values in numerically indexed positioned.
- These values can be of any type, and one array can hold a mixture of types.
- Arrays have properites that are automatically created and updated, such as length.
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

/* CONDITIONALS
- Javascript utilises if/else if/ else statements as well as switch statementes.
- Omitting breaks in switch statements means the execution will continue to the next statement, regardless
of whether the case matches.
*/
if (a == 2){
    // do something
}
else if (a == 10){
    // do something instead
}
else {
    // do a default thing
}

// equivalent using a swtich statement:

switch(a){
    case 2:
        // do something
        break;
    case 10:
        // do something instead
        break;
    default:
        // do a default thing
}

// concise if else form:
var a = 5;

var b = a > 7 ? 'a is bigger than 7' : 'a is not bigger than 7';

b;   // 'a is not bigger than 7'

/* STRICT MODE
- Strict mode forces code to adhere to a tighter set of rules, and should be used.
- Use it with  a function by adding "use strict"; at the top of a function
or throughout the document by adding this at the top of the page.
- One big difference is strict mode disallows the implicit global- variable declaration when var is
omitted:
*/
function foo(){
    a = 1;
}
foo();              // okay

function bar(){
    "use strict";
    b = 1;
}
bar();              // Uncaught ReferenceError: b is not defined

/* FUNCTIONS AS VALUES
- In the below code, foo is just a variable in the outer enclosing scope that has a refence to
the function being declared. i.e. the function itself is a value, jsut like 42 or [1,2,3] would be.
*/
function foo(){
    // ...
}
// This allows functions themselves to be values that are assigned to varibles
// As an anonymous function
var foo = function(){
    // ...
}
// Or as a named function
var x = function bar(){
    // ...
}

/* Immediately Invoked Funciton Expressions (IIFEs)
- The following function is invoked straight away after its definition.
- This is known as an IIFE
- The syntax looks weird at first, but just involves wrapping the function definition in (),
then using () to invoke it.
*/
(function IIFE(){
    console.log('Hello World!');
})();                             // Hello World!

// IIFEs can have return values
var x = (function IIFE2(){
    return 42;
})();

x;   //42

/* CLOSURE
- 'Think of closure as a way to "remember" and continue to access a function's scope (its variables)
even once the function has finished running'
*/
function makeAdder(x){
    // 'x' is an inner variable

    // inner function add() uses x, so it has closure over it
    function add(y){
        return y+x;
    };
    return add;
}

// addOne gets a reference to the inner add() func with closure over the x param of makeADDER
var addOne = makeAdder(1);
addOne(3);                  // 4 (= 3 + 1)

// addTen gets a reference to the inner add() func with closure over the x param of makeADDER
var addTen = makeAdder(10);
addTen(3);                  // 13 (= 3 + 10)

/* Modules
Closure is commonly used with modules to define private implementation of details that is hidden from
the outside world.
*/

function User(){
    var username, password;

    function doLogin(user,pw){
        username = user;
        password = pw;

        // more login work
    }

    var publicAPI = {
        login: doLogin
    }

    return publicAPI;
}
var fred = User();    // create a 'User' module instance
fred.login('fred','112hasfj8893');
/*
- Username, password and dologin are private inner details that cannot be accessed from outside
- Executing User() creates a new copy of all these inner variables/ functions assigned to Fred
- doLogin has closue over username & password, so will retain access to them after User() finishes running.
- This allows us to call the public method login, which has access to these variables
*/

/* this IDENTIFIER
- A this reference inside a function usually points to an object, but which object depends
on how the function is called.
- this does not refer to the function itself, as is a common misconception
*/

function foo(){
    console.log( this.bar );
}

var bar = 'global';

var obj1 = {
    bar: 'obj1',
    foo: foo
};

var obj2 = {
    bar: 'obj2'
}

foo();              // 'global' // this set to global object (would not work in strict mode)
obj1.foo();         // 'obj1'   // this set to obj1 object
foo.call( obj2 );   // 'obj2'    // this set to obj2 object
new foo();          // undefined  // this set to a brand new empty object

/* PROTOTYPES
- Javascript essentially uses an object's internal protype reference as a fallback if we try to access
a property that doesn't exist:
*/
var foo = {
    a: 42
}

var bar = Object.create( foo ); // create bar and protoype link it to foo

bar.b = 'hello world';

bar.b;    // 'hello world'
bar.a;    // 42    // 'falls back' to foo using the prototype link

/* POLYFILLING
- Polyfilling makes a newer feature of javascript avaiable in older browsers that don't support it
by using some code to produce the expected behaviour.
- e.g. ES6 defines the utility Number.isNaN to check for NaN values. We can polyfil this in older
browsers with the following code (which utilisis the fact NaN is the only value not equal to itself):
*/
if (!Number.isNaN){
    Number.isNaN = function isNaN(x){
        return x !== x;
    };
}

/* TRANSPILING
- Transpiling (transforming + compiling) just involves taking newer (e.g. ES6) syntax and making it
backwards compatible for older browsers.
*/
