/* Chapter 3: Promises (part 2)
Notes and example code from ch3 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch3.md

--------------------------------------------------------------------------------

- Terminology: Resolve, Fulfill and Reject. */
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
is no need for the duality of `resolve` and we can call it `onFulfilled()` & `onRejected()` (used in ES6 spec),
 or we could opt for `fulfilled()` and `rejected()`.

Error Handling

- `try...catch` is synchronous only so is no use to us in this form:
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
            cb( err );
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

// there are issues however. In this snippet, the error handler is for the `p` Promise, which has
// been fulfilled. The only way to be notified of the error would be in the error handler of the
// next `then(..)` in the chain, but we don't provide another `then(..)`, so the error never surfaces.

var p = Promise.resolve( 42 );

p.then(
    function fulfilled(msg){
        // numbers don't have string functions, so this will throw an error
        console.log( msg.toLowerCase() );
    },
    function rejected(err){
        // never gets here
    }
);
/*
- Various approaches to error handling
- Browsers provide some capabilities - when an Promise object gets thrown away, and if they have a rejection in them
when they are thrown away, the browser will report an error.
- Libraries can add a `.done(..)` to the end of our promise chains which will ctch errors, or display an error to the
console if there is an error in `done(..)` itself. - but this is not part of the spec.
- Author (KS) suggests adding automatic default error handling to Promises, which you have to opt-out if you don't want.

PROMISE PATTERNS

`Promise.all([..])`

- In an async sequence (Promise chain), only one async is occuring at any one time.

- What if we want two or more to occur concurrently ('in parallel')?
- In classic programming terminology, we use a 'gate' - which waits on two or more tasks completing before
continuing.
- In the Promise API we use `all([ .. ])`, which achieves the same thing.

- Imagine we want to wait for two ajax requests to complete before making a third:
*/

//`request(..)` is a Promise-aware Ajax utility, like we defined earlier in this chapter

var p1 = request( 'http://some.url.1/' );
var p2 = request( 'http://some.url.2/' );

Promise.all( [p1,p2] )
.then( function(msgs){
    // both `p1` and `p2` fulfill and pass in their messages here
    return request(
        'http://some.url.3./?v=' + msgs.join(',')
    );
} )
.then( function(msg){
    console.log( msg );
} );

/*
- `Promise.all([..])` expects a single argument, an array, consisting generally of Promise instances.
    - Can also accept thenables/ immediate values, which it will call `Promise.resolve(..)` on in order
    to turn into a Promise.
- It will return an array of all the fullfillment messages of the passed in Promises, in the same order
as the the input (paramter) Promises.

- Remember to always attach an error handler to Promises, even the one that comes back from `Promise.all([..])`.

`Promise.race([..])`

- `Promise.race([..])` reponds to the first Promise to complete.
- In traditional terminology this would be called a latch.
- Don't confuse this with 'race conditions', which usually refers to bugs in a program.
- `Promise.race([..])` accepts an array of Promises (or thenables/ immediate values) like `Promise.all([..])`
- be careful - if passed an empty array, `Promise.race([..])` will never resolve.
*/
var p1 = request( 'http://some.url.1/' );
var p2 = request( 'http://some.url.2/' );

Promise.race( [p1,p2] )
.then( function(msg){
    // either `p1` and `p2` will win the race
    return request(
        'http://some.url.3./?v=' + msg
    );
} )
.then( function(msg){
    console.log( msg );
} );

/* Timeout Race
- we can use `Promise.race([..])` in the folowing way to get an error if `foo()` doesn't fire within
3 seconds (or if `foo()` is rejected).

`foo()` is a Promise-aware function
`timeoutPromise(..)` returns a Promise that rejects after a specified delay.
*/

// setup a timeout for `foo()`
Promise.race( [
        foo(),                      // attempt `foo()`
        timeoutPromise( 3000 )      // give it 3 seconds
] )
.then(
    function(){
        // `foo(..)` fulfilled in time
    },
    function(err){
        // either `foo()` rejected, or it just didn't finish
        // in time, so inspect `err` to know which
    }
);

/* Promise API Recap

`new Promise(..)` Constructor

- The `Promise(..)` constructor must be used with the `new` keyword.
- It must be provided a function callback, which is synchronously called.
    - This function is passed two function callbacks, which act as resolution
    capabilities for the promise.
    - These are usually labelled `resolve` and `reject`.
    - `resolve(..)` can either fulfill or reject the promise.
            - If it is passed a non-Promise, non-thenable value, the promise if fulfilled with that value.
            - If it is passed a Promise/ thenable value, then that value is unwrapped recursively, and
            whatever its final resolution/ state is will be adopted by the promise.
    - `reject(..)` simply rejects the value.            */
var p = new Promise( function(resolve,reject){
    // `resolve(..)` to resolve/ fulfill the promise
    // `reject(..)` to reject the promise
} );

//`Promise.resolve(..)` and `Promise.reject(..)`

// - `Promise.reject(..)` provides a shortcut for creating an already-rejected Promise.
// p1 is equivalent to p2:
var p1 = new Promise( function(resolve,reject){
    reject( 'Oops' );
} );

var p2 = Promise.reject( 'Oops' );

