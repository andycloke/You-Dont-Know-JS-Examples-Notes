/* Chapter 4: Coercion
Notes and example code from ch4 of the Types & Grammar book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch4.md

--------------------------------------------------------------------------------

CONVERTING VALUES

- Converting a value is often called "type casting" when done explicitly and "coercion" when done implicitly.
- We will refer to them as explicit coercion, when the coercion is relatively obvious, and implicit coercion, when it is subtler.
- Coercion will always result in a scalar primitive value.
*/
var a = 42;

var b = a + "";         // implicit coercion

var c = String( a );    // explicit coercion

/*
- The terms explicit and implicit are relative and will depend on the person reading the code's experience and exposure to the different
functions/ syntax etc.
- We're talking in terms of the average, reasonably informed and relatively experienced developer.

ABSTRACT VALUE OPERATIONS

ToString
- When any non-string value is converted to a string representation using `.toString()`, it is handled by the ToString operation.
- Generally quite predictable
    - null -> 'null'
    - undefined -> 'undefined'
    - true -> 'true'
    - 42 -> '42'

- Very small/ large numbers go to their exponential form.
    - 1.07 * 1000000000000000000000 -> '1.07e21'  (exponential form)

- Arrays are concatenated:
    - [1,2,3] -> "1,2,3"

JSON Stringification
- very similar to `.toString()`, except that it will always result in a string.
- Non JSON-safe values are `undefined`, functions, symbols (ES6). These will be omitted if an object property
or replaced with null if part of an array.
- Objects with circular references, where object references create a never-ending cycle though each other,
are also considered non-safe JSON values. Will throw an error if called with JSON.stringify();
*/
JSON.stringify( 42 );           // '42'
JSON.stringify( '42' );         // ''42''       // string of a string!
JSON.stringify( null );         // 'null'
JSON.stringify( true );         // 'true'
JSON.stringify( undefined );    // undefined
JSON.stringify( function(){} ); // undefined

JSON.stringify(
    [1,undefined,function(){},4]
);                              // "[1,null,null,4]"
JSON.stringify(
    { a:2, b:function(){} }
);                              // "{"a":2}"
/*
- JSON.stringify will automatically call a toJSON method if the object has one, so this can be used to ensure
JSON.stringify is only called with a JSON-safe object.
*/
var o = { };

var a = {
    b: 42,
    c: o,
    d: function(){}
};

// create a circular reference inside `a`
o.e = a;

// would throw an error on the circular reference
// JSON.stringify( a );

// define a custom JSON value serialization (which will be called be JSON.stringify)
a.toJSON = function(){
    // only include the `b` property
    return { b: this.b };
};

JSON.stringify( a );        //"{"b";42}"
/*
- It's a common misconception that toJSON needs to stringify the value/ object, but stringify does this so
there is no need to do it twice.
- JSON.stringify(..) can be passed an optional second value, an array or function, known as a replacer.
-If it is an array, it should contain strings of allowed property names to be included in the serialization:
*/
var a = {
    b: 42,
    c: '42',
    d: [1,2,3]
};
JSON.stringify( a, ['b','c'] );     // "{"b":42,"c":"42"}"

/*
- If the replacer is a function, it will be called on the object itself, as well as every property in the object.
- Each time it is passed two arguments, a key and value. To skip a key in the serialization, return undefined, else return
the value provided.
- Below, first the object `a` is passed. `k` will be undefined, so the function returns undefined.
- Then each object property is passed as k, which filters out the property named `c`.
- It it recursive, so each value in the array will also be passed into the function.
*/
JSON.stringify( a, function(k,v)
    if (k !== "c") return v;
} );                                // "{"b":"42","d":[1,2,3]}"

/*
- A third argument, space, can be passed into JSON.stringify.
- If space is a positive integer, that many spaces will be indented in front of each object property.
- If space is a string, that string will be used to indent each property.

ToNumber

- If any number is used in a way that requries it to be a number, `.toNumber()` is called.
    - true -> 1
    - false -> 0
    - undefined -> NaN
    - null -> 0             Wierd!
    - '42' -> 42
    - 'abc' -> NaN
    - '0020' (octal value) -> 20
- Objects/ array: `ToPrimitive` is called, which will look for a `valueOf` method. If one is found
and it returns a primitive value, that value is then coerced into a number using the rules above.
*/
var a = {
    valueOf: function(){
        return '42';
    }
};

