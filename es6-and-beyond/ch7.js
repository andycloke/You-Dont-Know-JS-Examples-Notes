/* Chapter 7: Meta Programming
Notes and example code from ch7 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch7.md

--------------------------------------------------------------------------------

- Meta programming is programming where the operation targets the behaviour of the program itself.
-It involves:
    1. Code inspecting itself.
    2. Code modifiying itself.
    3. Code modifiying default language behaviour.
- Common examples include `instanceof` and `a.isPrototype(b)`.

Function Name
- The lexical binding name is what you use for things like recursion:
*/
function foo(i) {
    if (i < 10) return foo( i * 2 );
    return i;
}
// Functions also have a `name` property.
// As of ES6, a function's lexical name is set as its `name` property.

// What happens if there is no lexical name? ES6 defines some rules. Consider:
var abc = function() {
    // ..
};

abc.name;               // 'abc'

// If we'd done `abc = function def() { .. }`, the `name` prop would have been the lexical name `def`

// Some other ES6 rules:
(function(){ .. });             // name:
(function*(){ .. });            // name:
window.foo = function(){ .. }   // name:

class Awesome {
    constructor() { .. }        // name: Awesome
    funny() { .. }              // name: funny
}

var c = class Awesome { .. };   // name: Awesome

var o = {
    foo() { .. },               // name: foo
    *bar() { .. },              // name: bar
    baz: () => { .. }           // name: baz
    bam: function(){ .. },      // name: bam
    get qux() { .. },           // name: get qux
    set fuz() { .. },           // name: set fuz
    ['b' + 'iz']:
        function(){ .. },       // name: biz
    [Symbol( 'buz' )]:
        function(){ .. }        // name: [buz]
};

var x = o.foo.bind( o );            // name: bound foo
(function(){ .. }).bind( o );       // name: bound

export default function() { .. }    // name: default

var y = new Function();             // name: anonymous
var GeneratorFunction =
    function*(){}._proto_.constructor;
var z = new GeneratorFunction;      // name: anonymous

/* Meta Properties

- Meta properties are designed to provide special meta information in the form of a property access
that would not otherwise have been possible.
- e.g. `new.target` always points at the constructor that `new` directly invokes, even if this constructor
is in a parent class.
- Clearly `new` is itself not an object, which makes this capability special.
- Why would we use this? Perhaps we want different behaviour in a constructor depending on whether the
class was instantiated directly or via a child class:
*/
class Parent {
    constructor() {
        if (new.target === Parent) {
            console.log( 'Parent instantiated' );
        }
        else {
            console.log( 'A child instantiated' );
        }
    }
}

class Child extends Parent {}

var a = new Parent();
// Parent instantiated

var b = new Child();
// A child instantiated

/* Well-Known Symbols
- There are several built-in symbols designed to expose special meta properties.

Symbol.iterator
- `Symbol.iterator` represents the special location (property) where the language mechanims (`...` and `for..of`)
will look to find a method that will construct an iterator instance for consuming that object's values.
*/
var arr = [4,5,6,7,8,9];

for (var v of arr) {
    console.log( v );
}
// 4 5 6 7 8 9

// define iterator that only produces values from odd indexes
arr[Symbol.iterator] = function*() {
    var idx = 1;
    do {
        yield this[idx];
    } while ((ix += 2) < this.length);
};

for (var v of arr) {
    console.log( v );
}
// 5 7 9
/*
- Setting `Symbol.toStringTag` on an object allows us to control the output of `.toString()`
when it is called on that object.
- Similarly setting `Symbol.hasInstance` on an object allows us to control the output of the
`instanceof` operator when called on an object.

- By default when a built-in method needs to spawn new instances (e.g. `.slice` for arrays), you'll
want it to use the constructor of that particular class, rather than the constructor of a parent class,
if present.
- `[Symbol.species]` allows you to overwrite this behaviour and change the constructor used.

- `[Symbol.toPrimitive]` allows you to set the primitive value that an object will be coerced to for
cetain operations (e.g. == ).

- `[Symbol.match]` is the method used to match all or part of a string value with the given regex.

- `[Symbol.isConcatSpreadable]` is a boolean which indicates whether or not the object should be
spread out if passed to an array `concat(..)`.
*/
var a = [1,2,3],
    b = [4,5,6];

b[Symbol.isConcatSpreadable] = false;

[].concat( a, b );      // [1,2,3,[4,5,6]]

// `[Symbol.unscopables]` defines which variables can/ cannot be exposed as lexical variables in a
// `with` statement:

var o = { a:1, b:2, c:3 },
    a = 10, b = 20, c = 30;

o[Symbol.unscopables] = {
    a: false,
    b: true,    // true means the prop is unscopable - it is filtered out from the lexical scope variables below
    c: false
};

with (o) {
    console.log( a, b, c );     // 1 20 3
}

/* Proxies
- Proxies (new in ES6) are objects that 'wrap' other objects.
- Special handlers (traps) can be registered on the proxy. These handlers are called when various operations
are performed agaisnt the proxy.
    - These handlers can therefore perfrom extra logic, as well as forwarding the operations on to the original
    target/ wrapped object.

- For example,we can register a `get` trap on a proxy, which intercepts the [[Get]] operation when you
try to access a property on an object:
*/
var obj = { a: 1 },
    handlers = {
        get(target,key,context) {
            // note: target === obj,
            // context === pobj
            console.log( 'accessing: ', key);
            return Reflect.get(                 // 'forwards' operation onto obj
                target, key, context
            );
        }
    },
    pobj = new Proxy( obj, handlers );

obj.a;
// 1

pobj.a;
// accessing: a
// 1

// Feature Testing

// Feature testing tests for the existence and correct behaviour of a feature. e.g.:

if (!Number.isNaN) {
    Number.isNaN = function(x) {
        return x !== x;
    };
}

// What if we want to test for features that involce new syntax?
// We should use the `Function(..)` constructor:
try {
    new Function( '( () => {} )' );
    ARROW_FUNCS_ENABLED = true;
}
catch (err) {
    ARROW_FUNCS_ENABLED = false;
}
/*
- Different to the `.isNaN` test above, in that if the syntax isnt supported, it literally can't appear
in your file without causing an error (so polyfilling is not appropriate).
- Instead we'd use tests like this one to determine which JS file to load.
- Supplying two different JS files like this is known as split delivery, and is more performant than
just transpiling everything to pre-ES6.
- FeatureTest.io is useful for doing these feature tests efficicently.

Tail Call Optimization (TCO)

- When a function call is made from within another function, a second stack frame is allocated to
separately manage the state of that second function invocation.
- JS engines set abritrary limits on the maximum size of the call stack.
- Usually this is not an issue, but occasionally (when recursion is involved) it can become
such an issue that recursion is avoided, and a different approach is taken.
- Certain patterns of function calls, known as tail calls, can be optimized in a way to avoid the
extra allocation of stack frames, avoiding the issues above, and allowing certain recursive
functions to be practical.
- NB the optimisation can only occur in strict mode.
*/
'use strict'

function foo(x) {
    return x * 2;
}

function bar(x) {
    // not a tail call
    return 1 + foo( x );
}
bar( 10 );                  // 21

// TCO:

'use strict'

function foo(x) {
    return x * 2;
}

function bar(x) {
    x = x + 1;
    if (x > 10) {
        return foo( x );        // tail call
    }
    else {
        return bar( x + 1 );    // tail call
    }
}

bar( 5 );                   // 24
bar( 15 );                  // 32
