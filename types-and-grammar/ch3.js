/* Chapter 3: Natives
Notes and example code from ch3 of the Types & Grammar book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/types%20%26%20grammar/ch3.md

--------------------------------------------------------------------------------

- Natives (such as `String()`, `Number()`) can be used to create an object wrapper around a primitive value.
*/
var a = new String( 'abc' );
typeof a;                       // 'object'   ...not 'String'
a instanceof String;            // true
/*
- These objects are not their own special types, but subtyes of the object type.

INTERNAL [[CLASS]]
- Values that are of `typeof` of object are additionally tagged with an internal [[Class]] property.
- This can not be accessed directly, but can be revealed indirectly by borrowing the default `Object.prototype.toString(..)`
method called agaisnt the value:*/

Object.prototype.toString.call( [1,2,3] );               // "[object Array]"

Object.prototype.toString.call( /regex-literal/i );      // "[object RegExp]"

// same for null and undefined, even though there is no Null() / Undefined():
Object.prototype.toString.call( null );                  // "[object NULL]"

Object.prototype.toString.call( undefined );             // "[object undefined]"

/* BOXING WRAPPERS
- Primitive values don't have properties or methods. Boxed objects do.
- So to access these, JS will automatically "box" (wrap) the primitive values.*/
var a = 'abc';

a.length;           // 3
a.toUpperCase();    // 'ABC'
/*
- No need to pre-optimize by using the String() form, as browsers optimise the common cases
(e.g. .length) for you.)
- Basically no reason to use the boxing form, just let the browser do it for you.

Object Wrapper Gotchas
- Objects themselves are truthy, so creating an object wrapper around the false value will make
a truthy:
*/
var a = new Boolean( false );

if (!a){
    console.log( 'Oops' );      // never runs
}
/* UNBOXING
- Use the `valueOf()` method to get the underlying primitive value.
*/
var a = new String( 'abc' );
var b = new Number( 42 );
var c = new Boolean( true );

a.valueOf();    // 'abc'
b.valueOf();    // 42
c.valueOf();    // true

// can also happen implicitly:
var a = new String( 'abc' );
var b = a + '';                 // `b` has the unboxed primitive value 'abc'

typeof a;       // 'object'
typeof b;       // 'string'

/* NATIVES AS CONSTRUCTORS
- Generally much less error prone to use the literal form than the constructor/ wrapper form.

Arrays
- e.g. it is possible to use the constructor form `new Array( 3 )` with one argument to create an array with a length but no
values, a so-cllaed `sparse array`.
- no need to go into specifics, but enough to know these sparese arrays have some bvery weird behaviours so should be avoided.

`Object(..), Function(..) & RegExp(..)`
- `Object(..)` should be avoided.
- `Function(..)` is useful when you need to dymnaically define a function's parameters and/or its function body, but this is very rare.
- Similarly `RegExp(..)` is occasionally useful to dynamically define a regular expression.

`Date(..) & Error(..)`
- There is no literal version of either of these, so they are genuinely useful.
-`Date()` will provide a datetime object specified by a string paramter.
- Alternatively, `Date.now()` provides the current Unix timestamp value.

- `Error(..)` is used as follows:
*/
function foo(x){
    if (!x){
        throw new Error( "x wasn't provided");
    }
    // ...
}
/* `Symbol(..)`
- Symbols provide special "unique" (not guaranteed unique) values, that can be used as properties on objects with little fear of collision.
- The `Symbol(..)` native should be used to define custom symbols.
    - You're not allowed to use `new` with it.

Native Prototypes
- Each of the built-in native constructors hs its own `.prototype` object.
- Each of these contains behviour unique to their particular object.
- `String.prototype.XYZ` is shortened to `String#XYZ` by convention.
- These work via object prototype delegation.
- You can even modify these native prototypes, bu this is a  bad idea.

- Prototypes make useful default values for parameters since they have the correct type, but are empty.
    - One advantage of this is that hese values are built-in
        - if we used, e.g., `[]` instead of `Array.prototype`, we'd have to create and then garbage collect it.
    - Must be careful not to overwrite/ modify the prototype forms, as this can led to unexpected behaviour.
    - N.B. in ES6 we could do the below more succintly by using default parameter syntax.
*/
function isThisCool(vals, fn, rx){
    vals = vals || Array.prototype;
    fn = fn || Function.prototype;
    rx = rx || RegExp.prototype;

    return rx.test(
        vals.map( fn ).join( '' )
    );
}
