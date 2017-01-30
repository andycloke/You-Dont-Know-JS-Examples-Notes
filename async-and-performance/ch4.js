/* Chapter 4: Generators
Notes and example code from ch4 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch4.md

--------------------------------------------------------------------------------

Breaking Run-to-Completion
- In ch1, we explained the expectation and actuality that once a function starts executing, it runs until
it completes, and no other code can interrupt and run in between.
- ES6 generators break this assumption.
*/
var x = 1;

function foo() {
    x++;
    bar();
    console.log( 'x: ', x);
}

function bar(){
    x++;
}

foo();      // x: 3

// we know that `bar()` runs in between `x++` and `console.log(..)`.
// If `bar()` wasn't in `foo()`, `x`'s final value would be 2
// What if we could remove `bar()`, but have the final value of x be 3?

var x = 1;

function *foo() {       .
    x++;
    yield;  // pause!
    console.log( 'x: ', x );
}

function bar() {
    x++;
}

// *foo is a generator function. Note these two are both syntically equivalent:
function* foo() { .. }
function*foo() { .. }

// this is how we use a generator:

// construct iterator `it` to control the generator. n.b - this does not execute `*foo()`
var it = foo();

// start `foo()` here!
it.next();  // this starts the *foo() generator, and runs all `*foo()'s code until it hits a `yield`
x;          // 2
bar();      // `bar()` executes and increments x's value
x;          // 3
it.next();  // x: 3     // resumes the `*foo()` generator from where it was pused, and runs the `console.log(..)` statement

// Input and Output
// Since generator functions are still funcstions, they still accept arguments and return values.

function *foo(x,y) {
    return x * y;
}

var it = foo( 6, 7 );
// n.b - again that `*foo(..)` hasn't actually run at ths point. we just create an iterator object assigned to `it`

var res = it.next();
// `it.next()` says advance from the current location and stop at the next `yield` or (as in this case) the end of the function
// the result of the `next(..)` call is an object with a value property on it, holding the return value (if there is one)

res.value;      // 42
// n.b. that its `res.value` rather than just `res`

// Iteration Messaging
// we can do very powerful input/ ouput things with `yield` and `next(..)`:
function *foo(x) {
    var y = x * (yield);
    return y;
}

var it = foo( 6 );  // create iterator object

// start `foo(..)`
it.next();          // will start to execute `var y = x`, but pauses at `yield`

var res = it.next( 7 );     // the `(yield)` in foo expects a value to be passed in in this `.next(..)`

res.value;      // 42

// we need two `next` statements for one `yield`, is there a mismatch?
// Consider that `yield`s can also send out messages (values) in reponse to next calls:

function *foo(x) {
    var y = x * (yield 'Hello');        // <-- yield a value!
    return y;
}

var it = foo( 6 );

var res = it.next();    // first `next()`, don't pass anything
res.value;              // 'Hello'

res = it.next( 7 );     // pass `7` to waiting `yield`
res.value;              // 42

/*
- `yield` and `next(..)`form a two way message passing (input/ output) system.
- our first `.next` is paired with the first (and only) `yield`.
- our second `.next` is paired with the return statment.
    - even if we didn't provide one, it would be paired with the default `return undefined`.

Multiple Iterators
- each time you construct an iterator, you are implicitly creating an instance of the
generator in which that iterator will control, rather than the declared generator
function itself.
    - therefore two iterators for the same generator function will not collide!
*/
function *foo() {
    var x = yield 2;
    z++;
    var y = yield( x * z );
    console.log( x, y , z );
}

var z = 1;

var it1 = foo();
var it2 = foo();

var val1 = it1.next().value;    // 2 <-- `yield 2`
var val2 = it2.next().value;    // 2 <-- `yield 2`

val1 = it1.next( val2 * 10 ).value;     // 40  <-- x: 20  z: 2
val2 = it2.next( val1 * 5 ).value;      // 600 <-- x: 200 z: 3

