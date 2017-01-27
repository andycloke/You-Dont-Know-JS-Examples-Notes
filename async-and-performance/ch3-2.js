/* Chapter 3: Promises (part 2)
Notes and example code from ch3 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch3.md

--------------------------------------------------------------------------------

- Terminology: Resolve, Fulfill and reject. */
var p = new Promise( function(resolve,reject){
    // resolve() for fulfillment
    // reject() for rejection
} );

p.then(
    function onFulfilled(response){
    //...
    },
    function onRejected(err){
        console.log( err );
    }
);
/*
- We use `resolve` rather than `fulfill` for the first callback in Promise construction
because it uses `Promise.resolve(..)` to create a Promise that's resolved to the value given to it.
    - If we were to pass in thenable that is unwrapped to a rejected state, the Promise returned
    from `Promise.resolve(..)` would be that same rejected state - i.e. it would not be fulfilled.
    - For this reason `resolve` makes more sense than `fulfill`

- In`then(..)` we know that the first parameter will unambiguously be the fulfillment case, so there
is no need for the duality of `resolve` and we can call it `onFulfilled` & `onRejected` (used in ES6 spec),
 or we could opt for `fulfilled` and `rejected`.

Error Handling

- `try...catch` is synchronous only so no use to us in this form:
*/
function foo(){
    setTimeout( function(){
        baz.bar();
    }, 100 );
}

try {
    foo();
        // later throws global error from `baz.bar()`
}
catch (err) {
    // never gets here
}

// callbacks use `try...catch` in an 'error-first' approach:
function foo(cb) {
    setTimeout( function(){
        try {
            var x = bar.bar();
            cb( null, x );      // success!
        }
        catch (err) {
            cd( err );
        }
    }, 100 );
}

foo( function(err,val){
    if (err) {
        console.error( err );   // bummer :/
    }
    else {
        console.log( val );
    }
} );

/*
- This is async capable, but very messy - quickly leads to callback hell.
- It also relies on `baz.bar()` being synchronous.

- Promises use 'split-callback' error handling.
    - One callback for fulfillment and one for rejection.
*/
var p = Promise.reject( 'Oops' );

p.then(
    function fulfilled(){
        // never gets here
    },
    function rejected(err){
        console.log( err );     // 'Oops'
    }
);

// there are issues however. In this snippet, the error handler is for the p promise, which has
// been fulfilled. The only way to be notified of the error would be in the error handler of the
// next `then(..)` in the chain, but we don't provide another `then(..)`, so the error never surfaces.

var p = Promise.resolve( 42 );

p.then(
    function fulfilled(msg){
        // numbers don't have string functions, so will throw an error
        console.log( msg.toLowerCase() );
    },
    function rejected(err){
        // never gets here
    }
);

/* 
