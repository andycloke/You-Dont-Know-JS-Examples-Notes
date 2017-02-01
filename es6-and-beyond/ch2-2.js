/* Chapter 2: Syntax (part 2 of 2)
Notes and example code from ch2 of the ES6 & Beyond book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20%26%20beyond/ch2.md

--------------------------------------------------------------------------------
Object Literal Extensions
- ES6 adds some convenient extensions to the {..} object literal syntax.

Concise Properties
Can now replace this:            */
var x = 2, y = 3,
    o = {
        x: x,
        y: y
    };

// with this:
var x = 2, y = 3,
    o = {
        x,
        y
    };

// Concise Methods
// fomerly:
var o = {
    x: function(){
        // ..
    },
    y: function(){
        // ..
    }
}

// we can now do:
var o = {
    x() {
        // ..
    },
    y() {
        // ..
    }
}

// we can do consise generator methods:
var o = {
    *foo() { .. }
};
/*
- These concise method names should not be used if doing recursion or event binding/ unbinding, since
they are equivalent to anonymous functions in pre-ES6 syntax, which do not work for recursion
(without lots of hacky and confusing `this` binding).

ES5 Getter/ Setter
- Getters/ setters added in ES5 but lack of transpilers meant they weren't used much.
    => Very much like a new ES6 feature.    */
var o = {
    _id: 10,
    get id() { return this._id++; },
    set id(v) { this._id = v; }
}

o.id;           // 10
o.id;           // 11
o.id = 20;
o.id;           // 20

o._id;          // 21 (and doesn't increment after returning 21, since we have't used the getter)
o._id;          // 21 - still!

// Computed Property Names
// Previously when you had a property name that came from an expression you had to do it as:

var prefix = 'user_';

var o = {
    baz: function(..){ .. };
};

o[ prefix + 'foo' ] = function(..){ .. };
o[ prefix + 'bar' ] = function(..){ .. };
//..

// in ES6 we can do it like this:
var prefix = '_user';

var o = {
    baz: function(..){ .. },
    [ prefix + 'foo' ]: function(..){ .. },
    [ prefix + 'bar' ]: function(..){ .. }
    // ..
};

// Setting [[Prototype]]
// Largely for compatibility reasons, an object's protoype can be set as so:

var o1 = {
    // ..
};

var o2 = {
    _proto_: o1,
    // ..
};

// Alternatively we could have omitted the `_proto_: o1` line and this could be as:
Object.setPrototypeOf( o2, o1 );

// Object super
var o1 = {
    foo() {
        console.log( 'o1:foo' );
    }
};

var o2 = {
    foo() {
        super .foo();
        console.log( 'o2:foo' );
    }
};

o2.foo();       // o1:foo
                // o2:foo

/* Template Literals
- Badly named - nothing to do with templating engines (handlebars etc).
- Should think of as 'interpolated string literals' - interpoliterals.
Old method:     */

var name = 'Kyle';

var greeting = 'Hello ' + name + '!'

console.log( greeting );            // 'Hello Kyle'
console.log( typeof greeting );     // 'string'

// ES6 template literal/ interpoliteral:

var name = 'Kyle';

var greeting = `Hello ${name}!`;

console.log( greeting );            // 'Hello Kyle'
console.log( typeof greeting );     // 'string'

// The `` ensure it is a string literal and the ${..} is parsed and evaluated inline.
// Interpolated string literals allows us to preserve new line breaks;

var text =
`Now is the time for all good men
to come to the aid of their
country!`

console.log( text );
// Now is the time for all good men
// to come to the aid of their
// country!

// You can do function calls etc from within interpolated string expressions:

function upper(s) {
    return s.toUpperCase();
}

var who = 'reader';

var text =
`A very ${upper( 'warm' )} welcome
to all of you ${upper( `${who}s` )}!`;      // n.b the inner `` to parse who into its string form

// Tagged Template Literals
// Should be renamed as tagged string literals.
function foo(strings, ...values) {
    console.log( strings );
    console.log( values );
}

var desc = 'awesome';

foo`Everything is ${desc}!`;
// [ 'Everything is ', '!']
// ['awesome']

/* The foo here is very surprising - it is a special kind of function call that doesn't
need the ( .. ).
- The foo part before the `..` is known as the tag. it is a function value that shown be called.
- What is passed to this function?
    1. The first argument (strings) is any plain strings between the ``.
    2. The second argument is anything else, which is gathered up with the ... operator.
- Typically this function should comput an appropriate an string value.     */
function tag(strings, ...values) {
    return strings.reduce( function(s,v,idx) {
        return s + (idx > 0 ? values[idx-1] : '') + v;
    }, '');
}

var desc = 'awesome';

var text = tag`Everything is ${desc}!`;

console.log( text );