var b = {
    toString: function(){
        return '42';
    }
};

var c = [4,2];

c.toString = function(){
    return this.join('');       // '42'
};

Number( a );            // 42
Number( b );            // 42
Number( c );            // 42
Number( '' );           // 0
Number( [] );           // 0
Number( [ 'abc' ] );    // NaN

/* ToBoolean
- JS has the actual keywords `true` and `false`.
- You can coerce the number `1` to the boolean `true` and `0` to `false`, but that does not make
`1` the same as `true` and `0` the same as `false`. They are different.

Falsy Values
- All JS values can ber coerced into two categories:
    - Values that will become `false` if coerced to boolean (known as falsy values).
        - undefined
        - null
        - false
        - +0, -0, NaN
        - ""
    - Values that will become `true` if coerced to boolean.
        - everything else

Falsy Objects
- A falsy object is a value that looks and acts like a normal object, but evaluates to false when coered into a boolean.

    - They are not objects wrapped around false values, e.g. `var a = new Boolean( false )`, which are actually truthy.

    - They are provided by environment etc, not the JS language/ spec.

- `document.all`, provided by the DOM, is the most well-known case.
    - Used to be used to detect old versions of IE. `if (document.all) { // It's IE }`
    - Can't get rid of as lots of legacy code still has it, so easier to make it equivalent evaluate to false.

Truthy Values
- Anything not on the list of falsy values is truthy and will return true when coerced into a boolean, including the following strings.
*/
var a = 'false';        // true
var b = '0';            // true
var c = "''";           // true
// All these are truthy as well:
var a = [];             // true
var b = {};             // true
var c = function(){};   // true

/* EXPLICIT COERCION

Explicitly: Strings <--> Numbers
- Use the `String(..)` and `Number(..)` functions.
- By omitting the `new` keyword we avoid creating object wrappers, and instead explicitly coerce between the two types.
    - i.e. it is a function call which returns the value in the String/ Number type, not an object wrapper.
*/
var a = 42;
var b = String( a );        // uses ToString rules discussed earlier
b;          // '42'

var c = "3.14";
var d = Number( c );        // uses ToNumber rules discussed earlier
d;          // 3.14

// Other options:
var a = 42;
var b = a.toString();   // actually boxes the primitive value 42 as an object, then converts it

var c = '3.14';
var d = +c;             // "unary operator" form (operator with onlu one operand) - explicit once you know it!

// Date to number
// Another common use of the unary operator (seen above) is to coerce a Date object into a number, which will be the
// Unix timestamp.

var d = new Date( 'Mon, 18 Aug 2014 08:53:06 CDT');

+d;        // 1408369986000

// Coercion of the current date to a number is often seen as:
var timestamp = +new Date();

// when a constructor call has no arguments, you can omit the ():
var timestamp = +new Date;

// Avoiding coercion is better as it's more explicit:
var timestamp = new Date().getTime();

// Or even better (ES5):
var timestamp = Date.now();

/* The curious case of the ~
- the ~ operator represents bitwise NOT.
- Bitwise operations are defined only for 32-bit operations, which means they force their operands to conform to 32-bit
value representations.
- They will therfore coerce values into a 32-bit value represenation using `ToInt32`.
    - Initially `ToInt32` does a ToNumber coercion.
    - Then coerces into 32-bit value represenation.
    - Then flips each bit (e.g. 0 -> 1)
- Similar to how `!` coerces into boolean, then flips.
- ~ is equivalent to -(x+1).
    - The only value that returns a falsy 0 is -1, ~ of everything else returns a truthy value.
    - Useful for `indexOf(..)`, which returns -1 if the string is not found.
*/
var a = 'Hello World';

~a.indexOf( 'lo' );     // -4   // truthy
~a.indexOf( 'ol' );     // 0   // falsy
!~a.indexOf( 'ol' );    // 0   // truthy

// The above is more succinct than:
var a = 'Hello World';

