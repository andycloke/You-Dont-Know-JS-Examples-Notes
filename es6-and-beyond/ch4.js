/* Chapter 4: Async Flow Control
Notes and example code from ch4 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch4.md

--------------------------------------------------------------------------------

Promises

- Think of Proises as event listeners, upon which you can register to listen for an event
that lets you know when a task hs completed.
- Promises can be chained together, to create a series of async completing steps.
- `all(..)` (a 'gate' in classic terms) and `race(..)` (a latch) can be used to provide an
approximation of async flow control.

- Alternatively think of Promises as future values. They are time-independent containers wrapped
around a value.
    - This container can be reasoned about in the same way whether the underlying value is final
    or not.
- Eventually the Promise will resolve, and either be fulfilled or rejected.
- There will be no further rejection/ fullfillment, so this final value it this immutable.
- Clearly Promises provide order, predictability and trustability when compared to callbacks-only
async.

Making and Using Promises
*/
var p = new Promise( function(resolve,reject){
    // ..
} );
/*
- If you call `reject(..)`, the promise is rejected, and any value passed to `reject(..)` is set as
the reason for rejection.
- If you call `resolve(..)` with no value, or any nonpromise value, the promise is fulfilled.
- If you call `resolve(..)` and pass another promise, this promise simply adopts the state - immediate
or eventual - of the passed Promise.

How to refactor a callback reliant ajax function:
*/
function ajax(url,cb) {
    // make request, eventually call `cb(..)`
}

// ..

ajax( 'http://some.url.1', function handler(err,contents){
    if (err) {
        // handle ajax error
    }
    else {
        // handle `contents` success
    }
} );

function ajax(url) {
    return new Promise( function pr(resolve,reject){
        // make request, eventually call
        // either `resolve(..)` or `reject(..)`
    } );
}
ajax( 'http://some.url.1' )
.then(
    function fulfilled(contents){
        // handle `contents` sucess
    },
    function rejected(reason){
        // handle ajax error reason
    }
);
/*
- `then` accepts one or two callback functions.
- The first of these is treated as the handler to call if the promise is fulfilled successfully.
- The second of these is treated as the handler to call if the promise is rejected, or if any error
/exception is caught during resolution.
- If either of the arguments is omittted/ not a valid function (typically you use `null` instead), a
default is used instead.
    - The default success handler passes the value along.
    - The default error handler propagates the error.

Thenables

- Thenables are promise-like objects that can generally can be used with the same promise mechanisms.
- Any object with a `then(..)` function on it is assumed to be a thenable.
- Unlike Promises, thenables are not created using the `Promise(..)` constructor.
- Thenables are less trustworthy than Promises.

Promise API

- `Promise.resolve(..)` creates a promise resolved to the value passed in.
- If passed a promise, it will resolve to the underlying resolution value of that
promise.
- `p1` is equiavlent to `p2`:
*/
var p1 = Promise.resolve( 42 );

var p2 = new Promise( function pr(resolve){
    resolve( 42 );
} );

// `Promise.reject(..)` creates an immediately rejected promise:
// If passed a Promise/ thenable, it will return that Promise/ thenable, rather than
// the underlying value.
var p1 = Promise.reject( 'Oops ');

var p2 = new Promise( function pr(resolve,reject){
    reject( 'Oops' );
} );
/*
- `Promise.all([ .. ])` accepts an array of one or more values (immediate values, promises, thenables).
- It returns a promise back that will be fulfilled if all the values fulfill, or reject immediately
once the first of any of them rejects.

- `Promise.race([ .. ])` waits for the first fulfillment/ rejection.

Generators + Promises
- We could use long chains of promises in order to represent the async flow control of our program.
- Alternatively we can use generators.
- This allows us to use synchronous-looking syntax event though the underlying mechanisms are async.
*/
