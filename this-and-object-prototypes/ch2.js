/* Chapter 2: 'this' All Makes Sense Now!
Notes and example code from ch2 of the 'this' & Object Prototypes book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch2.md

--------------------------------------------------------------------------------

CALL-SITE

- The call-site is the location in code where a function is called from.
- Often just involves going to the place where the function was called, but can be more
complicated, as seen below.
- The call-stack can be visualised as the chain of function calls.
- You should use 'debugger;' with develop tools, which will display the call-stack.
*/
function baz(){
    // call-stack is: 'baz'
    // so, our call-site is in the global scope

    console.log( 'baz' );
    bar();      // <-- call-site for 'bar'
}

function bar(){
    // call-stack is: 'baz' -> 'bar'
    // so, our call-site is in 'baz'

    console.log( 'bar' );
    foo();      // <-- call-site for 'foo'
}

function foo(){
    // call-stack is: 'baz' -> 'bar' -> 'foo'
    // so our call-site is in 'bar'

    console.log( 'foo' );
}

baz();      // <-- call-site for 'baz'

/* NOTHING BUT RULES

Default Binding
- Variables declared in the global scope are global-object properties with the same name.
- In the below snipper, foo() is called with a plain, un-decorated function reference.
- Therefore the default binding for 'this' applies to the function call.
- 'this.a' resolves to the global object property (variable) 'a'.
*/
function foo(){
    console.log( this.a );
}
var a = 2;
foo();          // 2

// strict mode causes a TypeError. Generally best to use strict mode for everthing or nothing.
function foo(){
    'use strict';
    console.log( this.a );
}
var a = 2;
foo();          // TypeError: 'this' is 'undefined'

/* Implicit Binding
- When the call-site has a context object (also known as an owning or containing object)
- foo() is declared than added as a reference property onto obj.
    - It is not really owned/ contained by obj - it can still be used elsewhere, e.g.
- However - the call-site uses the obj context to reference the function
    - so here you could say obj owns/ contains the function reference at the time it is called.
- Because obj is the 'this' for the foo() call, 'this.a' is equivalent to 'obj.a'
*/
function foo(){
    console.log( this.a );
}

var obj = {
    a: 42,
    foo: foo
}

obj.foo();          // 2

// only the top/ last level of an object property reference chain matters:
function foo(){
    console.log( this.a );
}

var obj2 = {
    a: 42,
    foo: foo
};

var ob1 = {
    a:2,
    obj2: obj2
};

obj1.obj2.foo();        // 42

/* Implicitly Lost
- When an implicity bound function loses that binding it falls back to the default binding,
which is the global object (not in strict mode) or 'undefined' (in strict mode):
*/
function foo(){
    console.log( this.a );
}

var obj = {
    a: 2,
    foo: foo
};

var bar = obj.foo;      // function reference! i.e. bar() is the same as foo()

var a = 'oops, global a';   // 'a' now a property on global object

bar();      // 'oops, global a'

/*
- In the code above, bar is a reference to foo, not a reference to obj.foo, so when
it is called as a plain, undecorated call the default binding applies
- Can produce unexpected consequence when passing a callback function.
- N.B. this is exactly the same issue as above, where we create a reference to foo rather than
obj.foo, it is just a little more complicated.
*/
function foo(){
    console.log( this.a );
}

function doFoo(fn){
    // 'fn' is just another reference to 'foo'

    fn();   // <-- call-site! not calling obj.foo, but foo()
}

var obj = {
    a: 2,
    foo: foo
};

var a = 'oops, global';     // 'a' also propety on global object

doFoo( obj.foo )    // 'oops, global'

// The same applies if passing a callback to a built in function:
function foo(){
    console.log( this.a );
}

var obj = {
    a: 2,
    foo: foo
};

var a = 'oops, global';         // 'a' also a property on global object

setTimeout( obj.foo, 100);      // 'oops, global'

/* Explicit Binding
- we can force a function call to use a particular object for the 'this' binding, by using
the call() and apply() methods:
*/
function foo(){
    console.log( this.a );
}

var obj = {
    a: 2
};

foo.call( obj );    // 2

/*
- foo is invoked with explicit binding by foo.call(..), which forces its 'this' to be obj
- If you pass a primitive value (string/ boolean/ number) instead of obj, it is 'boxed' into object-form
with 'new strind(..)' etc.
- call(..) & apply(..) are identical with repest to 'this' binding

Hard Binding
- bar() manually call 'foo.call(obj)' internally, forcibly invoking foo with obj binding for this.
- No matter how we later invoke bar, it will always invoke foo with obj.
- This binding is both explicit & strong, so is known as hard binding:
*/
function foo(){
    console.log( this.a );
}

var obj = {
    a: 2
};

var bar = function(){
    foo.call( obj );
};

bar();      // 2
setTimeout( bar, 100 );     // 2

/*
- More typically, we can wrap a function with hard binding by creating a pass-thru of any argument
passed and any return value received:
*/
function foo(something){
    console.log( this.a, something );
    return this.a + something;
}

var obj = {
    a: 2
};

var bar = function() {
    return foo.apply( obj, arguments );
};

var b = bar( 3 );       // 2 3
console.log( b );       // 5

// we can create a re-usable helper function to bind a function to an object:

function foo(something){
    console.log( this.a, something );
    return this.a + something;
}

// simple 'bind' helper
function bind(fn,obj){
    return function() {
        return fn.apply( obj, arguments );
    };
}

var obj = {
    a: 2
};

var bar = bind( foo, obj );

var b = bar( 3 );       // 2 3
console.log( b );       // 5

// ES5 provides a built-in utility to hard bind:
function foo(something) {
    console.log( this.a, something );
    return this.a + something;
}

