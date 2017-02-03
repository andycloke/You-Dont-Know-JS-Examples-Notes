/* Chapter 3: Organization
Notes and example code from ch3 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch3.md

--------------------------------------------------------------------------------

Iterators
- Iterators are a structured pattern for pulling information form a source in a one-at-time fashion.
- Examples:
    - A utility that produces a new unique identifer each time it's requested.
    - An infinite series of values that rotates through a fixed list.
    - An iterator attached to a database query that pulls out new rows one at a time.

Iterator interfaces follow this specification:

Iterator [required]
    next() {method}: retrieves net IteratorResult

Iterator [optional]
    return() {method}: stops iterator and returns IteratorResult
    throw() {method}: signals error and returns IteratorResult

InteratorResult
    value {property}: current iteration value of final return value (optional if `undefined`)
    done {property}: boolean, indicates completion status

Iterable
    @@iterator() {method}: produces an Iterator

`@@iterator` is the special built-in symbol representing the method that can produce iterator(s)
for the object.


next() Iteration

Lets look at the example of an array, which is an iterable (and therefore produces an iterator):    */
var arr = [1,2,3];

var it = arr[Symbol.iterator]();

it.next();      // { value: 1, done: false }
it.next();      // { value: 2, done: false }
it.next();      // { value: 3, done: false }

it.next();      // { value: undefined, done: true }
/*
- Each time the method located at `Symbol.iterator` is invoked it returns a new fresh iterator.
- Most structures will do the same, including all the built-in data structures in JS.

- Other structures, such as an event queue, might only ever produce a single iterator/ one iterator
at a time.
- NB that we had to go past the last value to get `done: true` - we'll see later why this is best practice.

Primitive string values are (boxed into) iterables:     */
var greeting = 'hello world';

var it = greeting[Symbol.iterator]();

it.next();      // { value: 'h', done: false }
it.next();      // { value: 'e', done: false }
// ..

// Iterator Loop

// `for..of` loops consume iterables.
// We can make iterators into iterables like so:
var it = {
    // make the `it` iterator an iterable
    [Symbol.iterator](){ return this; },

    next(){ .. },
    // ..

};

it[Symbol.iterator]() === it;       // true

// we can now consume it with a `for..of` loop:
for (var v i =of it) {
    console.log( v );
}

// this is now the `for..of` loop actually works:
for (var v, res; (res = it.next()) && !res.done; ) {
    v = res.value;
    console.log( v );
}
/*
- NB that `it.next()` is called before each loop, then res.done is consulted. Once `res.done`
is `true`, we don't execute the contents of the loop. This is why our iterator should only set
the value of `done` to `true` after returning the last value. (which we mentioned earlier).

Custom Iterators

- You can make custom iterators. They simply must conform to ther iterator interface specified above.
- Let's make one that produces the infinite series of numbers in the Fibonacci series:  */

var Fib = {
    [Symbol.iterator]() {
        var n1 = 1, n2 = 1;

        return {
            // make the iterator an iterable
            [Symbol.iterator]() { return this; },

            next() {
                var current = n2;
                n2 = n1;
                n1 = n1 + current;
                return { value: current, done: false };
            },

            return(v) {
                console.log( 'Fibonacci sequence abandoned.' );
                return { value: v, done: true };
            }
        };
    }
};

for (var v of Fib) {
    console.log( v );

    if (v > 50) break;
}
// 1 1 2 3 5 8 13 21 34 55
// Fibonacci sequence abandoned.

/*
- The `Fib[Symbol.iterator]()` method when called returns the iterator object with `next()` and
`return()` methods on it.
- State is maintained via the `n1` and `n2` variables.

Generators

- A generator can pause itself in mid-execution, and be resumed either right way or at a later time.
- Each pause/ resume cycle in mid-execution is an opportunity for two-way message passing.

Generators declared as in any of the following ways:
*/
function *foo() { .. }
function* foo() { .. }
function * foo() { .. }
function*foo() { .. }

