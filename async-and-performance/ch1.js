/* Chapter 1: Asynchrony: Now & Later
Notes and example code from ch1 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch1.md

--------------------------------------------------------------------------------

A PROGRAM IN CHUNKS

- Programs are executed in chunks, where each chunk is often a function.
- Ajax requests don't complete synchronously, so in the below `data` won't have the ajax results.
*/
var data = ajax( 'http://some.url.1');

console.log( data );
// Oops! No data

// We often solve this with callback functions:
var data = ajax( 'http://some.url.1', function myCallback(data){

    console.log( data );        // Now we get the data

} );

/* Async Console
- Occasionally browsers will make console's methods, e.g. console.log, asynchronous.
- This means you might have issues where objects are modified after a console.log(..) and yet you
unexpectedly see the modified object.

EVENT LOOP
- JS doesn't have async baked into the language. (actually it does now in ES6)
- Instead it is in every JS engine, and called the event loop.

Can be conceptualised as an array that acts as a queue (first in, first out)*/
var eventLoop = [ ];
var event;

// keep going forever
while (true){
    // perform a trick
    if (eventLoop.length > 0) {
        // get the next event in the queue
        event = eventLoop.shift();

        // now, execute the next event
        try {
            event();
        }
        catch (err){
            reportError(err);
        }
    }
}
/*
- `setTimeout(..)` doesn't put your callback on the event loop.
- It sets up a timer.
- When the timer expires, the environment (e.g. browser) places your callback into the event loop, such that
 a future tick will pick it up and execute it.
- If there are already 20 items in the queue they will execute first.

- In other words your program is broken up into lots of small chunks, which happen one after another in the
event loop.

PARALLEL THREADING

- Async: now and later
- Parallel: simultaneously

- In parallel computing, processes and threads execute independently and maybe simultaneously.
    - Multiple threads can share the memory of a single process.

- An event loop, by contrast, breaks the work down into tasks and executes them in serial, desallowing parallel
access and changes to shared memory.*/
function later(){
    answer = answer * 2;
    console.log( 'Meaning of life: ', answer );
}
/*
- There are many threads in this function, e.g. for `answer = answer * 2;` we first load the current value of `answer`,
then put 2 somewhere, etc.
- If these executed in parallel we'd get very unpredictable results.
- Luckily JS is single-threaded.
*/
var a = 20;

function foo(){
    a = a + 1;
}

function bar(){
    a = a * 2;
}

ajax( 'http://some.url.1', foo );
ajax( 'http://some.url.2', bar );
/*
- The order of foo and bar being executing after the ajax requests makes a difference to the final value of `a`.
- However it is predictable what the final value of `a` will be in either case.
    - foo before bar, a = 42.
    - bar before foo, a = 41.

- If JS events sharing the same data executed in parallel, the results/ problems would be much more subtle.
    - i.e. results would be non-deterministic, which is usually a bad idea.

Run-to-Completion

- Because of JS's single threading, the entirety of foo's code will finish running before bar's starts running.
- This is known as run-to-completion behaviour.
- More obvious when there is more code inside each of foo and bar:
*/
var a = 1;
var b = 2;

function foo(){
    a++;
    b = b * a;
    a = b + 3;
}

function bar(){
    b--;
    a = 8 + b;
    b = a * 2;
}

ajax( 'http://some.url.1', foo );
ajax( 'http://some.url.2', bar );

// There are still only two possible outcomes, since neither foo nor bar can interrupt the other.

// Chunk 1 - synchronous (happens now)
var a = 1;
var b = 2;

// Chunk 2 - asynchronous
a++;
b = b * a;
a = b + 3;

// Chunk 3 - asynchronous
a--;
a = 8 + b;
b = a * 2;

/*
Possible orders of execution:
- Chunk 1, Chunk 2 (foo), Chunk 3 (bar). a = 11. b = 22.
- Chunk 1, Chunk 3 (bar), Chunk 2 (foo). a = 183. b = 180.

CONCURRENCY

- Imagine a social network that displays a list of updates as a user scrolls
- We need two separate 'processes':
    Process 1 - in response to `onscroll` events, make ajax `request`s for new content
    Process 2 - receives the ajax `response`s and renders the content to the page

- Concurrency is when two or more 'processes' are executing simultaneously, regardless of whether their
individual operations happen in parallel (e.g. on parllel cores/ processesors)
    - It is therefore process-level parallelism, as opposed to operation-level parallelism (separate processer threads).

Process 1 events cause the following 'processes':
*/
onscoll, request 1
onscoll, request 2
onscoll, request 3
onscoll, request 4
onscoll, request 5
onscoll, request 6
onscoll, request 7

// Process 2 events cause the following 'processes':
response 1
response 2
response 3
response 4
response 5
response 6
response 7

// Possible they could be ready to be processed at exactly the same time:

onscoll, request 1
onscoll, request 2      response 1
onscoll, request 3      response 2
response 3
onscoll, request 4
onscoll, request 5
onscoll, request 6      response 4
onscoll, request 7
response 6              // 6 came back before 5 - perfectly possible with ajax requests
response 5
response 7

// But JS can only handle one event at a time, so it puts them into single file (think of a lunchtime queue):

onscoll, request 1      // Process 1 starts
onscoll, request 2
response 1              // Process 2 starts
onscoll, request 3
response 2
response 3
onscoll, request 4
onscoll, request 5
onscoll, request 6
response 4
onscoll, request 7      // Process 1 finishes
response 6
response 5
response 7              // Process 2 finishes

// Noninteracting

// Non-determinism is fine if two processes don't interact:

var res = {};

function foo(results){
    res.foo = results;
}

function bar(results){
    res.bar = results;
}

ajax( 'http://some.url.1', foo );
ajax( 'http://some.url.2', bar );

// Interaction

// More commonly processes will interact through scope/ DOM.

var res = []

function response(data){
    res.push( data );
}

ajax( 'http://some.url.1', response );
ajax( 'http://some.url.2', response );

// The order of data in res will depend on which ajax response finished first - there is a "race" to finish.
// Solve these race conditions by coordinating:

var res = []

function response(data){
    if (data.url == 'http://some.url.1'){
        res[0] = data;
    }
    else if (data.url == 'http://some.url.2'){
        res[1] = data;
    }
}

ajax( 'http://some.url.1', response );
ajax( 'http://some.url.2', response );

// Some concurrency scenarios will always break without coordination.
// In this example, bar will always run too early and one of `a` or `b` will be undefined.
var a, b;

function foo(x) {
    a = x * 2;
    baz();
}

function bar(y) {
    b = y * 2;
    baz();
}

function baz(){
    console.log( a + b );
}

ajax( 'http://some.url.1', foo );
ajax( 'http://some.url.2', bar );

// we can use a "gate" to address this:

var a, b;

function foo(x) {
    a = x * 2;
    if (a && b){
        baz();
    }
}

function bar(y) {
    b = y * 2;
    if (a && b){
        baz();
    }
}

function baz(){
    console.log( a + b );
}

ajax( 'http://some.url.1', foo );
ajax( 'http://some.url.2', bar );

// Another concurrency issue: we want a "race" to the finish line where only the first function invoked will execute
// However what we get is that the second will override the value of `a` set by the first and duplicate the call to baz:

var a;

function foo(x) {
    a = x * 2;
    baz();
}

function bar(x) {
    a = x / 2;
    baz();
}

function baz(){
    console.log( a );
}

ajax( 'http://some.url.1', foo );
ajax( 'http://some.url.2', bar );

// can fix with a 'latch' - the first call wins:

var a;

function foo(x) {
    if (!a){            // remember that undefined is falsy
        a = x * 2;
        baz();
    }
}

function bar(x) {
    if (!a){
        a = x / 2;
        baz();
    }
}

function baz(){
    console.log( a );
}

ajax( 'http://some.url.1', foo );
ajax( 'http://some.url.2', bar );

// Cooperation

var res = [];

// 'response()' receives an array of results form the ajax call
function response(data) {
    // add onto existing `res` array
    res = res.concat(
        // make a new transformed array with all `data` values doubled
        data.map( function(val){
            return val * 2;
        } )
    );
}

ajax( 'http://some.url.1', response );
ajax( 'http://some.url.2', response );
/*
- Whichever ajax call gets its response back first will process all the data all at once.
- No other processes can run whilst this happens (e.g UI interactions).
- If there were millions of records, this would be a serious issue.

- The aim of cooperation is to break up this processing into smaller chunks, that allow other processes to be
mixed into the event queue with them.
*/
var res = [];

// 'response()' receives array of results form the ajax call
function response(data) {
    // do 1000 at a time
    var chunk = data.splice( 0, 1000 );

    // add onto existing `res` array
    res = res.concat(
        // make a new transformed array with all `chunk` values doubled
        chunk.map( function(val){
            return val * 2;
        } )
    );

    // anything left to process?
    if (data.length > 0){
        // async schedule next batch
        setTimeout( function(){
            response( data );
        }, 0 );                 // setTimeout(..0) is a hack that (usually) puts something directly onto the event loop
    }
}

ajax( 'http://some.url.1', response );
ajax( 'http://some.url.2', response );

/* JOBS
- New to ES6, the Job queue is layed on top of the event queue.
- Imagine that each tick on the event queue, has another "job queue" attached to it.
- Certain actions will say "I need to do this later, but do it right away before anything else"
    - useful for certain async actions.
- The event loop is a theme park ride - once you finish the ride, you have to go to the back of the queue.
    - The job queue is like cutting straight back in at the front of the queue.

STATEMENT ORDERING
- The compiler will re order statements to optimise performance but must do so without creating side-effects.
*/
