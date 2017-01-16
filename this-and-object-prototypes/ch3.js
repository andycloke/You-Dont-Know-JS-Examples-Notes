/* Chapter 3: Objects
Notes and example code from ch3 of the 'this' & Object Prototypes book in the YDKJS Series
https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch3.md

--------------------------------------------------------------------------------
SYNTAX
- There are two forms of syntax for obects, the declarative and constructed, which result in the same thing.
- The declarative (literal) form:
*/
var myObj = {
    key: value
    // ...
}
// the constructed form:
var myObj = new Object();
myObj.key = value;

/* TYPE
- There are 6 primary types:
    1. string
    2. number
    3. boolean
    4. null
    5. undefined
    6. object
- Simple primitives: string, number, boolean, null, undefined. These are not objects.
    - n.b. null is not an object, even though 'typeof null' returns '"object"'. This is a bug.
- Complex primitives: functions, arrays.

Built-in Objects ( the capitalisation is important)
- String
- Number
- Boolean
- Object
- Function
- Array
- Date
- RegEx
- Error

- These are actually built in functions, which can be used as a constructor with 'new'.
- They are not classes.
*/
var strPrimitive = 'I am a string';
typeof strPrimitive;                // 'string'
strPrimitive instanceof String;     // false

var strObject = new String( 'I am a string' );
typeof strObject;       // 'object'
strObject instanceof String;    // true

// inspect the object sub-type
Object.prototype.toString.call( strObject );    // [object String]

/*
- 'I am a strind' is a primitive value, not an object
- To perform operations on it it must be coerced into a String Object
    - we can then access properties, e.g. length/ charAt(2)
- Fortunately this is done automatically by JS when necessary.
- Better practice to use the literal form, rather than the constructed form.
    - only use the constructed form if you need the extra options it gives in creation.

CONTENTS
- Objects have a contents of values stored at specifically named locations, known as properties.
- In memory, an object container contains references (pointers) to where the values are stored,
rather than the actual values themselves.
*/
var myObject = {
    a: 2
};
myObject.a;     // 2    // usually known as property access
myObject['a'];  // 2    // usually known as key access, but the same as property access

/*
- Property names are always strings - if you use a number, it will be converted into a string:
*/
var myObject = { };

myObject[true] = 'foo';
myObject[3] = 'bar';
myObject[myObject] = 'baz';

myObject['true'];   // 'foo'
myObject['3'];      // 'bar'
myObject['[object Object]'];   // 'foo'

/* Computed Property Names
- We can use the key access syntax to use a computed expression value as the key name.
- ES6 also allows us to use a computed expression when declaring objects:
- Commonly used with ES6 'Symbol's - which have an opaque unguessable value.
*/
var prefix = 'foo';

var myObject = {
    [prefix + 'bar']: 'hello',
    [prefix + 'baz']: 'world'
}

myObject['foobar'];     // hello
myObject['foobaz'];     // world

/* PROPERTY VS METHOD
- Every time you access a property on an object, that is property access, even if you happen to get back
a function.
    - Therefore there are only properties, not methods.
- e.g.:
*/
function foo(){
    console.log( 'foo' );
}

var someFoo = foo;

var myObject = {
    someFoo: foo
};

foo;                 // function(){..}

someFoo;             // function(){..}

myObject.someFoo;    // function(){..}

/*
- someFoo and myObject.someFoo are two separate references to the same function, neither implies anything
special like the function being owned by any other object.

ARRAYS

- Arrays also use the [ ] access form, but assume numeric indexing.
- Arrays are objects, so even though each index is a +ve integer, you can also add properties.
    - But this does not change the length.
- Avoid adding properties with numeric names, as this will overwrite the corresponding indice.
*/
var myArr = [ 'foo', 42, 'bar'];
myArr[0];           // 'foo'
myArr.length;       // 3
myArr.baz = 'baz'   // add property
myArr.length;       // 3
myArr.baz;          // 'baz'

