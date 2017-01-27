/* Chapter 3: Promises (part 1)
Notes and example code from ch3 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch3.md

--------------------------------------------------------------------------------

- We previsouly said 'please execute this callback when your done' and then crossed our fingers
 that the callback is invoked correctly (e.g. not 17 times).
- Promises allow us to accept something from the third party library that says 'I'm done now'.
    - We're then free to handle that how we like.

- In this chapter immediately means in terms of the job queue structure (getting straight back on the rollercoaster),
as opposed to a strict synchronous 'now'.

What is a Promise?

Future Value
- When you order a cheeseburger at McDonalds, your reciept represents your future-cheeseburger.
    - Like a promise of a cheeseburger.
When your number/ order is called, you exchange the receipt - the future value is ready.

Value Now and Later
    - In the snippet below, console.log() assumes both x and y are already set.*/
var x, y = 2;

console.log( x + y );       // NaN <-- because `x` isn't set yet

// We could use callbacks to say "add x and y, but only if they're both ready":
function add(getX,getY,cb){
    var x, y;
    getX( function(xVal){
        x = xVal;
        // both are ready?
        if (y != undefined) {
            cd( x + y );        // send along sum
        }
    } );

    getY( function(yVal){
        y = yVal;
        // both are ready?
        if (x != undefined) {
            cd( x + y );        // send along sum
        }
    } );

}
// `fetchX()` and `fetchY()` are sync or async functions
add( fetchX, fetchY, function(sum){
    console.log( sum );
} );
/*
- Clearly it's messy as hell with callbacks
- add(..) is temporally consistent - behaves the same both now (sync) and later (async)
- To do this we make both now (sync) and later (async) the same as later (async) - so all operations are async.

- Promises are an easily repeatable mechanism for encapsulating and composing future values.

Completion Event

- An individual promise behaves as  future value.
- We can also think of a Promise as a flow-control mechanism - a temporl this-then-that.
- Imagine a function `foo(..)` that completes some task now or later, we don't know/ care which.
- We only need to know when foo(..) finishes so that we can move on to the next task.
    - We'd like to be notified of foo's completion.

- With callbacks, this notification would be a callback function invoked by foo(..).

- With promises we listen for an event from foo(..) and when notified, proceed with the next task.

Ideally we could do something like this:
*/
foo(x) {
    // start doing something that might take a while...
}

foo( 42 );

on (foo 'completion'){
    // now we can do the next step!
}

on (foo 'error'){
    // oops, error!
}

// we've set up two event listeners and have, nice neat separation of concerns.
// Unfortunately JS doesn't do quite that much for us
function foo(x) {
    // start doing something that might take a while...

    // make a `listener` event notification capability to return
    return listener;
}

var evt = foo( 42 );

evt.on( 'completion', function(){
    // now we can do the next step!
} );

evt.on( 'failure', function(err){
    // oops, something went wrong in `foo(..)`
} );

/*
- Instead of passing callbacks to foo, it returns an event capability `evt` which receives the callbacks.
- Inverting the inversion - uninversion - we restore control to the calling code, where we want it to be in the first place.

- Multiple separate parts of the code can be given the event listening capability, and they can all
independently be notified when foo(..) completes, in order to perform subsequent steps:
*/
var evt = foo( 42 );

// let bar(..) listen to foo's completion
bar( evt );

// let baz(..) listen to foo's completion
baz( evt );

/* Promise Events

- the `evt` event listening capability above is an analogyfor a Promise.
- foo(..) would create and return a Promise instance, and that promise would then be passed to bar(..) and baz(..)
*/
function foo(x) {
    // start doing something that could take a while..

    // construct and return a promise
    return new Promise( function(resolve,reject){
        // eventually, call `resolve(..)` or `reject(..)`, which are resolution callbacks,
        // for fulfillment and rejection respectively, for the promise.
    } );
}

var p = foo( 42 );

bar( p );

baz( p );

function bar(fooPromise){
    // listen for `foo(..)` to complete
    fooPromise.then(
        function(){
            // `foo(..)` has now finished, so do `bar(..)`'s task'
        }
        function(){
            // oops, something went wrong in `foo(..)`
        }
    );
}