it1.next( val2 / 2 );           // y: 300
// 20 300 3

it2.next( val1 / 4 );           // y: 10
// 200 10 3

/* Interleaving

- In ch1 we said that when two functions both operate on the same variable there
are two possible final values for that variables.
    - Which value we end up with is dependent on which function is called first.

- With generators interleaving is possible.
    - i.e. different iterator `.next` calls will result in different final values
    of `a` and `b`.

Generator-ing Values

Producers and Iterators
- imagine you need to produce a series of values where each value has a definable
relationship to the previous value.
- we'll need a stateful produce that remembers the last value it gave out.
- we can do this using a function closure:
*/
var gimmeSomething = (function(){
    var nextVal;

    return function(){
        if (nextVal === undefined) {
            nextVal = 1;
        }
        else {
            nextVal = ( 3 * nextVal ) + 6;
        }

        return nextVal;
    };
})();

gimmeSomething();       // 1
gimmeSomething();       // 9
gimmeSomething();       // 33
gimmeSomething();       // 105

// This is a very common design pattern and is often achieved using the iterator interface:
var something = (function(){
    var nextVal;

    return {
        // needed for `for..or` loops
        [Symbol.iterator]: function(){ return this; },

        // standard iterator interface method
        next: function(){
            if (nextVal === undefined) {
                nextVal = 1;
            }
            else {
                nextVal = ( 3 * nextVal ) + 6;
            }

            return { done: false, value:nextVal };
        }
    };
})();

something.next().value;     // 1
something.next().value;     // 9
something.next().value;     // 33
something.next().value;     // 105

// can use a (ES6)  `for..of` loop with iterators such as this:
for (var v of something) {
    console.log( v );

    // don't let the loop run forever!
    if (v > 500) {
        break;
    }
}
// 1 9 33 105 321 969

/*
- we needed the break conditition since our something iterator (`next` method) always returns `done: false`
- the `for..of` loop automatically returns `next()` for each iteration.

Iterables
- The `something` object above is an iterator, since it has the `next()` method on its interface.
- An iterable is an object that contains an iterator that can iterate over its values.

- As of ES6 you retrieve an iterator from an iterable by making the a method on the iterable with
the property name Symbol.iterator which returns a fresh new iterator each time it is called.

Here `a` is an iterable:   */
var a - [1,3,5,7,9];

var it = a[Symbol.iterator]();

it.next().value;    // 1
it.next().value;    // 3
it.next().value;    // 5

// we can now explain this code in the above example:

// needed for `for..or` loops
[Symbol.iterator]: function(){ return this; },

/* basically this means when `something` is passed to a `for..of` loop and it looks for
the `Symbol.iterator` function, which always returns an iterable, the iterable will be
something (`this`).
- `something` is therefore both an iterator and an iterable.

Generator Iterator
- Generators can be treated as a producer of values, that extract one at a time through an
iterator interface's `next()` calls.
- We can implement the infinite number series producer from above like so:
*/
function *something() {
    var nextVal;

    while (true) {
        if (nextVal === undefined) {
            nextVal = 1;
        }
        else {
            nextVal = (3 * nextVal) + 6;
        }

        yield nextVal;
    }
}

for (var v of something()) {
    console.log( v );

    // don't let the loop run forever
    if (v > 500) {
        break;
    }
}
// 19 33 105 321 969

/* Stopping the Generator
- 'abnormal completion' of the `foo..of` loop (generally cause by a `break`, `return` or an
uncaught exception) sends a signal to the generator's iterator for it to terminate.
- This avoids the iterator instance of *something() being left in a suspended state.

- Alternatively we can do it with a `finally{..}` clause in the generator. */
function *something() {
    try {
        var nextVal;

        while (true) {
            if (nextVal === undefined) {
                nextVal = 1;
            }
            else {
                nextVal = (3 * nextVal) + 6;
            }

            yield nextVal;
        }
    }
    // cleanup clause
    finally {
        console.log( 'cleaning up! ');
    }
}

