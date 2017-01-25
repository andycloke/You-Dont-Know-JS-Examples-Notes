/* Chapter 5: Grammar
Notes and example code from ch1 of the Types & Grammar book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch5.md

--------------------------------------------------------------------------------

STATEMENTS & EXPRESSIONS

- In English, one sentence is composed of one/ many phrases, connected by punctuation marks or conjunctions (and/ or)
    - One phrase can itself include multiple smaller phrases.
- In JS:
    - statements are sentences.
    - expressions are phrases.
    - operators are conjunctions/ punctuation.
*/

var a = 3 * 6;
var b = a;
b;
/*
- Every expression can be evaluated down to a single, specific value.
    - 3 * 6 evaluates to 18
    - a and b both evaluate to 18
    - again on the third line, b evaluates to 18.
- var a = 3 * 6 & var b = a are declaration expressions.
- a = 3 * 6 & b = a are assignment expressions.

Statement Completion Values
- All statements have completion values, which is displayed in the console for the last statement executed.
- This value can be `undefined`, and is for assignment expressions such as var b = a;

- Any regular {..} block has a completion value of the completion value of its last contained statement/ expression.
*/
var b;

if (true){
    b = 4 + 38;
}
// this displays 42 in Chrome's developer console.

var a, b;

a = if(true){
    b = 4 + 38;
};
/* this doesn't work, so what can we do?
- Use eval - works but bad idea.
- Wait for the possible introduction of do blocks in ES7.

Expression Side Effects
- Both of these cause side effects (changing a).
- The order depends on whether then increment operator ++ is a prefix or a suffix.
*/
var a = 42;
var b = a++;

a;      // 43
b;      // 42

var a = 42;
var b = ++a;

a;      // 43
b;      // 43

/*
- The , statement-series comma operator allows you to string together multiple standalone expressions.
*/
var a = 42, b;
b = ( a++, a );     // the second a statement expression gets evaluated after the side effects of the a++ expression, so assigns 43 to b

a;      // 43
b;      // 43

// `delete` returns true if the object has a configurable property with the correct name. It has the (useful) side effect of deleting an object property.
var obj = {
    a: 42
};

obj.a;          // 42
delete obj.a    // true
obj.a;          // undefined

// The assignment operator essentially uses a side effect to assign a value to an identifier:
var a;
a = 42;     // 42       // return value is 42. assignment is a side-effect
a;          // 42

// this behaviour (assigning as well as returning the value) is useful for chained assignments
var a, b, c;
a = b = c = 42;

// don't do this (without declaring b somewhere) - will create a global b/ throw an error in strict mode
var a = b = 42;

// similarly:
function vowels(str){
    var matches;

    if (str){
        // pull out all the vowels
        matches = str.match( /[aeiou]/g);

        if (matches) {
            return matches;
        }
    }
}

vowels( 'Hello World');     // ['e','o','o']

// can be done more succintly using the assignment side effect:
function vowels(str){
    var matches;

    if (str && (matches = str.match( /[aeiou]/g))){
            return matches;
    }
}

vowels( 'Hello World');     // ['e','o','o']

/* Contextual Rules
- Sometimes the same syntax means different things.

Curly braces

Object literals
- The first use of curly braces {} is as an object literal.*/

// assume bar() defined
var a = {
    foo: bar()
};

// Labels

// assume bar() defined
{
    foo: bar()
}
/*
- NOT a standalone object literal that doesn't get assigned.
- A regular code block. Can be useful when combined with `let` (ES6) block scoping.
- in the form above `foo` is a label for statement `bar()`, which can used with labeled jumps (a limited
form of goto).
- These are uncommon and best avoided, so won't bother going over.

Blocks
- Commonly cited gotcha:*/
[] + {};    // '[object Object]'
{} + [];    // 0
/*
- 1st result:
    1. {} is in the + operator's expression and so is coerced into an empty object.
    2. [] coerced to ''.
    3. {} coerced into a string value as well.
- 2nd result:
    1. {} interpreted as a standalone {} empty block (which does nothing).
        - Blocks don't need semicolons to terminate them, so lack of one here is not problemt.
    2. `+ []` explicitly coerces the `[]` to a number, which is the 0 value.

Object Destructuring
- You'll also see {} in (ES6) object destructuring.
*/
var data = {
    a: 42,
    b: 'foo'
};

var { a, b } = data;
console.log( a, b );    // 42 'foo'

/* else if and optional blocks

- There isn't actually an `else if` clause in JS.
- However both `if` & `else` can ommit the {} if they are followed by a single block.
- Therefore when you do `else if` you're just choosing to ommit the curly braces (and relying on the fact that
the `if{..} else{..}` statement afterwards is just one statement).

OPERATOR PRECEDENCE
- `,` the statement-series operator has the lowest precedence, so you will often need to use () with it.
- && has a higher precedenc than = . */
var a = 42;
var b = 'foo';
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;      // 42, but why?

