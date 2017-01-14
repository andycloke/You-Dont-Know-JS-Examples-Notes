/* Chapter 2: Lexical Scope
Notes and example code from ch2 of the Scopes and Closures book in the YDKJS Series
https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch2.md

--------------------------------------------------------------------------------
- Lexical model is the most common model of scope, and is the one used by JavaScript.
- The other model is Dynamic Scope.

LEX-TIME
- Lexical scope is scope that is defined at during the lexing (tokenizing) stage of the compiler.
*/
function foo(a) {
    var b = a * 2;

    function bar(c){
        console.log(a, b, c);
    }

    bar(b * 3);
}

foo(2);   // 2 4 12
/*
- There are three scopes scopes in this code, which can be thought of as nested inside each other:
1. Encompasses the global scope. Identifiers: foo
2. Encompasses the scope of foo. Identifiers: a, bar, b.
3. Encompasses the scope of bar. Identifiers: c.
- We can think of each function as defining a new block of scope, or scope bubble.

LOOKUPS
- When console.log looks for a variable, it starts within the scope of bar, then moves to that of foo if it
doesn't find what it's looking for, then moves to the global scope.
-  so if, e.g., there was a `c` inside of both foo and bar, the one in bar would be used.
    -> Scope lookups STOP once they find the first match.
        -> We can use the same variable name inside of each scope, known as shadowing.

- Global variables are automatically properties of the global object (e.g. window in browsers), so we can
reference glboal variable `a` as `window.a`.

CHEATING LEXICAL
- Lexical scope is defined by the author's choice of where blocks are written.
- Howver there are two ways to cheat lexical scope.
- Both are frowned upon and cause poorer performance.

EVAL
- Eval takes a string as an argument. After eval is called it is as if that string had been authored code:
- The below example uses static input to eval(), but it will often be dynamic.
- Strict mode make eval() operate in its own lexical scope, which eliminates the effect of
cheating lexical scope.
*/
function foo(str, a =){
    eval(str);           // it is know as if var b = 3 had been written here.
    console.log(a, b);   // the lookup of b will find b = 3 in foo's scope, rather than the b = 2 in global scope.
}
const b = 2;
foo('var b = 3', 1); // 1 3

/* `with` (Now depreciated)
- The `with` statement takes an object, and treats that object as if it is a wholly separate lexical scope.
- The object's properties are treated as lexically defined identifiers in that `scope`.
*/
function foo(obj){
    with(obj){
        a = 2;
    }
}

var o1 = {
    a: 3
};
var o2 = {
    a: 3
}

foo(o1);
console.log(o1.a);   // 2

foo(o2);
console.log(o2.a);   // undefined
console.log(a);      // 2 - suprising
/*
- When o1 is passed into with, it finds the `a` property of o1 and sets it to 2.
- When o2 is passed into with, it cannot find the property a. So o2.a is undefined.
- The surprising bit:
    - Because `with` treats obj2 as if it is a lexically defined scope, it looks for a lexically defined
    identifier called `a` in the scope  of obj2.
    - Failing to find it, it moves to the scope of foo, and again fails to find it.
    - It then moves to the global scope. Where it implicitly declares `var a = 2`.
    - N.B. This would not work in strict mode.

PERFORMANCE
- The JS Engine makes performance optimisations at compile time that rely on being able to analyse
the code as it lexes, and pre-determine where all the variable and funciton decalaration are.
- Using eval and with invalidates these optimisations, so harms performance.
*/