// `Promise.resolve(..)` usually creates an already-fulfilled Promise in the same way
// as `Promise.reject(..)` above, but if passed a thenable value it will unwrap it to the final
// value, and wraps that as a Promise:
var fulfilledTh = {
    then: function(cb) { cb( 42 ); }
};

var rejectedTh = {
    then: function(cb, errCb) {
        errCb( 'Oops' );
    }
};

var p1 = Promise.resolve( fulfilledTh );
var p2 = Promise.resolve( rejectedTh );

// `p1` will be a fulfilled promise
// `p2` will be a rejected promise

/* `then(..)` & `catch(..)`

- Every Promise instance has the `then(..)` and `catch(..)` methods, which allow registering
of fulfillment and rejection handlers for the Promise
- `then(..)` takes two parameters:
    1. the fullfillment callback
    2. the rejection callback
- `catch(..)` takes one paremeter:
    1. the rejection callback
- `catch(..)` is therefore equivalent to `then( null, ..)`
- both `then(..)` and `catch(..)` create and return a new Promise, which can be to used to
express Promise chain flow control

`Promise.all([..])` & `Promise.race([..])`

- Both of these create and return a Promise which is dependent on the input array of Promises
passed into them as a parameter.

- For `Promise.all([..])` all the Promises you pass in must fulfill for the Promise to fulfill.
- If any Promise is rejected, the return Promise is rejected, too.
- When fulfilled, the return Promise is an array of all the Promises' return values.
- In classic terminology this is called a gate.

- For `Promise.race([..])` only the first Promise to resolve is handled and its resolution value is
the resolution value of the return Promise from `Promise.race([..])`.
- In classic terminology this is called a latch.
*/
var p1 = Promise.resolve( 42 );
var p2 = Promise.resolve( 'Hello World' );
var p3 = Promise.reject( 'Oops' );

Promise.race( [p1,p2,p3] )
.then( function(msg) {
    console.log( msg );     // 42
} );

Promise.all( [p1,p2,p3] )
.catch( function(err){
    console.log( err );     // Oops
} );

Promise.all( [p1,p2] )
.then( function(msgs) {
    console.log( msgs );    // [42,'Hello World']
} );

/* Promise Limitations

Sequence Error Handling

- Errors are propagated until they hit an error handler, rather than brought  to our attention immediately.

 - We can rely on this and simply use an error handler at the end of the chain, but we then must rely
 on no steps of the chain handling errors (which might be hard to ensure if this is hidden/ abstracted away).

 Single Value

 - Promise can only return a single value, which may be somewhat limiting.
 - Typical solution is to use a single object wrapper.
    - Occasionally it will be awkward to have to wrap and unwrap values every time you want to return
    multiple values.

- Sometimes splitting values offers a solution:
*/
function getY(x) {
    return new Promise( function(resolve,reject){
        setTimeout( function(){
            resolve( (3 * x) - 1 );
        }, 100 );
    } );
}

function foo(bar,baz) {
    var a = bar * baz;

    return getY( x )
    .then( function(y) {
        // wrap both values into a container
        return [x,y];
    } );
}

foo( 10,20 )
.then( function(msgs) {
    var x = msgs[0];
    var y = msgs[1];

    console.log( x, y );        // 200 599
} );

// using `Promise.all([..])` more closely alligns with Promise theory
function foo(bar,baz) {
    var x = bar * baz;

    // return both promises
    return [
        Promise.resolve( x ),
        getY( x )
    ];
}

Promise.all(
    foo( 10, 20 )
)
.then( function(msgs) {
    var x = msgs[0];
    var y = msgs[1];

    console.log( x, y );
} );

// using ES6 array destructuring we can rewrite the Promise chain as:
Promise.all(
    foo( 10, 20 )
)
.then( function([x,y]) {
    console.log( x, y );
} );

/* Single Resolution
- Promises can only a resolved once (fulfillment or resolution).
- Fine for many async uses, but not ideal for streams of data or events (e.g. firing off lots
of button clicks): */

// `click(..)` binds the 'click' event to a DOM element
// `request(..)` is the previously defined Promise-aware Ajax

var p = new Promise( function(resolve,reject) {
    click( '#mybtn', resolve );
} );

p.then( function(evt) {
    var btnID = evt.currentTarget.id;
    return request( 'http://sone.url.1/?id=' + btnID );
})
p.then( function(text) {
    console.log( text );
} );

/*
- This only works if your the button only needs to be clicked once. If the button is clicked again
the promise would already have been resolved, so the second `resolve(..)` call would be ignored.

 Inertia
 - If you already have lots of callback based code, it is more difficult/ less attractive to start implementing Promises.

Promises Uncancellable
- Once you create a Promise and register a fulfillment/ rejection handler, there's nothing you can
 do to make that task moot.
 - Some libraries do provide this functionality, but this is a bad idea, since it means one consumer of
 a Promise can mess things up for another consumer relying on that Promise - leads us back down the callback
 rabbit hole

Performance
- Promises are also slower than callbacks (think of all the trusts issues they have to avoid/ solve).
    - We're not sure how much slower.
- A bigger issue - you can't pick and choose which issues you want to solve - they do them all, all the time.
