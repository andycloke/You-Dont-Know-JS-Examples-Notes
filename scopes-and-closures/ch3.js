/* Chapter 3: Function vs. Block Scope
Notes and example code from ch3 of the Scopes and Closures book in the YDKJS Series
https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch3.md

--------------------------------------------------------------------------------

FUNCTION SCOPE
- In function scope, each function that is declared creates a bubble for itself. No other
structures create scope bubbles.
- In the code below, there is the foo scope bubble, the bar scope bubble and the global one.
*/

function foo(a){
    const b = 2;
    // ...
    function bar(){
        // ...
    }
    // ...
    const c = 3;
}
bar();  // ReferenceError
console.log(a, b, c); // ReferenceError

/* HIDING IN PLAIN SCOPE
- We can use a function to hide variables and functions by enclosing them in that function's scope.
- This avoids potential misuse of variables and unexpected results.
- In line with the 'Principle of Least Privilige/ Least Authority/ Least Exposure' - only expose what is
necessary. Hide everythin else.
*/
// Here the doSomethingElse() and variable b should be hidden within the implementaion of doSomething():
function doSomething(a){
    b = a + doSomethingElse(a * 2);
    console.log(b * 3);
}
function doSomethingElse(a){
    return a - 1;
}
let b;
doSomething(2);   // 15
// Better: b and doSomething not accessible from outside doSomething so less likely to be abused.
function doSomething(a){
    function doSomethingElse(a){
        return a -1;
    }
    let b = a + doSomething(a * 2);
    console.log(b * 3);
}
doSomething(2);    // 15

/* Collision Avoidance
- Hiding variables and functions avoids collisions between two different identifiers with the same name
but different intended uses.
- In the code below the for loop will ruhn forever since bar overwrites the values of i to 3, which is less
than 10.
- The solution is to use var/let/const i = 3 or pick another name.
- Collision particularly likely in the global scope, so libraires and modules hide their identifiers from the
global scope. -> You should apply the same conservatism.
*/
function foo(){
    function bar(a){
        i = 3;
        console.log(a = i);
    }
    for (let i = 0; i < 10; i++){
        bar(i * 2);    // infinite loop
    }
}
foo();

/*  FUNCTIONS AS SCOPES
- Using functions declarations to hide variables/ other functions in the manner described above
pollutes the enclosing scope.
- It also means we have to explicity call the function by name to execute it.
- We can solve this with function expressions (as opposed to declarations).
- We essentially wrap a declaration in () then immediately call it using (), as shown below.
- foo is now in the scope between the {}, not the global scope.
*/

const a = 2;

(function foo(){
    const a = 3;
    console.log(a);  // 3
})();

console.log(a);      // 2

/* Anonymous vs Named
- Function expressions, as shown above, are familiar from callback parameters, where they are often
anonymous.
- Disadvantages of anonymous function expressions:
    1. No useful name in stack traces -> debugging is harder.
    2. Without a name, we must use the (depreciated) arguments.callee if recursion is needed.
    3. Naming function expressions improves readability
- For these reasons it is best to name functions expressions (even though this is often not what you see)

IIFE - Immediately Invoked Function Expressions
- An IIFE is when you create a function expression by wrapping a declaration in (), then call it using ()
- Sometimes you will see the equivalent (but stylistically different) with the () that execute the function
inside the wrapping ().
- i.e. it's either (function(){ .. })()   or (function(){ .. }())
- IIFEs can take arguents. In the IIFE below, the window object is passed in.
*/
const a = 2;
(function IIFE(global){
    const a = 3;
    console.log( a );         //  3
    console.log( global.a );  //  2
}) ( window );

console.log( a );   // 2

/*
- We can guarantee that the undefined parameter is actually the undefined value by adding it as a parameter
but not passing in a value for this parameter.
- Why? Any parameter that isn't assigned a value will take the value 'undefined'. So naming this parameter
undefined means undefined === undefined.
*/
undefined = true;    // shouldn't ever do this, but could have been done by accident somewhere
(function IIFE( undefined )){
    let a;   // value of 'a' is 'undefined'
    if (a === undefined){   // n.b. - if we hadn't added undefined as a param, its value would be true not undefined
        console.log('undefined actually equals undefined!');
    }
})();

/* BLOCKS AS SCOPES
- Many other languages support block scope - where a declared inside a for loop/ if statement
will only be accessible within the block of that loop/ statment.
- This conforms to the 'Principle of Least Exposue', but is not supported by JavaScript except
in the following cases. N.B. - the 'let' case is the most significant as it essentially allows
block scoping.

with
- As seen in chapter 2, the with statement is an example of block scope - the scope that is created
from the object only exists for the lifetime of that with statement, and not in the enclosing scope.
- However with should not be used.

try/ catch
- the err exists only in the catch clause. It can not be referenced elsewhere:
*/
try {
    undefined();   // example of an illegal operation in order to force an exception
}
catch (err){
    console.log(err);    // works!
}
console.log(err);        // ReferenceError: 'err' not foundß

/* let
- Introduced in ES6, let is used instead of var to declation variables.
- Let attaches the scope of that variable to whatever block it's contained in.
*/
var foo = true;
if(foo){
    let bar = foo * 2
    bar = something( bar );
    console.log( bar );
}
console.log( bar ); // ReferenceError

// we can make this explicit by creating arbitrary block with { ... }:
var foo = true;
if(foo){
    {
        let bar = foo * 2
        bar = something( bar );
        console.log( bar );
    }
}
console.log( bar ); // ReferenceError

// To free up memory afterwards, wrap large variables in block as so:
{
    let someReallyBigData = { .. };
    someProcessDefinedElsewhere( someReallyBigData );
}

/* const
- Also introduced in ES6, const is block scoped but its value is constant.
*/