// Which of && and || takes precedence in `(a && b || c)`?

false && true || true;      // true

(false && true) || true;    // true - winner
false && (true || true);    // false

// Is it just left to right precedence though?

true || false && false;     // true

(true || false) && false;   // false
true || (false && false);   // true - winner

/* && evaluated first, then ||, nothing to do with LHS/ RHS.

Short Circuited

- For both && and ||, the right hand operator will not be evaluated if the left hand oeprator is sufficient to determine the outcome.

Tighter Binding
- && is more precedent than ||
- || is more precedent than ? :

- Sometimes explained as && and || "bind more tightly" than ? and :
*/
a && b || c ? c || b ? a : c && b : a;

// is more like:
(a && b || c) ? (c || b) ? a : (c && b) : a;

// than:
a && b || (c ? c || (b ? a : c) && b : a)

/* Associativity
- Operators can have left or right associativity.

- && and || have left associativity.*/
a && b && c

// is equivalent to
(a && b) && c

/*
- Associativity determines grouping when we have multiple &&s or ||s.
    - Doesn't determine how the operands in individual expressions are evaluated
    (but that also happens to be left to right in the case of && and ||)

- Doesn't make a whole lot of difference for && and ||, but for other operators it does.
- e.g. ? : is right-associative.*/
a ? b : c ? d : e

// is equivalent to:
a ? b : (c ? d : e)
// not:
(a ? b : c) ? d : e

// The = operator is also right-associative.
a = b = c = 42;
// is equivalent to:
a = (b = (c = 42));

// Returning to this:
var a = 42;
var b = 'foo';
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;      // 42, but why?
// It's like:
(
    (a && b)
        ||
    c
)
    ?
(
    (c || b)
        ?
    a
        :
    (c && b)
)
    :
a
/*
1. (a && b) is 'foo'.
2. 'foo' || c s 'foo'.
3. For the first ? test, 'foo' is truthy.
4. (c || b) is 'foo'.
5. For the second ? test, 'foo' is truhty.
6. a is 42.

AUTOMATIC SEMICOLONS

- Automaatic semicolon insertion (ASI) is when JS automatically assumes a ; in certain places of
your program even if you didn't want one there.
- Only occurs in the presence of a newline.
- When the JS parser parse a line where it would expect a ; and there isn't one.
    - if there is only whitespace/ comments up until the next newline it inserts a ;
*/
var a = 42, b       // ASI here
c;

var a = 42, b = 'foo';

a   // 42       // ASI after a
b   // 'foo'    // ASI after b

// useful for do {..} while (..); loops, which require a ; whilst for (..) {..} and while (..) {..} loops do not:
do {
    // ..
} while (a)     // ASI here

// also applies to `break`, `continue`, `return` and `yeild` keywords
function foo(a){
    if (!a) return  // ASI here and returns

    a *= 2;
    // ...
}

// ERRORS

// Certain early errors - syntanical error that are caught during compilation.

// Invalid regex:
var a = /+foo/;     // Error!

// value in an illegal position:
var a;
42 = a;             // Error!

/* Using Variables Too Soon

- ES6 defines a "Temporal Dead Zone" (TDZ), where variable references cannot yet be made.
- Strangely typeof has an exception for undeclared variables, but not TDZ references.
*/
{
    a = 2;      // ReferenceError!
    let a;
}
{
    typeof a;   // undefined
    typeof b;   // ReferenceError! (TDZ)
}

// `try..finally`

// finally (always) runs after try and catch (if catch is present)

function foo(){
    try {
        console.log( '42' );
    }
    finally {
        console.log( 'this always runs');
    }
    console.log( 'never runs' );
}

foo();
// 42
// this always runs

// `switch`

switch (a){
    case 2:
        // do something
        break;
    case 42:
        // do another thing
        break;
    default:
        // fallback to here
}
// The matching between a and the various cases is equivalent to the === algorithm

// To hack using == instead:
var a = '42';

switch (true){
    case a == 2:
        // do something
        break;
    case a == 42:           // '42' == 42 evaluates to true. THEN: true === true.
        // do another thing
        break;
    default:
        // fallback to here
}
// be careful - needs to evaluate to `true`, not a truthy value
var a = 'hello world';
var b = 10;

switch (true){
    case (a || b == 10):
        // never gets here
        break;
    default:
        console.log( 'Oops' );
}
// Oops

/*
- Fix is to use `!!(a || b == 10)`.
- In the below code, it goes through each option with no matches, so goes to default.
- The default has no break, so proceeds to following statement, prints out 3.
- Hits the break so quits.
*/
var a = 10;
switch (a) {
    case 1:
    case 2:
        // never gets here
    case 3:
        console.log( '3' );
        break;
    case 4:
        console.log( '4' );
}
