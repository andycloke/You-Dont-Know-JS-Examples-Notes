/* Chapter 1: 'this' or That?
Notes and example code from ch1 of the 'this' & Object Prototypes book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch1.md

--------------------------------------------------------------------------------

WHY 'this'?
- 'this' provides a more elegant solution than explicitly passing in a context object:
*/
function identify(){
    return this.name.toUpperCase();
}
var me = {
    name: 'Kyle'
};
identify.call( me );    // KYLE

// as opposed to:

function indentify(context){
    return context.name.toUpperCase();
}
identify( me );       // KYLE

/* CONFUSIONS

Itself
- First common misconception is that 'this' refers to the function itself
- Remember that all functions are objects.
- This might be useful for, e.g., for recursion.
- Or we might try, incorrectly, to use 'this' to store state in order to , e.g., count the numebr of times
a function is called:
*/
function foo(num) {
    console.log( 'foo: ' + num );

    // keep track of number of times called
    this.count++;
}
foo.count = 0;
var i;

for (i = 0; i < 10; i++){
    if (i > 5) {
        foo ( i );
    }
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9
// foo: 10

// how many times was 'foo' called?
console.log( foo.count );           // 0 - WTF?
/*
- We are actually incrementing a global count variable, which currently has value of NaN.
- To reference a function object from inside itself, 'this' is usually insufficient.
- You usually need a reference to the function object via a lexical identifier (variable)
that points to it:
*/
function foo(){
    foo.count = 4;      // 'foo' refers to itself
}
// doesn't work for anonymous functions:
setTimeout( function(){
    // cannot refer to itself
}, 10 );
/*
N.B. - could use the depreciated 'arguments.callee' to refer to an anonymous function from within
itself, but this is bad practice and you should name the function instead.
*/

/* Its Scope
- The next most common misconceptio is that 'this' refers to a function's scope.
- 'this' does not refer to a function's scope.
- Internally scope is similar to an object with propertie for each of the avaiable identifiers,
but this is within the Engine's implementation, and not avaiable in JS code.
*/

function foo(){
    var a = 2;
    this.bar();
}

function bar(){
    console.log( this.a );
}

foo();      // undefined

/*
- Here we have attempted to bridge the lexical scopes of foo() and bar() with 'this'.
- This simply isn't possible.

WHAT IS 'this'?

- A run-time binding (as opposed to an author-time binding), which depends on the eay a function
is invoked/ called.
- What it references is determined entirely by the call-site where the function is called.
*/