// There's a concise generator form available in object literals:
var a = {
    *foo() { .. }
};

// Generators have the new keyword `yield` which signals a point to pause at:
function *foo() {
    var x = 10;
    var y = 20;

    yield;

    var z = x + y;
}
// You use them by producing an iterator via a function call on the generator, then calling the
// `next` method on the iterator:
var it = foo();
it.next();

// You can put `yield` in a loop. Even in a never-ending loop to generate a random number every time it's called:
function *foo() {
    while (true) {
        yield Math.random();
    }
}

// `yield` both sends a value out, and can accept one from the `it.next` call when used as `var x = yield`.
// `yeild` is of the same 'expression precedence' (like operator precedence) as an assignment expression `(=)`:
var a, b;

a = 3;                  // valid
b = 2 + a = 3;          // invalid
b = 2 + (a = 3);        // valid

yield 3;                // valid
b = 2 + yield 3;        // invalid
b = 2 + (yield 3);      // valid

// Given this low precedence, very often will need brackets:
yield 2 + 3;            // same as `yield (2 + 3)`
(yield 2) + 3;          // `yield 2` first, then `+ 3`

/* - `yield` is right-associative, like `=`.

`yield *`

- `yield *` is used for 'yield delegation'.
- `yield *` requires an iterable.
- It invokes that iterable's iterator and delegates its own host generator's control to that iterator
until it's exhausted.
- e.g. in the following example, [1,2,3] produces an iterator that will step through its value,
so the *foo() generator will yield those value out as it is consumed.
*/
function *foo() {
    yield *[1,2,3];
}

// Is equivalent to:
function *bar() {
    yield 1;
    yield 2;
    yield 3;
}

function *foo() {
    yield *bar();
}

// Built-in iterators don't have return values, but we can define *bar to have one.
// This will be capture by `x` in foo:
function *bar() {
    yield 1;
    yield 2;
    yield 3;
    return 4;
}

function *foo() {
    var x = yield *bar();
    console.log( 'x:', x );
}

for (var v of foo()) {
    console.log( v );
}
// 1 2 3        // values yeiled out of `*bar()`
// x: 4         // return value of `*bar()`, assigned to `x`

// This allows us to perform a sort of generator recursion by calling itself
// (easiest to visualise as each call to itself creating a copy of the function
// and `yield`-delegating to that copy)

function *foo(x) {
    if (x < 3) {
        x = yield *foo( x + 1 );
    }
    return x * 2;
}
// Running through foo( 1 ) and callling `it.next` would be 24 (3 * 2 * 2 * 2)

// Iterator Control

function *foo() {
    yield 1;
    yield 2;
    yield 3;
}

var it = foo();

it.next();          // { value: 1, done: false }
it.next();          // { value: 2, done: false }
it.next();          // { value: 3, done: false }

it.next();          // { value: undefined, done: false }

// each `yield` pauses the program and waits for an optional value. So there'll be one more
// `it.next()` than the number of `yield`s:

function *foo() {
    var x = yield 1;
    var y = yield 2;
    var z = yield 3;
    console.log( x, y, z );
}

var it = foo();

it.next();                 // { value: 1, done: false }
it.next( 'foo' );          // { value: 2, done: false }
it.next( 'bar' );          // { value: 3, done: false }
it.next( 'baz' );          // { value: undefined, done: true }

// Early Completion

// The iterator attached to a generator supports the optional `return(..)` and `throw(..)` methods
// which immediately abort a paused generator:

function *foo() {
    yield 1;
    yield 2;
    yield 3;
}

var it = foo();

it.next();          // { value: 1, done: false }

it.return( 42 );    // { value: 42, done: true }