// Raw strings - ES6 includes the following built-in function:

console.log( `Hello\nWorld`);
// Hello
// World

console.log( String.raw`Hello\nWorld`);
// Hello\nWorld

String.raw`Hello\nWorld`
// 12

// Arrow Functions

function foo(x,y) {
    return x + y;
}

// can be expressed in ES6 as:
var foo = (x,y) => x + y;

// The arrow function is everything from `(x,y)` onwards, it just happens to be assigned to foo.

// Other arrow functions:
var f1 = () => 12;
var f2 = x => x * 2;
var f3 = (x,y) => {
    var z = x * 2 + y;
    y++;
    x *= 3;
    return (x + y + z) / 2;
};
/*
- Arrow functions are always function expressions, not function declarations.
- They are anonymous function expressions - they have no named reference for the purposes of
recursion or event binding/ unbinding.
- Arrow functions are for short, single statement utility (callback) functions:
*/
var a = [1,2,3,4,5];

a = a.map( v => v * 2 );    // [2,4,6,8,10]

/*
- Arrow functions for longer functions might not improve much, and the lack of `return` and
the outer {..} can even worsen readability.
- Loosely, the readability gains of using arrow function notation are inversely proportional to the
length of the function.

- Arrow function's primary purpose is to alter the behaviour of `this` in a specific way.   */
var controller = {
    makeRequest: function(..){
        var self = this;

        btn.addEventListener( 'click', function(){
            //..
            self.makeRequest(..);
        }, false );
    }
};
/*
- The `var self = this` hack allows us to ensure that the `this` binding in the addEventListener callback
function is the same as that within makeRequest(..) itself.
- We avoid the dynamic nature of `this` bindings, and fall back to the predictability of lexical scope.

- `this` bindings in arrow functions have lexical scope, rather than being dynamic:     */
var controller = {
    makeRequest: function(..){
        btn.addEventListener( 'click', () => {
            // ..
            this.makeRequest(..);
        }, false ;)
    }
};
/*
- We should therefore also use arrow functions for inner function expressions that rely on either
the `var self = this` or `.bind(this)` hacks.
    - N.B. But not when we don't- as this will cause issues.

- We should also use them for short, single-statement inline function expressions in order to
improve readability, as discussed above.

for..of Loops
- a for..of loop loops over the set of values produced by an iterator.
- The value you loop over with must be an iterable, or a value that can be coerced to an object
that is an iterable.
- An interable is simply an object that is able to produce an iterator.

Comparing for..of with for..in:     */
var a= [ 'a', 'b', 'c', 'd', 'e' ];

for (var idx in a) {
    console.log( idx );
}
// 0 1 2 3 4

for (var val of a) {
    console.log( val );
}
// 'a' 'b' 'c' 'd' 'e'

/*
Standard Iterables:
1. Arrays
2. Strings
3. Generators
4. Collections/ TypedArrays
*/

for (var c of 'hello') {
    console.log( c );
}
// 'h' 'e' 'l' 'l' 'o'

/* 'hello' primitive value is coerced/ boxed to the String object wrapper, which is an iterable

Regular Expressions

Unicode Flag
The `u` flag tells the regex to process a string with the interpretation of Unicode (UTF-16)
characters, rather than the default 16-bit Basic Multilingual Plane (BMP).

Sticky Flag
- The `y` flag in a Regex is called 'sticky mode' - it means that the regular expression has a virtual
anchor at its beginning that keeps it rooted to matching at only the position indicated by the regex's
lastIndex property.

Without sticky mode:            */
var re1 = /foo/, str = '++foo++';

re1.lastIndex;          // 0 (starts at 0)
re1.test( str );        // true
re1.lastIndex;          // 0 -  not updated

re1.lastIndex = 4;
re1.test( str );        // true - ignored `lastIndex`
re1.lastIndex;          // 4 -  not updated

// 1. `test(..)` does not pay attention to `lastIndex`'s value, just searches from the beginning.
// 2. Because our regex doesn't have a `^` start-of-input anchor, the search for 'foo' looks through the whole string.
// 3. `lastIndex(..)` is not updated by the test.
var re1 = /foo/y, str = '++foo++';

re1.lastIndex;          // 0 (starts at 0)
re1.test( str );        // false - 'foo' not found at `0`
re1.lastIndex;          // 0 -  not updated

re1.lastIndex = 2;
re1.test( str );        // true
re1.lastIndex;          // 5 - updated to after previous match

re1.test( str );        // false
re1.lastIndex;          // 0 - reset after previous match failure
/*
1. `test(..)` uses `lastIndex` as the exact and only position in `str` to look to make a match.
2. If a match is made, `test(..)` updates `lastIndex` to point to the character immediately following
the match. If the match if fails, `test(..)` resets `lastIndex` to 0.