// ditto for `baz(..)`

// A different approach, where bar() and baz() are only called if foo() succedds:
function bar() {
    // `foo(..)` has definitely finished,
    // so do `bar(..)`'s task
}

function oopsBar() {
    // oops, something went wrong in foo(),
    // so `bar(..)` didn't run
}

// ditto for `baz()` and `oopsBaz()`

var p =  foo( 42 );

p.then( bar, oopsBar );

p.then( baz, oopsBaz );

/* Thenable Duck Typing

- It is important to know whether something is a Promise (it will be clear why this is the case later on).
- A thenable is any object/ function that has a `then(..)` method on it. e.g. a Promise.
- Duck typing - type checks that make assumptions about a value's type based on its shape (properties).
- We can use thenable duck typing to identify promises with the below code.
- One issue with this is any object/ function with (or prototype linked to an object with)
 a `then` function on it will be identified as a thenable.
    - For this reason, some libraries will say 'not compatible with promise-based coding'.
    - And you need to be careful to avoid giving objects 'then' methods.
*/
if (
    p !== null &&
    (
        typeof p === 'object' ||
        typeof p === 'function'
    ) &&
    typeof p.then === 'function'
) {
    // assume it's a thenable!
}
else {
    // not a thenable
}

/* Promise Trust
- Let's go through each trust issue we had with callback-only coding and see how promises avoid them.

Calling Too Early
- Also known as 'Zalgo' effects - where sometimes a task finishes synchronously and sometimes asynchronously,
which can lead to race conditions.
- Even an immediately fulfilled Promise cannot be observed synchronously.
    - when you call `then(..)` on a Promise, even if that promise was already fulfilled,
    `then(..)` will always be called asynchronously.

Calling Too Late
- When a Promise is resolved, all `then(..)` registered callbacks on it will be called
immediately at the next asynchronous opportunity.
    - Nothing that happens within one of those callbacks can affect/ delay the calling of other callbacks.

- In the below code, 'C' cannot interrupt and precede 'B', by virtue of how promises are designed to operate.

- However there are lots of quirks with regard to the ordering of callbacks chained off separate promises, so it
is best never to rely on the ordering of callbacks across different promises.
*/
p.then( function(){
    p.then( function(){
        console.log( 'C' );
    } );
    console.log( 'A' );
} );
p.then( function(){
    console.log( 'B' );
} );
// A B C

/* Never Calling the Callback
- We can use a `race` to ensure we are notified if a Promise is not resolved.
- Will look at later so no need to look at here.

Calling (the Callback) Too Few or Too Many  Times
- We want the callback to be called once.
- So too few would be zero, which is equivalent to the 'never' case just discussed.
- if a Promise tries to call resolve/ reject more than once/ tries to call both, only the first attempt
will be accepted.

Failing to Pass Along Any Parameters/Environment
- Promises can have only one resolution value (fulfillment/rejection).
- If you don't explicitly resolve with a value either way, the value is undefined.
- Whatever happens, the value will be passed to all registered callbacks.

Swallowing Any Errors/ Exceptions
- At simplest level - if you reject a Promise with a reason, that value is passed to the
rejection callback(s).

- Bigger point - if there is a JS exception error (e.g. ReferenceError) at any point in
the creation of a Promise, or in the observation of its resolution, that exception will
be caught, and it will force the Promise in question to become rejected. e.g.:
*/
var p = new Promise( function(resolve,reject){
    foo.bar();      // `foo` is not defined, so error!
    resolve( 42 );  // never gets here!
} );

p.then(
    function fulfilled(){
        // never gets here :(
    },
    function rejected(err){
        // `err` will be a `TypeError` exception object
        // from the `foo.bar()` line.
    }
);

// `resolve`
// `Promise.resolve(..)` will make non-Promise non0thenable values into Promises.

var p2 = Promise.resolve( 42 );
// is equivalent to:
var p1 = new Promise( function(resolve,reject){
    resolve( 42 );
} );

// if you pass a genuine promise you just get back the same promise:
var p1 = Promise.resolve( 42 );

var p2 = Promise.resolve( p1 );

p1 === p2;      // true

