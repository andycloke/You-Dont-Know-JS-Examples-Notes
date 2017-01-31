/* Chapter 5: Program Performance
Notes and example code from ch5 of the Asnyc & Performance book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch5.md

--------------------------------------------------------------------------------

- This chapter looks at macro program-level peformance factors.

Web Workers

- An environment like the browser can provide multiple instances of the JS engine, and let you run a
different program in each thread.
- Each of those separate threaded pieces of your program is called a (Web) Worker.
- This is called task parallelism.
- From your main JS program/ another Worker, you instantiate a Worker like so:  */

var w1 = new Worker( 'http://some.url.1/mycoolworker.js');

/* The URL should point to the location of a JS file, which is loaded into the Worker.
- The browser then creates a separate thread, which runs that file as an independent program.
- Workers don't share resources/ scope, but use a basic event messaging mechanim.
- w1` is:
    1. An event listeneer thay subscribes to events sent by the Worker.
    2. An event trigger that can send events to the Worker.
- We listen to events like so:          */
w1.addEventListener( 'message', function(evt){
    // evt.data
} );

// and send messages as so:
w1.postMessage( 'something cool to say' );

// Inside the Worker, the messaging works in the same way:

// 'mycoolworker.js'
addEventListener( 'message', function(evt){
    // evt.data
} );
postMessage( 'a really cool reply' );
