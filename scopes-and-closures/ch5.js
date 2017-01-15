/* Chapter 5: Scope Closure
Notes and example code from ch5 of the Scopes and Closures book in the YDKJS Series
https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch5.md

--------------------------------------------------------------------------------

Closure is when a function is able to remember and access its lexical scope even when that
function is executing outside of its lexical scope.
*/
function foo(){
    var a = 2;

    function bar(){
        console.log( a );
    }

    return bar;
}

var baz = foo();

baz();              // 2 + closure!
/*
- bar has lexical scope access to the inner scope of foo().
- we assign baz to the inner bar() function using the return value of foo().
- when we call baz(), bar() is now being executed outside of its declared lexical scope.
- we would expect the Engine's garbage collection to have got rid of the the access to the inner scope
of foo(), but this is not the case.
- bar() still has a reference to that scope, this reference is called closure.
*/

function foo(){
    var a = 2;

    function baz(){
        console.log( a );
    }

    bar( baz );
}

function bar(fn){
    fn();           // closure!!
}
/*
- When the inner function baz is passed to bar (in the final line of foo()), its closure over the inner scope
of foo is also passed along with it, which is now we access 'a'.
- The functions can be passed around indirectly too:
*/

var fn;

function foo(){
    var a = 2;

    function baz(){
        console.log( a );
    }

    fn = baz;     // baz assigned to global variable
}

function bar(){
    fn();               // closure!
}

foo();
bar();          // 2

/* LOOPS & CLOSURE
- Let's try and print the numbers 1 through 5 with a one second delay between each.
*/
for (var i = 1; i <= 5; i++){
    setTimeout( function timer(){
        console.log( i );
    }, i * 1000 );
}
/*
- Each execution of console.log occurs after the loop is terminated.
- When the loop is terminated, i will be 6 (i <= 5).
- Even though they are definied separately in the loop, all 5 of the functions are closed over the
same shared globl scope, which has only one 'i' in it.
- So it prints '6' five times.
- We need a new closured scope for each iteration of the loop.
- Try:
*/
for (var i = 1; i <= 5; i++){
    (function(){
        setTimeout( function timer(){
            console.log( i );
        }, i * 1000 );
    })();
}
/*
- Nope. Prints '6' five times.
- Each timeout function closes over an empty scope created by each IIFE.
- It needs its own variable in the IIFE's scope to close over. i.e. a copy of 'i':
*/
for (var i = 1; i <= 5; i++){
    (function(){
        var j = i;
        setTimeout( function timer(){
            console.log(j);
        }, j * 1000);
    })();
}
/*
- Works.
- The use of an IIFE in each iteration creates a new scope for each iteration.
- Each timeout function  callback closes over the new scope, which includes the variable j, which has
an approriate value.

Block Scoping Revisited
- Rather than use an IIFE, we can use the 'let' keyword to turn a block into a scope that we can close
over:
*/
for (var i = 1; i <= 5; i++){
    let j = i;
    setTimeout( function timer(){
        console.log( j );
    }, j * 1000 );
}
/*
- we can even use a special feature of the let keyword.
- the variable is declared once for the loop, then is declared again for each iteration.
*/
for (let i = 1; i <= 5; i++){
    setTimeout( function timer(){
        console.log( i );
    }, i * 1000 );
}
/* MODULES
- Modules leverage the power of closure.
*/
function CoolModule(){
    var something = 'cool';
    var another = [1, 2, 3];

    function doSomething(){
        console.log( something );
    }

    function doAnother(){
        console.log( another.join( ' ! '));
    }
    return {
        doSomething: doSomething,
        doAnother: doAnother
    };
}

var foo = CoolModule();

foo.doSomething();        // cool
foo.doAnother();          // 1 ! 2 ! 3

/*
- CoolModule is just a function, but it has to be invoked for there to be a module instance created.
- When it is invoked, the creation of the inner scope occurs.
- CoolModule returns an object, giving foo access to the inner functions. Essentially an API.
- The inner functions doSomething and doAnother have scope over the private inner variables.

- Alternatively we can use a IIFE to immediately invoke the module function and assign its return value
to foo:
*/

var foo = (function CoolModule(){
    var something = 'cool';
    var another = [1, 2, 3];

    function doSomething(){
        console.log( something );
    }

    function doAnother(){
        console.log( another.join( ' ! '));
    }
    return {
        doSomething: doSomething,
        doAnother: doAnother
    };
})();

foo.doSomething();      // cool
foo.doAnother();        // 1 ! 2 ! 3

// Modules can take parameters:

function CoolModule(id){
    function identify(){
        console.log(id);
    }

    return {
        identity: identity
    };
}
var foo1 = CoolModule( ' foo 1');
var foo2 = CoolModule( ' foo 2');

foo1.identity();   // 'foo 1'
foo2.identity();   // 'foo 2'

// naming the object you are returning allows internal functions to manipulate it:
var foo = (function CoolModule(id){
    function change(){
        // modifying the public API
        publicAPI.idetify = identify2;
    }

    function identify(){
        console.log( id );
    }

    function identify2(){
        console.log( id.toUpperCase() );
    }

    var publicAPI = {
        change: change,
        identify: identify1
    };

    return publicAPI;
})( 'foo module');
/*
Modules require:
1. an outer wrapping function being invoked in order to create the enclosing scope.
2. the return value of the wrapping function must include reference to at least one inner function
that then has closure over the private inner scope of the wrapper
*/