var obj = {
    a: 2
};

var bar = foo.bind( obj );

var b = bar( 3 );       // 2 3
console.log( b );       // 5
/*
- 'bind(..)' returns a new function that is hard-coded to call the original function with the 'this'
context set as you specified.
- many library functions and new built-in JS functions use call/ apply internally to save you the trouble.

'new' Binding
- When 'new' is used in JS, it makes that function called a constructor call. It does not instatiate
a new instance of a class using that classes construct function (as expected in class orientated languages).
- When we invoked a function with new in front of it:
    1. A brand new object is crearted (aka constructed)
    2. the newly constructed object is [[Protoype]]-linked
    3. the newly constructed object is set as the 'this' binding for that function call
    4. unless the function returns its own alternate object, the new-invoked function call will
    automaticlly return the newly constructed object.
*/
function foo(a){
    this.a = a;
}

var bar = new foo( 2 );
console.log( bar.a );       // 2
/*
- By calling foo(..) with new in front of it, we've constructed a new object and set that new object as the
'this' for the call of foo(..).

EVERYTHING IN ORDER
- The order of precedence for determining 'this' is:
    1. new binding - 'new' in front of function call
    2. explicit binding - function called with 'call' or 'apply'. could be hidden inside a 'bind' hard binding
    3. implicit binding - function called with a context (e.g. 'obj1.foo()')
    4. default binding - strict mode: undefined. non strict mode: global object
Demos:
- Explicit binding takes precedence over implicit binding:
*/
function foo(){
    console.log( this.a );
}

var obj1 = {
    a: 1,
    foo: foo
};

var obj2 = {
    a: 2,
    foo: foo
};

obj1.foo();     // 1
obj1.foo.call( obj2 );     // 2     // explicit binding ('call(..)') takes precedence

// new binding take precedence over implicit binding
function foo(something){
    this.a = something;
}

var obj1 = {
    foo: foo
};

var obj2 = {};

obj1.foo( 2 );
console.log( obj1.a );      // 2

var bar = new obj1.foo( 4 );
console.log( obj1.a );      // 2
console.log( bar.a );      // 4     // since bar.a != obj1.a, new took precedence over implicit binding

// - new binding takes precedence over explicit (in this case, hard) binding:

function foo(something) {
    this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );     // foo hard binded to obj1 - i.e. this always = obj1 in foo
bar( 2 );
console.log( obj1.a );  // 2

var baz = new bar( 3 );
console.log( obj1.a );      // 2
console.log( baz.a );      // 3

/*
- In the above snippet, new bar(3) did not change obj1.a to 3 even though bar is hard bound to obj1.
- Instead the hard bound call to bar(..) is overridden with 'new'.
- We get a newly created object back named 'baz'.

Determining 'this':

1. Is the function called with 'new' (new binding)?
    Yes: 'this' is the newly constructed object.

    'var bar = new foo()'

2. Is the function called with 'call' or 'apply' (explicit binding). Perhaps hidden inside
a 'bind' (hard binding)>
    Yes: this is the explicitly specified object.

    'var bar = foo.call( obj2 )'

3. Is the function called with a context (implicit binding)?
    Yes: 'this' is that context object

    'var bar = obj1.foo()'

4. Otherwise, default the 'this' to undefined / global object (default binding):

    'var bar = foo()'

BINDING EXCEPTIONS

- 'this' is ignored when null/ undefined is passed into call/ apply/ bind:
*/
function foo(){
    console.log( this.a );
}

var a = 2;
foo.call( null );       // 2

// this can be used as a placholder value when using 'apply' to spread args or 'bind' to curry them:

function foo(a,b){
    console.log( 'a:' + a + ' b:' = b);
}

// spreading out array as parameters
foo.apply( null, [2, 3]);       // a:2 b:3

// currying with 'bind(..)'
var bar = foo.bind( null, 2);
bar( 3 );       // a:2, b:3

/*
- The danger is that if apply/ bind make a this call they might reference the global object
- Can mitigate agaisnt this be passing an empty object instead:
*/
function foo(a,b){
    console.log( 'a:' + a + ' b:' = b);
}
// our DMZ (safe) empty object
var ∆ = Object.create( null );

// spreading out array as parameters
foo.apply( ∆, [2, 3]);       // a:2 b:3

// currying with 'bind(..)'
var bar = foo.bind( ∆, 2);
bar( 3 );       // a:2, b:3

/* Indirection
- Similarly to the examples in 'Implicit Binding' above, when we create 'indirect references' to
functions, and then invoked that function reference, the default binding rule applies:
*/
function foo(){
    console.log( this.a );
}

var a = 2;
var o = { a: 3, foo: foo};
var p = { a: 4 };

o.foo();    // 3
(p.foo = o.foo)()   // 2    // p.foo is equivalent to foo()

/* LEXICAL THIS
- Arrow functions (ES6) adopt the 'this' binding from the enclosing (function / global) scope, rather
than adhering to the four standard 'this' rules.
- This lexical binding cannot be overwritten (with another call/ or 'new'):
*/
function foo(){
    // return an arrow function
    return (a) => {
        // 'this' here is lexically adopted from 'foo()'
        console.log( this.a );
    }
}
var obj1 = {
    a: 1
};
var obj2 = {
    a: 2
};

var bar = foo.call( obj1 );  // foo is 'this'-bound to obj1. bar is too
bar.call( obj2 );           // 2, not 3!       // cannot overwrite lexical binding of an arrow-function

/*
- This used to be achieved by adding 'var self = this;' to capture lexical scope.
- Better to:
    1. Use only lexical scope and forget the false pretense of 'this'-style code.
    2. Embrace 'this'-style mechanism completely, including 'bind(..)', and avoid 'self = this'.