it.next();          // { value: undefined, done: true }
/*
- `return(x)` forces an immediate return `x` to be processed.
- It can be called manually, as above, and is also called at the end of any construct
that consumes an iterators (e.g. for..of loops and the `...` operator).
- It allows the generator to do any cleanup tasks.
- The main way to use it is with a `finally` clause:
*/
function *foo() {
    try {
        yield 1;
        yield 2;
        yield 3;
    }
    finally {
        console.log( 'cleanup' );
    }
}

for (var v of foo()) {
    console.log( v );
}
// 1 2 3
// cleanup!

var it = foo();

it.next();          // { value: 1, done: false }
it.return( 42 );    // cleanup!
                    // { value: 42, done: true }

// Error Handling
// done with `try..catch`, and works with both inbound and outbound messaging:

function *foo() {
    try {
        yield 1;
    }
    catch (err) {
        console.log( err );
    }

    yield 2;

    throw 'Hello!';
}

var it = foo();

it.next();                  // { value: 1, done: false }

try {
    it.throw( 'Hi!' );      // Hi!
                            // { value: 2, done: false }
    it.next();

    console.log( 'never gets here' );
}
catch (err) {
    console.log( err );     // Hello!
}
// Modules

// Pre-ES6 modules are based on an outer function with inner function which are exposed via
// a public API which has closure over the functions methods/ properties:

function Hello(name) {
    function greeting() {
        console.log( 'Hello ' + name + '!' );
    }

    // public API
    return {
        greeting: greeting
    };
}

var me = Hello( 'Kyle' );
me.greeting();              // Hello Kyle!

// If we only need one instance of the module, we'd use as IIFE:
var me = (function Hello(name) {
    function greeting() {
        console.log( 'Hello ' + name + '!' );
    }

    // public API
    return {
        greeting: greeting
    };
})( 'Kyle' );

me.greeting();              // Hello Kyle!

/* ES6 Modules

- Filed based modules, with one module per file.
- The API is static - you define what all the top-level exports are on your module's public API,
and they don't change.
- Singletons - there is only one instance of each module. Each time your import the module into another,
you get a reference to that one instace.
- The properties and methods you expose via the public API are like pointers in that changes to the module's
properties/ methods mean the external bindings to them will now resolve to the new value, even for primitive values.

- New keywords: `import` & `export`.
    - These must appear in the top level scope of their respective usage.

- `export` can be:
    1. Put in front of a declaration.
    2. Used as an operator (of sorts).
*/
export function foo() {
    // ..
}

export var awesome = 42;

var bar = [1,2,3];
export { bar };

// alternatively:
function foo() {
    // ..
}
var awesome = 42;
var bar = [1,2,3];

export { foo, awesome, bar };
/*
These are called named exports, since you're exporting name bindings of the variables/ functions.
- Anything you don't `export` will stay private in the scope of the module.
- There is no global scope in modules - the top level of scope is the module itself
(which these private variables might be in).

You can rename (alias) a module member during named export:     */
function foo() { .. }

export { foo as bar };

// Module exports are not just normal assignments of values/ references, but 'bindings', kind of
// like pointers.

var awesome = 42;
export { awesome };

// later
awesome = 100;
/*
- Even if we'd imported awesome before the last line, it's value would be 100.
- This is because the binding is essentially a reference/ pointer to the value, not a copy.
- You should use one export only in a module for each method/ property.
- The `default` keyword sets the deafult exported binding.
*/
function foo(..) { .. }
export { foo as default };  // this has the behaviour described above:
                            // future changes to `foo` will be seen by modules that import it

function foo(..) { .. }
export default foo;
/*
This second approach only exports an expression value binding to `foo`'s expression
at this point in time. Its name would be `default`. Which is different to the top approach,
which exports a binding to the local identifer.
- Therefore future changes to `foo` in the exporting module (this one) won't be seen by
importing module(s). Use only if `foo` isn't going to change.

You can re-export another module's exports, such as:    */
export { foo, bar } from 'baz';                 // equivalent to import `foo` and `bar` from `baz`, then export them as `foo` and `bar`
export { foo as FOO, bar as BAR } from 'baz';   // equivalent to import `foo` and `bar` from `baz`, then export them as `FOO` and `BAR`
export * from 'baz';                            // equivalent to import everything from `baz`, then export it with its original names

