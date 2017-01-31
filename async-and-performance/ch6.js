/* Chapter 6: Benchmarking & Tuning
Notes and example code from ch6 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch6.md

--------------------------------------------------------------------------------
 Benchmarking
 - Common (but misguided) approach to testing the speed of an operation:    */
 var start = (new Date()).getTime();        // current time in milliseconds ( could use `Date.now() instead)

 // do some operation

 var end = (new Date()).getTime();

 console.log( 'Duration:, ' (end - start) );

 /* Issues with this approach:
 - Some platforms have less than millisecond precision, e.g. 15ms, so the operation would need to take at least
 15ms for anything other than 0 to be reported.
- We only know it took approximately the reported duration on that specific run, and
we have no idea if the next time it runs the conditions will be the same.
- The circumstances of this test might be overly optimisitic - e.g. the enginer might optimise it
now, but then not optimise it when it's part of a larger codebase.

Repitition
- We might now put a loop around it, run it 100 times and divide the total time by 100.
    - However that's not nearly enough tests - one big outlier could effect it a lot.
- We could therefore run it for a certain amount of time, and this amount of time should depend
on the precision of our timer.
    - The worse the precision of the timer, the longer we need to run it for.
- Doing this once would be one sample.
- We want multiple samples to average across, as well as give us an idea of how spread out the best
and worst samples are.

Benchmark.js
- Benchmark.js provides a statistically-sound benchmarking tool.
- Page setup allows us to declare things once and have them accessible on every iteration.
- Test setup allows for things to be declared for each cycle (each cycle has many iterations).
- A basic overview of its usage:            */
function foo() {
    // operations to test
}

var bench = new Benchmark(
    'foo test',     // test name
    foo,            // function to test (just contents)
    {
        // ..       // optional extra options (see docs)
    }
)

bench.hz                // number of operations per second
bench.stats.moe;        // margin of error
bench.stats.variance;   // variance across samples

/*
- It's important to remember that context is king, and small differences in performance will
often be completely imperceivable to the user, so don't matter and shouldn't be used for an
argument like 'X is faster than Y, so we should use X'.

- Engine optimisations mean results will often conflict with your intuitions about performance.
    - It also means non-real and real (production) code will have different results, so you test
    production-level code rather than smaller snippets where possible.

jsPerf.com
- jsperf.com uses the Benchmark.js library to run reliable testing across different browsers.

Sanity Check
- jsPerf is great, but you'll often see some bogus tests. e.g.:     */

// Case 1
var x = [];
for (let i=0; i < 10; i++){
    x[i] = 'x';
}

// Case 2
var x = [];
for (let i=0; i < 10; i++){
    x[x.length] = 'x';
}

// Case 3
var x = [];
for (let i=0; i < 10; i++){
    x.push( 'x' );
}
/* Issues
- The for loops are probably redundant, since Benchmark.js does this for you.
- x is set for each iteration. Is this our intent? Does it capture the fact that in a
real-life program we will likely be working with arrays much larger than length 10.
- `push(..)` is a function call, so of course it will be slower. Is this comparison fair?

Another example:            */

// Case 1
var x = ['John', 'Albert', 'Sue', 'Frank', 'Bob'];
x.sort();

// Case 2
var x = ['John', 'Albert', 'Sue', 'Frank', 'Bob'];
x.sort( function mySort(a,b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
} );

/*
- The comparison isn't fair since we're creating a new function expression for
each iteration.
- mySort's declaration should be put in the page setup

Another issue: not comparing apples to oranges:     */

// Case 1
var x = [12,-14,0,3,18,0,2.9];
x.sort();

// Case 2
var x = [12,-14,0,3,18,0,2.9];
x.sort( function mySort(a,b){
    return a - b;
} );
/*
- Apart from the issue of declaring mySort every iteration (discussed above), these functions
actually do different things.
    - In case 1 `sort()` will coerce the values to strings and lexicographically compare them.
        - It results in: [-14, 0, 0, 12, 18, 2.9, 3]
    - In case 2 we do numeric comparison and get the return value we probably want.
        - It results in: [-14, 0, 0, 2.9, 3, 12, 18]

These issues can be even more subtle. In this example be try to work out the impact of coercing
`x` to a boolean value, however we fail to notice that in Case 1 we do the extra work of setting
x's value:                          */

// Case 1
var x = false;
var y = x ? 1 : 2;

// Case 2
var x = ;
var y = x ? 1 : 2;

// This is what we should actually do:

// Case 1
var x = false;
var y = x ? 1 : 2;

// Case 2
var x = undefined;
var y = x ? 1 : 2;

/* Microperformance
- Because the compiler doesn't take your syntax literally, but rather makes lots of optimisations, obsessing
over discrete syntactic minutia is not worth it.
    - e.g. doing a recursive funciton call may be turned into a for loop.
- Within reasons, you should therefore write the code that is optimised for readability.
- Another common example which doesn't make a statistically-significant difference:     */
var x = [ .. ];

// Option 1
for (var i=0; i < x.length; i++) {
    // ..
}

// Option 2 - caching the length - in reality this doesn't make any difference!
for (var i = 0, len = x.length; i < len; i++){
    // ..
}

/*
- Not all browsers make the same optimisations, so pointless trying to over-optimise when
results will vary.
- Optimising for a particular browser enginer (as is common amongst Node.js devs for the v8
engine) runs the danger that if that engine's implementation changes, or a different engine
becomes the dominant one, your optimisations will have been unnecesary/ may slow down your code.

- Focus on optimising the critical path(s) - everything else may be 'premature optimisation'.

Tail Call Optimisation (TCO)
- a tail call is a function call that appears at the 'tail' of another function, such
that after the function call finished, there's nothing left to do.
- a TCO-capable engine will realise certain function calls are tail calls and reuses the
existing stack frame, rather than creating a new one.
    - This can be very powerful when doing recursion.    */
function foo(x) {
    return x;
}

function bar(y) {
    return foo( y + 1 );        // tail call
}

function baz() {
    return 1 + bar( 40 );       // not a tail call - still needs to add 1 after bar has completed
}

baz();