if (a.indexOf( 'lo' ) >= 0){
    // found it!
}
// or:
if (a.indexOf( 'lo' ) != -1){
    // found it!
}
/* Truncating Bits
- ~~ often used in place of `Math.floor(..)`, to get an integer value.
- However it doesn't work the same on negative numbers and can't be used on non 32-bit values.

Explicitly: Parsing Numeric Strings
- Can achieve similar results by parsing a number out of a string's character contents, but there are differences:
*/
var a = '42';
Number( a );        // 42
parseInt( a );      // 42

var b = '42px';
Number( b );        // NaN // Coercion is not tolerant of non-numeric characters. It fails when it hits one.
parseInt( b );      // 42  // parsing is tolerant of non-numeric characters. It just stops parsing when it hits one.

/*
- `parseInt(..)` only operates on string values. It would make no sense to use it on any other type of value.
- If you do pass another type of value, the value will be coerced into a string, which might have unexpected results.
- `parseInt(..)` pre-ES5 required a second character to specify the base to determine the int in, otherwise the first
letter of the string determined it (x/X -> hexadecimal. 0 -> octal).
    - Now the default is base-10, but the optional second parameter can be used to specify another base.

Explicitly: * --> Boolean.

- Where * is any non-boolean value.
- `Boolean(..)` is a way of  forcing the ToBoolean coercion:
*/
Boolean( '0' );     // true
Boolean( [] );      // true
Boolean( {} );      // true

Boolean( '' );      // false
Boolean( 0 );       // false
Boolean( null );    // false
var g;
Boolean( g );       // false (g is the `undefined` value)

/*
- Using the `!` operator will coerce a number into the boolean type. However it will also flip the parity.
- We can use `!!` to coerce and flip the parity twice, i.e. preserve the parity.
*/
var a = '0';
!!a;            // true

var d = '';
!!d;            // false

/* IMPLICIT COERCION

- Implicit coercion makes code harder to understand.
- Most complaints about coercion in JS are about implicit coercion.
- Doesn't to be all bad:
    - Let's define the goal of implicit coercion as reducing verbosity, boilerplate and/or
    unecessary implemenatation detail - noise.

Simplifying Implicitly
- Pseudo-code for two consecutive type conversions: y's type -> AnotherType -> SomeType:*/
SomeType x = SomeType( AnotherType( y ) )
// Much simpler implicitly:
SomeType x = SomeType( y )
/*
- `y` is implicitly converted to `AnotherType` first.
- There are some scenarios, such as this one, where implicit conversion simplifies things.

Implicitly: Strings <--> Numbers
- If either operand is a string, or is an object that becomes a string with the `ToPrimitive` operation followed by the
[[DefaultValue]] (identical to how `ToNumber`) treats objects, then the operands of `+` are concatenated.
-  Otherwise they are added.
*/
var a = '42';
var b = '0';

var c = 42;
var d = 0;

a + b:      // '420'
c + d;      // 42

var a = [1,2];
var b = [3,4];

a + b;      // '1,23,4'

// You can therefore coerce a number to a string as so:
var a = 42;
var b = a + '';

b;      // '42'

// One quirk, which is unlikely to come up.
var a = {
    valueOf: function(){ return 42; },
    toString: function(){ return 4; }
};

a + '';         // '42'

String( a );    // '4'

// Coercing from string to number can be done using the - operator, as this is only defined for numeric operands:
var a = '3.14';
var b = a - 0;

b;      // 3.14

// Objects behave similarly to how they do with +:
var a = [3];
var b = [1];

a - b;          // 2

/*
- Each array is coerced into a string, then into a number for the - to perform.
- Implicit coercion between strings and numbers is generally not too confusing.

Implicitly: Booleans --> Numbers
- Not a general purpose technique, but a very useful for specific cases.
- Consider the following code, which will return true only if exactly one input is true.
*/
function onlyOne(a,b,c){
    return !!((a && !b && !c) ||
              (!a && b && !c) || (!a && !b && c));
}
var a = true;
var b = false;

onlyOne( a, b, b );     // true
onlyOne( b, a, b );     // true

onlyOne( a, b, a );     // true
/*
- If we wanted to handled 4/5/6 etc arguments, coercing boolean to numbers would be useful.
- In the first function below we do this implicitly using the + operator in the line `sum += arguments[i]`.
*/
function onlyOne(){
    var sum = 0;
    for (var i=0; i < arguments.length; i++){
        // skip falsy values. same as treating them as 0's. but avoids NaNs.
        if (arguments[i]){
            sum += arguments[i];
        }
    }
    return sum == 1;
}

