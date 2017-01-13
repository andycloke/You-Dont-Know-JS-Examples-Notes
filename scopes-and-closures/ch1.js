/* Chapter 1: What is Scope?
Notes and example code from ch1 of the Scopes and Closures book in the YDKJS Series
https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch1.md

--------------------------------------------------------------------------------

- Scope is the set of rules for storing and accessing variables

COMPILER THEORY
- Despite common misconceptions, javascript is a compiled languaged.
- The compilation is usually done immediately before the code is executed.
- Loosly, code compilation involves three steps:
    1. Tokenizing/ Lexing: breaking up a string of characters into small, meaningful chunks (tokens).
    2. Parsing: turning the tokens into a tree of nested elements, which represents the
    grammatical structure of the language. Known as an AST (abstract syntax tree).
    3. Code-Generation: turning AST into executable code. Varies depending on machine, language etc.
- There are other steps, e.g. optimisation of the executable.

UNDERSTANDING SCOPE
- The ENGINE is responsibel for start-to-finish compilation and execution of the JS program.
- The COMPILER handles the parsing and code-generation, as discussed above. A friend of ENGINE.
- SCOPE collects and maintains a look-up list of all the declared identified (variables), and enforces
  a set of rules as to how they are accessible. Also a friend of ENGINE.

Back & Forth
- Consider the following program: */
var a = 2;
/* Engine actually sees this as two statements:

- One is handled by Compiler during compilation.
- The second is handled by Engine during execution.

And the following steps take place:
- Tokenizing/ lexing - Compiler will break the code down into tokens.
- Parsing - Compiler will pass the tokens into an AST.
- Code-Generation:
    1. Compiler asks Scope 'does `a` already exist in this scope (collection)?'
        Yes: Compiler ignores declaration
        No: Declare a new variable called `a` with this scope (collection)
    2. Compiler produces code for Enginer to execute later on.
- Engine runs: asks Scope 'does an accessible variable a exist in current scope (collection)?'
    Yes: use that variable
    No: Look elsewhere

Compiler Speak
- LHS lookup - done when a variable appears on the left of an assignment operation. Looks for
the variable container itself, so that it can assign.
- RHS lookup - 'Retrieve His/Her Source value' - go and get the value of some variable

- So when Compiler asks Scope 'does `a` already exist?' it's doing a LHS.

LHS lookup of a - don't care what current value is, but want the variable container:*/
a = 2;

// RHS lookup - nothing assigned, just want the value of a:
console.log(a);

// LHS / RHS not always on one side of the = assignment operator:

function foo(a){  // 2: implied assignment of a = 2. LHS lookup for a
    console.log(a);  // 3: RHS lookup for value of a.
                     // 4: RHS lookup for console object. Prop resolution occurs to see if it has a method called log.
                     // 5. LHS/ RHS lookups within implementation of log()
}

foo(2);   // 1: RHS lookup - go lookup value of foo, and give it to me.
/*
Engine-Scope Conversation
*/
function foo(a){
    console.log(a);
}
foo(2);   // 2

/*
(copied word for word)
Engine: Hey Scope, I have an RHS reference for foo. Ever heard of it?

Scope: Why yes, I have. Compiler declared it just a second ago. He's a function. Here you go.

Engine: Great, thanks! OK, I'm executing foo.

Engine: Hey, Scope, I've got an LHS reference for a, ever heard of it?

Scope: Why yes, I have. Compiler declared it as a formal parameter to foo just recently. Here you go.

Engine: Helpful as always, Scope. Thanks again. Now, time to assign 2 to a.

Engine: Hey, Scope, sorry to bother you again. I need an RHS look-up for console. Ever heard of it?

Scope: No problem, Engine, this is what I do all day. Yes, I've got console. He's built-in. Here ya go.

Engine: Perfect. Looking up log(..). OK, great, it's a function.

Engine: Yo, Scope. Can you help me out with an RHS reference to a. I think I remember it, but just want to double-check.

Scope: You're right, Engine. Same guy, hasn't changed. Here ya go.

Engine: Cool. Passing the value of a, which is 2, into log(..)
*/
function foo(a){
    var b = a;
    return a + b;
}
var c = foo(2);
/* Quiz
Find the 3 LHS lookups & 4 RHS lookups in the code above.
LHS:
1. lookup variable container for c
2. implicit assignment of parameter a = 2. lookup a
3. lookup variable container for b
RHS:
1. RHS reference for foo
2. Lookup value of a in `var b = a`
3. RHS lookup of a in `return a + b`
4. RHS lookup of b in `return a + b`

NESTED SCOPE
- If a variable cannot be found in the immediate scope, Engine consults the next outer containing
scope, continuing to do this until the variable has been found or the global scope has been reached.
*/
function foo(a){
    console.log(a + b);
}
var b = 2;
foo(2);  // 4
/*
Engine: "Hey, Scope of foo, ever heard of b? Got an RHS reference for it."

Scope: "Nope, never heard of it. Go fish."

Engine: "Hey, Scope outside of foo, oh you're the global Scope, ok cool.
        Ever heard of b? Got an RHS reference for it."

Scope: "Yep, sure have. Here ya go."

ERRORS
- If RHS lookup can't find the declaration of a variable, it will return a ReferenceError
- If LHS lookup can't find the declaration of a variable:
        In strict mode: returns a ReferenceError
        Not in strict mode: declares the variable and returns it.
*/