/* If you pass a non-Promise thenable to `Promise.resolve(..)` it will unpack it,
find the non-thenable value, and package it back up as a valid Promise.

CHAIN FLOW
Two props of Promises allow us to chain them together to create a sequence of async steps:
    1. Every time you call then(..) on a Promise, it creates and returns a new Promise,
    which we can chain with.
    2. Whatever value you return from the then(..) call's fulfillment callback (the first parameter)
    is automatically set as the fulfillment of the chained Promise.

- In the below snippet, the first `then(..)` is the first step in an async sequence, and the
second `then(..)` is the second step.
*/
var p = Promise.resolve( 21 );

p.then( function(v){
    console.log( v );       // 21

    // fulfill the chained promise with value `42`
    return v * 42;
} )
// here's the chained promise
.then( function(v){
    console.log( v );       // 42
} );

// If we return a new Promise instead of `v * 42` inside the first `.then`, it will be unwrapped
// and passed to the next `then(..)` as in the code above:
var p = Promise.resolve( 21 );

p.then( function(v){
    console.log( v );       // 21

    // fulfill the chained promise with value `42`
    return new Promise( function(resolve, reject){
        // fulfill with value `42`
        resolve( v * 42 );
    } );
} )
// here's the chained promise
.then( function(v){
    console.log( v );       // 42
} );

// even if we introduce async to that wrapping promise, it will work:
var p = Promise.resolve( 21 );

p.then( function(v){
    console.log( v );       // 21

    // fulfill the chained promise with value `42`
    return new Promise( function(resolve, reject){
        // introduce async!
        setTimeout( function(){
            // fulfill with value `42`
            resolve( v * 42 );
        }, 100 );
    } );
} )
// here's the chained promise
.then( function(v){
    console.log( v );       // 42
} );

// We can generalise thise with a `delay` function.
// N.B. the 'next Job' for a promise that is resolved 'immediately'

function delay(time) {
    return new Promise( function(resolve,reject){
        setTimeout( resolve, time );
    } );
}

delay( 100 )    // step 1
.then( function STEP2(){
    console.log( 'step 2 (after 100ms)' );
    return delay( 200 );
} )
.then( function STEP3(){
    console.log( 'step 3 (fter another 200ms)' );
} )
.then( function STEP4(){
    console.log( 'step 4 (next Job)' );
    return delay( 50 );
} )
.then( function STEP5(){
    console.log( 'step 5 (after another 50ms)' );
} )

// let's do something more useful - ajax:
// `ajax(..)` would typically be provided by some library
// assume we have an `ajax( {url}, [callback] )` utility function

// Promise-aware ajax
function request(url) {
    return new Promise( function(resolve,reject){
        // the `ajax(..)` callback should be our
        // promise's `resolve(..)` function
        ajax( url, resolve );
    } );
}

request( 'http://some.url.1/')
.then( function(response1){
    return request( 'http;//some.url.2/?v=' + response1 ):
} )
.then( function(response2){
    console.log( response2 );
} );

// errors/ exceptions are on a per promise basis:

// step 1:
request( 'http://some.url.1/')

// step 2:
.then( function(response1){
    foo.bar();      // undefined, error!

    // never gets here
    return request( 'http;//some.url.2/?v=' + response1 ):
} )

// step 3
.then(
    function fulfilled(response2){
        // never gets here
    },
    // rejection handler to catch the error
    function rejected(err){
        console.log( err );
        // `TypeError` from `foo.bar()` error
        return 42;
    }
)
.then( function(msg){
    console.log( msg );     // 42
} );
/*
- The rejection handler returns a value (42), which fulfills the promise for the next step
and allows the chain to continue in a fulfillment state.
- If the rejection handler returned a promise, it would have to be unwrapped, which could delay the next step.
- A thrown error in a fufillmint/ rejection handler causes the next (chained) promise to be rejected
immediately with that error/ exception.

- If you call then(..) on a promise and you only pass a fulfillment handler (i.e no rejection handler),
JS will assume a default rejection handler.
- This will simply throw the err, and this err will propagate down the chain until an explicit defined rejection
handler is encountered.

- If you do not pass in a fulfillment handler, a default one (which simply passes the value
on to the next Promise) is assumed.
*/