var a = true;
var b = false;

onlyOne( b, a );                    // true
onlyOne( b, a, a, b, b, a, b);      // true
onlyOne( b, b );                    // false

// Using explicit coercion:

function onlyOne(){
    var sum = 0;
    for (var i = 0; i < arguments.length; i++){
        sum += Number( !!arguments[i] );
    }
    return sum === 1;
}
/*
- `!!` is used to coerce the value to boolean. This allows us to pass in non-boolean values.
- `Number(..)` is then used to coerce it to a number, so make sure the value is 0 or 1.
- The first solution, which uses implicit coercion, is arguably more elegant.
- Either way, both of the functions which use coercion are much more straight forward than the top one (which uses && etc).
    - Consider that you could easily make `onlyFive` by changing the bottom line to `return sum == 5`.

Implicitly: * --> Boolean
- Rather troublesome when * is not a string/ number.
- We see this coercion as X in these locations:
    1. if( X )
    2. for( .. ; X ; .. )
    3. while( X ) and do..while( X )
    4. X ? .. : ..
    5. X || .. as well as X && ..

- `||` and `&&` act as "operand selectors" that return the underlying value of one of the operands, rather than
a boolean value.
    - first they use implicit coercion, then they return the appropriate value.
- When you see these operators in, e.g., if statements, there is an additional implicit coercion step afterwards to a boolean value.
*/
var a = 42;
var b = 'abc';
var c = null;

a || b;         // 42
a && b;         // 'abc'

c || b;         // 'abc'
c && b;         // null

a || b;
// roughly equivalent to:
a ? a : b;

a & b;
// roughly equivalent to:
a ? b : a;

/* You'll often see the following used to set default parameters. Need to be careful
that you don't want to input a falsy value, e.g. '', as this would revert to the default.*/

function foo(a){
    a = a || 'default output'
    console.log( a );
}

// the following is used by JS minifiers, often called the "guard opertor"
function foo(){
    console.log( a );
}

var a = 42;

a && foo();     // 42

/* Symbol Coercion
- Implicit coercion of symbols to strings will throw an error.
- Symbols cannot coerce to numbers.
- Symbols can be coerced implicitly and explicitly to boolean.
*/
var s1 = Symbol( 'cool' );
String( s1 );                   // 'Symbol(cool)'

var s2 = Symbol( 'not cool' );
s2 + '';                        // TypeError

/* LOOSE EQUALS VERSUS STRICT EQUALS
The rule is: == allows coercion in the equality comparison and === disallows coercion

NOT: == checks values for equality and === checks values and types for equality

- If the values have different types, == will do more work as it has to coerce them.
- Under the second, incorrect statement, we'd think === would do more work as it has to check values,
THEN check types.

Abstract Equality
- The == operator's behaviour is defined as "The Abstract Equality Comparison Algorithm".

- If the two operands are of the same type, they are compared as you'd expect, with two exceptions.
    1. NaN is never equal to itself.
    2. +0 is equal to -0.
- Two objects (including objects/ arrays) are considered equal if they are references to the exact same value. No coercion required.

- If the two values are of different types:

Comparing: strings to numbers

- Strings are coerced into numbers, rather than the other way around.
*/
var a = 42;
var b = '42';

a === b;        // false
a == b;         // true
/*
- In the second case, '42' is coerced into 42, as defined in the specification.

Comparing: anything to boolean

- If we compare a boolean value to a number, the boolean is coerced into a number.*/
var x = true;
var y = '42';

x == y;         // false
/*
1. true is coerced into 1.
2. '42' is coerced into 42.
3. 1 == 42 returns false.

- Get the same when x = false, so '42' is neither true or false, even though it is truthy!
- Important thing is that `ToBoolean` is never involved. Instead booleans are always dealt with using `ToNumber`.
- Quite confusing, avoid `== true` and `== false`.
*/
var x = false;
var y = '42';

x == y;         // false