/* Duplication Objects
- For a long time there were many approaches to copying objects, such as parsing as a JSON.
- There are many issues, e.g. should we copy references to other objects/ functions or make copies of them?
- Use the ES6 Object.assign which copies one object into a target one (the first parameter) and also returns a copy:
*/
function anotherFunction(){ /*..*/ }

var anotherObject = {
    c: true
};

var anotherArray = [];

var myObject = {
    a: 2,
    b: anotherObject,       // refrence, not a copy!
    c: anotherArray,        // another reference!
    d: anotherFunction
};

var newObj = Object.assign( {}, myObject );

newObj.a;                       // 2
newObj.b == anotherObject       // true
newObj.c == anotherArray        // true
newObj.d == anotherFunction     // true

/* Property Descriptors
- As of ES5, all properties are described in terms of a property descriptor:
*/
var myObject = {
    a: 2
};

Object.getOwnPropertyDescriptor( myObject, 'a');
//  {
//      value: 2,
//      writable: true,
//      enumerableL true
//      configurable: true
//  }

// we can modify this property descriptor as so:

var myObject = {};

Object.defineProperty( myObject, 'a', {
    value: 2,                   // unlikely you'd actually set value in this manner
    writable: true,
    configurable: true,
    enumerable: true
} );

myObject.a;     // a

/* Writable
- Whether or not you can change the value of the object:
*/
var myObject = {};

Object.defineProperty( myObject, 'a', {
    value: 2,
    writable: false,
    configurable: true,
    enumerable: true
} );

myObject.a = 3;         // silently fails
myObject.a;             // 2

// error in strict mode:
'use strict'
var myObject = {};

Object.defineProperty( myObject, 'a', {
    value: 2,
    writable: false,
    configurable: true,
    enumerable: true
} );

myObject.a = 3;         // TypeError
myObject.a;             // 2

/* Configurable
- When a property is not configurable, we can no longer modify its descriptor definition using
defineProperty(..);
- It is therefore a one-way action.
- It also prevents the use of delete
*/
var myObject = {
    a: 2
};
myObject.a = 3;
myObject.a;         // 3

Object.defineProperty( myObject, 'a' {
    value: 4,
    writable: true,
    configurable: false,        // no longer configurable
    enumerable: true
} );

myObject.a;         // 4
myObject.a = 5;
myObject.a;         // 5

Object.defineProperty( myObject, 'a' {
    value: 6,
    writable: true,
    configurable: true,
    enumerable: true
} );                       // TypeError (regardless of strict mode)

delete myObject.a;  // silently fails
myObject.a;         // 2

/* Enumerable
- determines whether a property will show up in certain object-property enumerations, e.g. for..in loops
- default value: true



IMMUTABILITY

- sometimes you want to make properties/ objects that cannot be change.
- This can be done using one of the following approaches.

Object Constant
- combine 'writable: false' & 'configurable: false' to create a constant:
*/
var myObject = {};
Object.defineProperty( myObject, 'FAVOURITE_NUMBER', {
    value: 42,
    writable: false,
    configurable: false
} );

/* Prevent Extensions
- prevent an object from having new properties added to it, but otherwise leave as is:
*/
var myObject = {
    a: 2
};

Object.preventExtensions( myObject );

myObject.b = 3;
myObject.b;         // undefined

/* Seal
- Object.seal essentially calls Object.preventExtensions() and an object and sets all its existing properties
to configurable: false.
- So you no longer add properties, or reconfigure/ delete existing ones, but you can modify their values.

Freeze
- Object.freeze essentially calls Object.seal as well as setting all propertis to writable:f false.
- So creates a forzen object which is completely immutable - you can only read it.
- Remember that if the object contains references to other objects/ functions, these will still be muttable.
    - To 'deep freeze' an object, you would have to recursively freeze the object at each reference.
