/* Chapter 2: Syntax (part 1 of 2)
Notes and example code from ch2 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch2.md

--------------------------------------------------------------------------------

Block-Scoped Declarations
- In standard JS we have to use function declations/ IIFEs to create a block of scope.  */

var a = 2;

(function IIFE(){
    var a = 23;
    console.log( a );       // 3
})();

console.log( a );           // 2

// `let` Declarations
// In ES6 we can do so create scope for any block using `let` declaratons:

var a = 2;

{    let a = 3;         // stylistically good to put declarations on same line as block - indicates what the block is for.
    console.log( a );   // 3
}

console.log( a );       // 2

// Accessing a let variable earlier than its declaration causes an error:
// Technically called a Temporal Dead Zone (TDZ) error.
{
    console.log( a );       // undefined
    console.log( b );       // ReferenceError!

    var a;
    var b;
}

// `typeof` behaves differently for TDZ variables than for undeclared/ declared variables.
{
    // `a` is not declared, therefore we will enter this if statement
    if (typeof a === 'undefined') {
        console.log( 'cool' );
    }

    // 'b' is declared, but is in its TDZ
    if (typeof b === 'undefined') {         // ReferenceError!!
        // ..
    }

    // ..

    let b;
}
/*
- For these reasons we should put `let` declarations at the top of their scope.
- This makes it more 'explicit' what variables o a block contains.

let+for
- The only exception to this 'explicit' preference is `let` declarations in the head of for loops,
which can be more implicit:  */
var funcs = [];

for (let i = 0; i < 5; i++) {
    funcs.push( function(){
        console.log( i );
    } );
}

funcs[3]();     // 3
/*
- `let` allows us to declare a new `i` variable each time.
- The closure created inside the loop closes over each `i`.
- If you'd done this with `var` instead of `let`, you'd print 5 to the console, not 3,
because there'd only be one i in the outer scope that was closed over.

`const` Declarations
- `const` creates constants, which are block scoped in the same way that `let` variables are,
but they are read only once their value is set.
- `const`s must be initialised to a value when they are declared, so if you wanted a `const`
with the undefined value, you'd need to set it as `const a = undefined`.    */
{
    const a = 2;
    console.log( a );   // 2

    a = 3;              // TypeError!
}
// Subtle point - `const`s are not constant values, but constant references to values:
{
    const a = [1,2,3];
    a.push( 4 );
    console.log( a );   // [1,2,3,4]

    a = 42;             // TypeError!
}
/*
- `const` might be slightly quicker than `var`/ `let`, but we don't really know.
- Some developers propose using `const` for every variable, then chaning to `let` as and when
you need it, in order to avoid 'accidentally' changing values, but really anyone can just change
a `const` to a `let` without thinking about it too much.
- A better approach is to use `const` when you genuinely don't want to change the value of a variable,
which will help readability/ understandability of your code.

Block-Scope Functions
- Functions are now scoped to blocks:   */

{
    foo();          // works!

    function foo(){     // n.b. this declaration is hoisted to top of block
        // ..
    }
}

foo();              // ReferenceError

/* Spread/ Rest
- `...` operator in ES6 is known as the spread or rest operator.
- When used in front of an iterable, it 'spreads' out its individual values.    */

function foo(x,y,z) {
    console.log( x, y, z );
}
foo( ...[1,2,3] );      // 1 2 3

// Or:
var a = [2,3,4];
var b = [ 1, ...a, 5];

console.log( b );       // [`1,2,3,4,5`]

// Other common use is essentially the opposite:
// 'Gather the rest of the arguments into an array called z'
// these are known as the 'rest parameters'
function foo(x, y, ...z){
    console.log( x, y, z );
}

foo( 1, 2, 3, 4, 5 );       // 1 2 [3,4,5]

// if there are no other arguments, `...` simply collects all of the arguments
function foo(...args) {
    console.log( args );
}

foo( 1, 2, 3, 4, 5);        // [1,2,3,4,5]
/*
- Provides a good alternative to using the old `arguments` array-like object.

Default Parameter Values
- Traditionally default parameter values are done like this:        */

function foo(x,y) {
    x = x || 11;
    y = y || 31;

    console.log( x + y );
}

foo();          // 42
foo( 5, 6 );    // 11
foo( 5 );       // 36
foo( null, 6);  // 17

// issue:
foo( 0, 42);    // 53 <-- not 42! since 0 is falsy

// sometimes fixed as:
function foo(x,y) {
    x = (x !== undefined) ? x || 11;
    y = (y !== undefined) ? y || 31;

    console.log( x + y );
}

foo( 0, 42 );   // 42
foo( undefined, 6 );   // 17

// of course there is now the issue that we can't pass in and use `undefined`
// we can do:

function foo(x,y) {
    x = (0 in arguments) ? x : 11;
    y = (1 in arguments) ? y : 31;

    console.log( x + y );
}

foo( 5 );               // 36
foo( 5, undefined );    // NaN

// Howeever there is now no way to omit the first value, and just pass in a y.

// Luckily ES6 provides us with default parameter value syntax as so:

function foo(x = 11, y = 31) {
    console.log( x + y );
}

