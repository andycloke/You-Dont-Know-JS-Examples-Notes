/* Chapter 4: Hoisting
Notes and example code from ch4 of the Scopes and Closures book in the YDKJS Series
https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch4.md

--------------------------------------------------------------------------------

*/
a = 2;
var a;
console.log( a );    // 2            // but you might expect 'undefined'

console.log( a );
var a = 2;           // undefined     // but you might expect 'ReferenceError' or '2'.

/*
Chicken Or The Egg + Compilation
- So which comes first? The declaration (egg) or the assignment (chicken)?
- Remembering the discussion of compilers in Ch1, we know that the Engine actually compiles all
the code before it runs it.
- Part of this compilation was finding all declarations and associating them with the relevant scope.
- So all declarations, both variables and functions, are processed before any execution.
- var 'a = 2;' is broken down into 'var a;', handled by the compiler and 'a = 2;', left in place until
execution.
- So the egg (declaration) comes before the chicken (assignment).
Returning to the two examples:
*/

// Compilation:
var a;
// Execution:
a = 2;
console.log(a);

// Compilation:
var a;
// Execution:
console.log(a);
a = 2;

/*
- So declations are 'hoisted' to the top of the code for compilation, whilst assignments stay in place.
- If assignments/ other logic were hoisted, we'd almost certainly get lots of errors
*/

foo();

function foo(){
    console.log( a );  // undefined
    var a = 2;
}

/*
- The declaration of the function foo is hoisted, with the implied value of it as a function.
- This means that the call can execute on the first line.
- Hoisting is per-scope: the declaration (but not the assignment) of a will be hoisted to the top of foo.
- Function declarations are hoisted, but function expressions are not:
*/

foo();    // TypeError           // we might expect ReferenceError
bar();    // ReferenceError      // not available in enclosing scope.
var foo = function bar(){
    // ...
};

/*
- The variable identifier foo is hoisted and attached to the global scope, do doesn't fail as a ReferenceError.
- But foo has an undefined value, so fails as a TypeError.
- N.B. - if foo was a function declaration, rather than a function expression, it would not fail. (see above)
- Can interpret the snippet with hoisting more clearly as:
*/
var foo;
foo();       // TypeError
bar();       // ReferenceError
foo = function(){
    var bar = ...self...
    // ....
}

/* FUNCTIONS FIRST
- Functions declarions are hoisted before variable declations */

foo();   // 1

var foo;

function foo(){
    console.log( 1 );
}

foo = function(){
    console.log( 2 );
};

// interpreted by the Engine as:

function foo(){
    console.log( 1 );
}

foo();   // 1

foo = function(){
    console.log( 2 );
}

/*
- so the 'var foo' was a duplicate and was ignored because function declaration come first

- duplicate 'var's are ignored., but duplicate function declarations override previous one:
*/

foo();    // 3

function foo(){
    console.log( 1 );
}

var foo =  function(){
    console.log( 2 );
}

function foo(){
    console.log( 3 );
}