// Importing API Members

import { foo, bar, baz } from 'foo';            // to import specific named members of a module's API

foo();
/*
- 'foo' must be a string. It can't be an identifer - We want statically analyzable code.
- It is called a module specifier.
- It will interpreted by the module loader as a URl path or local filesystem path.

- Note that despite the similar looking syntax ( {} ) this is different to object destructuring/ literals.

- The `foo`, `baz` and `bar` identifers listed above must match named exports on the module's API.
- You can rename them as so:
*/
import { foo as theFooFunc } from 'foo';

theFooFunc();

// if the exporting module has just a default export:
import foo from 'foo';
// or:
import { default as foo } from 'foo';

// If we have this exporting module (which is recommended. Remember - you can only have one `export default`):
export default function foo() { .. }

export function bar() { .. }
export function baz() { .. }

// you would import it as so:
import FOOFN, { bar, baz as BAZ } from 'foo';

FOOFN();
bar();
baz();

// There's a tradeof between importing everything (saves having to update imports constantly) and
// importing narrowly (makes static analysis and error detection more robust).

// if we have this exporting module:
export function bar() { .. }
export var x = 42;
export function baz() { .. }

// Good approach: bring everything in like so:
import * as foo from foo;
foo.bar();
foo.x;          // 42
foo.baz();

/* Circular Module Dependency

- A imports B. B imports A.
- It's possible but best avoided.

Module Loading
- The `import` statement uses a seperate mechanism, provided by the hosting environment (browser,
Node.js, etc) to actually resolve the module specifier string into some useful instruction for actually
finding and loading the esired module.

- Usually:
    - Browsers will interpret module specifier strings as URLs.
    - Node.js will interpret module specifier strings as filesystem paths.


Classes

- Remember from 'this & Object Prototypes' that JS classes aren't real classes.

`class`
- ES6 introduces this syntax:
*/
class Foo {
    constructor(a,b){
        this.x = a;
        this.y = b;
    }

    gimmeXY() {
        return this.x * this.y;
    }
}
/*
- Methods use the same 'concise method' syntax as that discussed for objects.
- Unlike object literals, there are no commas separating members - they're not allowed!

Most class-like thing in pre-ES6 syntax:
*/
function Foo(a,b) {
    this.x = a;
    this.y = b;
}

Foo.prototype.gimmeXY = function() {
    return this.x * this.y;
}
// Use both like:
var f = new Foo( 5, 15 );

f.x;            // 5
f.y;            // 15
f.gimmeXY();    // 75

/* Differences:
- ES6 `class` version must be made with `new`. Can't do `Foo.call( obj )`.
- pre-ES6 `function Foo` is hoisted. ES6 `class` is not. -> must declare class before instantiating it.
- ES6 `class Foo` in the top global scope creates a lexical `Foo` identifier, but does not create a
global object property of that name (which the pre-ES6 `function Foo` does.)

`extends` and `super`
*/
class Bar extends Foo {
    constructor(a,b,c) {
        super( a, b );
        this.z = c;
    }

    gimmeXYZ() {
        return super.gimmeXY() * this.z;
    }
}

var b = new Bar( 5, 15, 25 );

b.x;                // 5
b.y;                // 15
b.z;                // 25
b.gimmeXYZ();       // 1875
/*
- In a constructor, `super` refers to the parent constructor.
- In a method, `super` refers to the parent object.

- `Bar extends Foo` means that the [[Prototype]] of `Bar.prototype` is linked to `Foo.prototype`.

- Both classes and sub-classes have a default constructor.
- A subclass will use its parent class's constructor as a default constructor - different to pre-ES6 'classes'.

- ES6 classes allow you to extend the built-in natives, e.g. give arrays a `first` property that returns
their first element.
*/