foo();                  // 42
foo( 5, 6 );            // 11
foo( 0, 42 );           // 42

foo( 5 );               // 36
foo( 5, undefined)      // 36 <-- `undefined` is missing
foo( 5, null)           // 5  <-- null coerces to `0`

foo( undefined, 6 );    // 17 <-- 'undefined' is missing
foo( null, 6 );         // 6  <-- null coerces to `0`

// Destructuring
// We can think of destructuring as a structured assignment.
// consider, in pre-ES6 syntax:
function foo() {
    return [1,2,3];
}

var tmp = foo(), a = tmp[0], b = tmp[1], c = tmp[2];

console.log( a, b, c);      // 1 2 3

// in ES6 syntax:
var [ a, b, c ] = foo();

console.log( a, b, c);      // 1 2 3

// similarly for object. Pre-ES6:
function bar() {
    return {
        x: 4.
        y: 5,
        z: 6
    };
}

console.log( x, y, z );     // 4 5 6

// ES6
var { x: x, y: y, z: z } = bar();

console.log( x, y, z );     // 4 5 6

// we can even do:
var { x, y, y } = bar();

console.log( x, y, z );     // 4 5 6

// We are leaving of the `x: ` part, rather than the `: x` part.
// e.g. we could do:
var { x: bam, y: baz, z: bap } = bar();
console.log( bam, baz, bap );               // 4 5 6
console.log( x, y, z );                     // ReferenceError

// We essentially flip the `target: source` (or 'property-alias: value') pattern from normal object
// literals to one of ' source: target' for destructuring.

var aa = 10, bb = 20;

var o = { x: aa, y: bb };
var     { x: AA, y: BB } = o;   // get the source value of `x` from object o and assign it as the value of variable `AA`
                                // likewise for BB

console.log( AA, BB );          // 10 20

// Destructuring can also be used to assign already-declared variables:
var a, b, c, d, e, f;

[a,b,c] = foo();
( { x, y, z } = bar ());    // n.b. must be wrapped in () to avoid { being treated as block scoping

console.log( a, b, c );     // 1 2 3
console.log( x, y, z );     // 4 5 6

// a, b, c etc don't have to be be just variable identifiers;
var o = {};

[o.a, o.b, o.c] = foo();
( { x: o.x, y: o.y, z; o.z } );     // remembr - 'source: target'

console.log( o.a, o.b, o.c );       // 1 2 3
console.log( o.x, o.y, o.z );       // 4 5 6

// you can use computed property expressions:

var which = 'x', o = {};

( { [which]: o[which] } = bar() );

console.log( o.x );     // 4

// can reorder one array to another:
var a1 = [ 1, 2, 3], a2 = [];

[ a2[2], a2[0], a2[1] ] = a1;

console.log( a2 );      // [2,3,1]

// or swap two variables without a temporary variable:
var x = 10, y = 20;
[ y, x ] = [ x, y ];

console.log( x, y );   // 20 10

// Repeated Assingments
// We can use the object destructuring form to list a source property multiple times:

var { a: X, a: Y } = { a: 1 };

X;  // 1
Y;  // 1

var {
    a: {
        x: X,
        x: Y
    },
    a
} = {
     a: {
         x: 1
     }
};

X;  // 1
Y;  // 1
a;  // { x: 1 }

( {
     a: X,
     a : Y,
      a: [ Z ]
  } = {
      a: [ 1 ]
  }
);

X.push( 2 );
Y[0] = 10;

X;  // [10,2]
Y;  // [10,2]
Z;  // 1

// Assigning fewer values than are present is okay:
var [,b] = foo();
var { x, z } = bar();

console.log( b, x, z );     // 2 4 6

// assigning too many wil lfall back to undefined.
// the `...` gather operator works as expected:
var a = [ 2, 3, 4 ];
var [ b, ...c, ] = a;

console.log( b, c );        // 2 [3,4]

// Both forms can take a default value option for an assignment:

var [ a = 3, b = 6, c = 9, d = 12 ] = foo();
var { x = 5, y = 10, z = 15, w = 20 } = bar();

console.log( a, b, c, d );      // 1 2 3 12
console.log( x, y, z, w );      // 4 5 6 20

// Or;
var { x, y, z, w: WW = 20 } = bar();

console.log( x, y, z, WW );         // 4 5 6 20

// Nested arrays/ objects can be destructured:
var a1 = [ 1, [ 2, 3, 4 ], 5 ];
var o1 = { x: { y: { z: 6 } } };

var [ a, [ b, c, d ], e ] = a1;
var { x: { y: { z: w } } } = o1;

console.log( a, b, c, d, e );   // 1 2 3 4 5
console.log( w );               // 6

// Array/ object destructuring of parameters works too:

function fooo( [ x, y ] ) {
    console.log( x, y );
}

foo( [ 1, 2 ] );        // 1 2
foo( [ 1 ] );           // 1 undefined
foo( [] );              // undefined undefined

function foo( { x, y } ) {
    console.log( x, y );
}
foo( { y: 1, x: 2 } );      // 2 1
foo( { y: 42 } );           // undefined 42
foo( {} );                  // undefined undefined