// or this can be done externally with a `return` call:

var it = something();

for (var v of it) {
    console.log( v );

    // don't let the loop run forever
    if (v > 500) {
        console.log(
            // complete the generator's iterator
            it.return( 'Hello World!' ).value
        );
        // no `break` needed here!
    }
}
// 1 9 33 105 321 969
// cleaning up!

/*
- the call to `it.return(..)` immediately terminates the generator, so no need for `break`
- it also returns whatever you passed into it, which is how 'Hello World!' comes straight back out.

Iterating Generators Asynchronously

Using callbacks:   */
function foo(x,y,cb) {
    ajax(
        'http://some.url.1/?x=' + x + '&y=' + y,
        cb
    );
}

foo( 11, 31, function(err,text) {
    if (err) {
        console.error( err );
    }
    else {
        console.log( text );
    }
} );

// with a generator:
function foo(x,y) {
    ajax(
        'http://some.url.1/?x=' + x + '&y=' + y,
        function(err,data) {
            if (err) {
                // throw an error into `*main()`
                it.throw( err );
            }
            else {
                // resume `*main()` with received `data`
                it.next( data );
            }
        }
    );
}

function *main() {
    try {
        var text = yield foo( 11, 31 );
        console.log( text );
    }
    catch (err) {
        console.error( err );
    }
}

var it = main();

// start it up!
it.next;

// most important part:
var text = yield foo( 11, 31 );
console.log( text );

// remember from ch1 that this almost identical code didn't work:
var data = ajax( '..url 1..' );
console.log( data );

/*
- The key difference is that `yield` pauses the code in the generator (`*main`), which
allows the async code to run.
- When it first runs, yield will return undefined, but thats okay as *main isn't currently
relying on a yielded value to do anything interesting.
    - at this point `yield` is just being used to pause/block the flow.
- Once the async `ajax` completes, it will return the data, and restart generator (iterate one tick).
- This means `text` will be given the value of `data`, and we can print it in `*main`.

- Very powerful that we can now have synchronous looking code (see comparison with ch1 above),
which is actually asynchronous under the hood.

Synchronous Error Handling
- The `yield` allows the assignment statement to pause and wait for `foo(..)` to finish.
- As well as allowing us to wait until data is returned (as described above), this allows us to
throw an error into the generator from `foo()`.  */
try {
    var text = yield foo( 11, 31 );
    console.log( text );
}
catch (err) {
    console.error( err );
}

// in foo:
if (err) {
    // throw an error into `*main()`
    it.throw( err );
}

// we can also throw errors out of a generator and catch them:
function *main() {
    var x = yield 'Hello World';

    yield x.toLowerCase();      // cause an exception!
}

var it = main();

it.next().value;        // Hello World!

try {
    it.next( 42 );
}
catch (err) {
    console.error( err );   // TypeError
}

/* Generators & Promises
- We can now combine promises (trustable and composable) and generators (synchronous-looking async code)

From ch3, the Promise-based approach to our ajax example:   */

function foo(x,y) {
    return request(
        'http;//some.url.1/?x=' + x + '&y=' + y
    );
}

foo( 11, 31 )
.then(
    function(text){
        console.log( text );
    },
    function(err){
        console.error( err );
    }
);

// we should `yield` a Promise, and wire that Promise to control the generator's iterator

// Promise-aware foo
function foo(x,y) {
    return request(
        'http;//some.url.1/?x=' + x + '&y=' + y
    );
}

// main from above (unchanged)
function *main() {
    try {
        var text = yield foo( 11, 31 );
        console.log( text );
    }
    catch (err) {
        console.error( err );
    }
}

// wire up the yielded Promise so that it resumes the generator on resolution:
var it = main();

var p = it.next().value;

// wait for the `p` promise to resolve
p.then(
    function(text){
        it.next( text );
    },
    function(err){
        it.throw( err );
    }
);
