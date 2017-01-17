/* Chapter 5: Prototypes
Notes and example code from ch5 of the 'this' & Object Prototypes book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch5.md

--------------------------------------------------------------------------------

- All the attempts to emulate class-copy behaviour described in ch4 circumvent [[Prototype]] discussed here.

[[Prototype]]
- JS objects habe an internal property, denoted [[Prototype]], that is simply a reference to another object.
- For almost all objects, [[Prototype]] is given a non-`null` value during creation.

- Remmber from chapter 3, that [[Get]] first checks if an object has a specific property, then checks the
object's [[Prototype]] link/ chain:
*/
var anotherObject = {
    a: 2
};

// create an object linked to `anotherObject`
var myObject = Object.create( anotherObject );

myObject.a;     // 2
/*
- If `a` had not existed on anotherObject, its [[Protoype]] chain would have been followed (if it had one)
- Similarly, a `for..in` loop will iterate over an object's properties and those reach via its [[Prototype]] chain:
*/
var anotherObject = {
    a: 2
};

// create an object linked to `anotherObject`
var myObject = Object.create( anotherObject );

for (var k in myObject) {
    console.log( k );
}
// a

('a' in myObject);      // true

/* `Object.prototype`

- The top end of every normal [[Prototype]] chain is the built-in `Object.prototype`.
    - This object includes a variety of built in common utilites, e.g. .toString()

Setting & Shadowing Properties
- Consider the following assignment: */
myObject.foo = 'bar';
/*
- If `myObject` already has a normal data accessor property called `foo` directly present on it, the
assignment is as simple as changing the value of the existing property.

- If `foo` is not already directly present on myObject, the [[Prototype]] chain is traversed, as above with
[[Get]] above.
    - If `foo` is not found anywhere on the chain, it is added to `myObject` directly with the value `bar`.

- If we end up with a property called `foo` on both myObject itself and higher up the [[Prototype]] chain, then
that is called shadowing - the lower down `foo` (on myObject) will always be reached first, so "casts a shadow"
over the other property named `foo`.

- When we make the assignment above, and `foo` is not on myObject directly but IS higher in the chain,
 3 things can happen:

    1. If a normal data accessor named `foo` is found on the [[Prototype]] chian, and it's NOT marked
    as `writable: false`, then a new property called `foo` is added directly to myObject, resulting
    in a shadowed property, ad discussed above.

    2. If `foo` is found higher up the chain, but is marked as `writable: false`, then we can not change its
    value or add a new one to myObject directly. The code will silently fail or throw an error (in strict mode).
        - Perhaps surprising that we cannot write to myObject - done to given the illusion of inheritance, but only
        an illusion since no inheritance copying actually occurs, only copying of references (see ch4)

    3. If `foo` is found on the [[Prototype]] chain and it's a stter, then the setter will be called. No `foo` will be
    added to myObject, no will the `foo` setter be redefined.

- In cases 2 & 3 you must use `Object.defineProperty(..)` too add `foo` to myObject.
- Generally shadowing is very dificult and can be v nuanced, so best avoided.

-Shadowing can even occur implicitly in very subtle ways:
*/
var anotherObject = {
    a: 2
};

var myObject = Object.create( anotherObject );

anotherObject.a;    // 2
myObject.a;         // 2

anotherObject.hasOwnProperty( 'a' );    // true
myObject.hasOwnProperty( 'a' );         // false

myObject.a++;                           // oops, implict shadowing!

anotherObject.a;    // 2
myObject.a;         // 3

myObject.hasOwnProperty( 'a' );         // true

/* What happened?
- We might have expected `myObject.a` to look up a on anotherObject and increment it there.
- Instead it does a [[Get]] to look it up, increments it, then does a [[Put]] assigning the value of
`3` to a new shadowed property on myObject.

CLASS
- Classes don't exist in JS.
- JS is one of the few languages where an object can be created directly, without using a class at all.

'Class' Functions
- For a long time, people have hacked something that looks like classes.
- Makes use of the fact that all functions by default get a public, non-enumerable porperty on them called
`protoype`.
- If we declare a 'new Foo()' it will end up lined to this "Foo dot prototype" object:
*/
function Foo(){
    // ...
}

Foo.prototype;      // { }

var a = new Foo();

Object.getPrototypeOf( a ) === Foo.prototype;       // true
/*
- This is (ab)used as a hacky way of instatiating classes - however it is limited `a` doesn't copy
the object that `Foo.prototype` is pointing at, it simply links to the SAME one.
- Often labelled "prototypal inheritance", but this is like calling an apple a red orange!

"Constructors"

- Functions are not constructors, but function calls are "constructor calls" if and only if `new` is used.
- When we call a function with 'new' in front of it, it executes, and also returns a function object.
- N.B. - its a very common misconception that "class"es are named with a capital letter, even though they don't exist.
*/

function NothingSpecial(){
    console.log( "Don't mind me!" );
}

var a = new NothingSpecial();
// "Don't mind me!"

a;      // {}

/* Mechanics
- Another hack with the aim of adding class functionality to JS:
*/
function Foo(name){
    this.name = name;
}

Foo.prototype.myName = function(){
    return this.name;
};

var a = new Foo( 'a' );
var a = new Foo( 'b' );

a.myName();     // 'a'
b.myName();     // 'b'
/*
1. `this.name` adds the `.name` property onto each of `a` and `b`. Similar to how class instances contain data values.

2. `Foo.prototype.myName = ...` add a property function (method) to the Foo.prototype object.
    - when `a` & `b` are created, they end up with an internal [[Prototype]] link
    - when `myName` is not found on `a` or `b`, it's instead found through delegation (see ch6) on `Foo.prototype`.

"Constructor" Redux
- By default the `Foo.prototype` object has a public, non-enumerable property called `.constructor`.
- This seems to point to the object that created it, but this is a misconception.
*/
function Foo(){
    // ...
}

Foo.prototype.constructor === Foo;  // true

var a = new Foo();
a.constructor === Foo;              // true
/*
- However the `.constructor` property on `Foo.prototype` is only there by default.
- If you a new object object and assign `Foo.prototype` to this, `.constructor` is not replaced:
*/
function Foo() { /* .. */ }

Foo.prototype = { /*..*/ }

var a1 = new Foo();
a1.constructor === Foo;     // false!
a1.constructor === Object;     // true!
/*
- Do not think of `constructor` as "was constructed by".
    - e.g. above, `a1` was clearly constructed by `Foo`
- `a1` has no constructor property, so delegates up the [[Prototype]] chain to Foo.Prototype
- But that object doesn't have a `.constructor` either so it keeps delegating up to `Object.prototype`,
the top of the delegation chain.
- This object indeed hs a `.constructor` on it, which points to the built-in `Object(..)` function.

(PROTOTYPAL) INHERITANCE
-
