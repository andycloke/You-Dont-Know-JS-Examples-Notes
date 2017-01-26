/* Chapter 2: Callbacks
Notes and example code from ch2 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch2.md

--------------------------------------------------------------------------------
- Previously we imagined the inside of a function happening in a predictable order.
- However when we consider async funciton invocations, events can happen in a variety of orders.
- In these cases the function serves as the target for the event loop to 'call back into' the program.
    - The function is a 'callback function'.*/

// Continuations

// A
setTimeout( function(){
    // C
}, 1000 );
// B

/*
- Standard way of explaining would be 'Do A, set timer for 1000 milliseconds, then do B, then do C when timer complete'
- This is deficient as an explanation.

Sequential Brain

- Our brains can't do two high level tasks at once.
- The best we can do is rapidly switch, giving the illusion of that we are doing them both simultaneously.
- Very similar to JS's async evented concurrency.
- Imagine you are typing - every letter is like an event on the event queue - lots of opportunity to, e,g, talk
to someone on the phone.

Doing Versus Planning
- When we plan we generally make a sequential list (i.e. a todo list with 'do this', 'then do that' etc).
- This is like when we write synchronous line-by-line code.

- Then when we get to actually doing the things on our plan we use fast context switching, which gives the impression of
multitasking.
- However if we wrote a plan everything we do during the doing stages, it would sound a bit ridiculous.
    - This is why async code is hard to write.

Nested/ Chained Callbacks
- Nested callbacks are often very difficult to read - you have to jump up and down the code to follow the sequence
of events.
- We must hardcode each possible outcome / path - this makes nested callbacks very brittle.*/

// Trust Issues

// A
ajax( function(){
    // C
}, 1000 );
// B

/* - ajax, some third party function for ajax requests, is handled by some third party library.
- We are losing control of one part of out program's execution - 'inversion of control'.
- There's an unspoken trust/expectation the library will be maintained.
- When you have a utility you don't have 100% faith in, you have to write a lot of code to handle every possible
thing that could go wrong.
- You also need to do some checks for your own callback functions.

Trying to Save Callbacks
- There are many strategies for attempting to reduce the issues above.
- E.g. provide both a success and a failure callback:
*/
function success(data) {
    console.log( data );
}
function failure(err) {
    console.log( err );
}
ajax( 'http://some.url.1', sucess, failure );
// however failure callback often optional, in which case errors are silently swallowed - bad.
// error-first stye (Node style);
function response(err,data{
    // error?
    if (err) {
        console.log( err );
    }
    //otherwise, assume success
    else {
        console.log( data );
    }
}
ajax( 'http://some.url.1', response );

/* (Trust) Issues not handled by this:
- Nothing to handle multiple callback invokations.
- Nothing to handle getting both and error and success.
- Although pretty standard, boring to have to type this out every time you hve a callback.

- What if callback never called? use something like:            */
function timeoutify(fn,delay) {
    var intv = setTimeout( function(){
        intv = null;
        fn( new Error( 'Timeout!' ) );
    } , delay );

    return function(){
        // timeout hasn't happened yet?
        if (intv){
            clearTimeout( intv );
            fn.apply( this, arguments );
        }
    };
}

function foo(err,data{
    // error?
    if (err) {
        console.log( err );
    }
    //otherwise, assume success
    else {
        console.log( data );
    }
}
ajax( 'http://some.url.1', timeoutify( foo, 500 ) );
/*
- Another trust issue when the utlity might either call the callback now (sync) OR later (async), but
we're not sure which.
- Sometime people say 'Don't release Zalgo' to mean 'always call callbacks asynchronously' (even if it means
putting the call on the event loop immediately). E.G.:
*/
function result(data) {
    console.log( a );
}

var a = 0;

ajax('..pre-cached-url..', result );
a++;
/*
- Whether a will end up being 1 or 0 dependes on whether the ajax call executes synchronously or asynchronously.
- We can make all callbacks with more boilerplate, but do we really want to having to add all this extra code?
- Fortunately ES6 provides some solutions to these issues!
*/