/* Comparing: nulls to undefineds
- null and undefined are treated as indistinguishable for comparison purposes.
- the `==` operator allows their mutual implicit coercion.
- Falsy values are not treated as equal (see below).
- So as long as you remember, and treat null and undefined as equal, this is a succinct way to
test equality.
*/
var a = null;
var b;      // undefined

a == b;     // true
a == null;  // true
b == null;  // true

a == false; // false
b == false; // false
a == '';    // false
b == '';    // false
a == 0;     // false
b == 0;     // false

/* Comparing: objects to nonobjects
- If one side is a string/number/boolean, the object on the other side is coerced using `ToPrimitive` then compared.
    - N.B. if the one side is a boolean, it will be coerced to a Number.
*/
var a = 42;
var b = [ 42 ];

a == b;     // true

/*
1. b is coerced into '42'.
2. '42' is coerced into 42.
3. 42 == 42 returns true.

- N.B. all the quirks described earlier with `toString()` and `valueOf()` apply here.

- Unboxing takes place when an object wrapper around a primitive value is unwrapped, and the underlying primitive value returned:
*/

var a = 'abc';
var b = Object( a );    // same as `new String( a )`

a === b;                // false
a == b;                 // true     // b is coerced via `ToPrimitive` to its underlying `abc`

// some quirks:
var a = null;
var b = Object( a );   // same as `Object()`
a == b;                // false

var c = undefined;
var d = Object( c );    // same as `Object()`
c == d;                 // false

var e = NaN;
var f = Object( e );    // same as `new Number( e )`
e == f;                 // false

/* Edge Cases

- Modifying the prototype can cause crazy bugs, but you'd be crazy to modify it...
*/
Number.prototype.valueOf = function(){
    return 3;
};

new Number( 2 ) == 3;       // true
2 == 3;                     // false (doesn't invoke valueOf, since both are primitive values)

var i = 2;

Number.protype.valueOf = function(){
    return i++;
};

var a = new Number( 42 );

if (a == 2 && a == 3){
    console.log( 'Yep, this happened.' );
}

/* Falsy Comparisons
- Most common complaint agaisnt coercion are how falsy values behave when compared agaisnt each other.
- Most of the following are predictable, but there are 7 false positives (marked with "UH OH!").
- By avoiding `== false`, as advised earlier, these 7 are reduced to just 3.
*/
'0' == null;            // false
'0' == undefined;       // false
'0' == false;           // true - UH OH!
'0' == NaN;             // false
'0' == 0;               // true
'0' == '';              // false

false == null;          // false
false == undefined;     // false
false == NaN;           // false
false == 0;             // true - UH OH!
false == '';            // true - UH OH!
false == [];            // true - UH OH!
false == {};            // false

'' == null;             // false
'' == undefined;        // false
'' == NaN;              // false
'' == 0;                // true - UH OH!
'' == [];               // true - UH OH!
'' == {};               // true - UH OH!

0 == null;              // false
0 == undefined;         // false
0 == NaN;               // false
0 == [];                // true - UH OH!
0 == {};                // false

// The Crazy Ones
[] == ![];       // true
/*
- RHS coerced explicitly by ! to `false`.
- `[] == false` is one of the gotcha false positives listed above.*/

0 == '\n';      // true
/*
- RHS coerced to a number, as usual. It is coerced to 0, so the comparison is true.

Heuristics for safely using implicit coercion:
- If either side of the comparison can have true/ false values, avoid ==.
- If either side can have [], '', or 0, you should probably avoid ==.

ABSTRACT RELATIONAL COMPARISON ( < )
- First calls ToPrimitive on both values.
- If either return value is not a string, both are coerced to numbers and compared numerically:*/
var a = [ 42 ];
var b = [ '43' ];

a < b;  // true
b < a;  // false

// If both are strings, a natural alphabetic comparison is made, starting with first characters.
var a = [ '42' ];
var b = [ '043' ];

a < b;      // false        // because 4 > 0

// the same:
var a = [ 4, 2 ];
var b = [ 0, 4, 3];

a < b;      // false

// both become `[object Object]`, so they are equal and a is not less than b
var a = { b: 42 };
var b = { b: 43 };

a < b;      // false
a == b;     // false    // not references to the same object, so not equal
a > b;      // false

a <= b;     // true     // actually does b < a (false), then negates the result
a >= b;     // true     // actually does b < a (false), then negates the result
