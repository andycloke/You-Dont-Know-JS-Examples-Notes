/* Chapter 6: Behaviour Delegation
Notes and example code from ch6 of the 'this' & Object Prototypes book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch6.md

--------------------------------------------------------------------------------

TOWARDS DELEGATION-ORIENTED DESIGN
- We can use a comparison of class-based design and delegation-oriented design in order to examine
why we need to use delegation-oriented design in JS.

Class Theory
- When using classes we take full advantage of inheritance, so that child classes can make copies of parent
class behaviour.
- Pseudo-code:
*/
class Task{
    id;

    // constructor
    Task(ID) { id = ID; }

    outputTask() { output( id ); }

}

class XYZ inherits Task {
    label;

    //constructor
    XYZ(ID, Label) { super( ID ); label = Label; }

    outputTask(){ super(); output( label ); }
}

class ABC inherits Task {
    // ...etc
}
/*
- Instance of the XYZ child class will have copies of both the Task methods/ props and the XYZ defined methods/ props

Delegation Theory
- Imagine task XYZ as needing behaviours from two sibling objects, `XYZ` and `Task` to accomplish it.
- But rather than composing them together, via class copies, we leave them as seperate objects, and allow `XYZ`
to delegate to `Task` when needed.
*/
var Task = {
    setID: function(ID) { this.id = ID; },
    outputID: function() { console.log( this.ID ); }
};

// make `XYZ` [[Prototype]] delegate to `Task`
var XYZ = Object.create( Task );

XYZ.prepareTask = function(ID, Label){
    this.setID( ID );
    this.label = Label;
};

XYZ.outputTaskDetails = function(){
    this.outputID();
    console.log( this.label );
};
/*
- `Task` and `XYZ` are not classes/ functions, but simply objects.
- Can think of as OLOO programming - "object linked to other objects"
- Differences:

    1. You want state to be on delegators: both `id` and `label` are data properties on `XYZ`, not `Task`

    2. In class based design, we intentionally name things the same in order to utilise polymorphism.
    With behaviour delegation based design, we need to avoid doing this to avoid shadowed properties.

    3. The general utility methods that exist on `Task` are  available when interacting with `XYZ`
        - `this.setID(ID)` looks for `setID(..)` on `XYZ`, doesn't find it, and follows the [[Prototype]]
        chain to `Task` where it finds it. The implicit binding at the call site when `setID` runs
        (e.g. it will be `XYZ.setID(..)`) means it will operate on the `XYZ` object, rather than `Task`.
        - Same appies for `this.outputID(..)`

Mutual Delegation (Disallowed)
- You cannot make B linked to A and A linked to B.
- This would be useful in a few niche cases, but the issue is that if an object was not found on either A or B you'd
get an infinite recursion on the [[Prototype]] loop.

Mental Models Compared

/*
- this snippet uses classical OO style:
*/
function Foo(who){
    this.me = who;
}
Foo.prototype.identify = function(){
    return 'I am' + this.name;
};

function Bar(who) {
    Foo.call( this, who );
}

Bar.prototype = Object.create( Foo.prototype );

Bar.prototype.speak = function(){
    alert('Hello, ' + this.identify() + '.');
};

var b1 = new Bar( 'b1' );
var b2 = new Bar( 'b2' );

b1.speak();
b2.speak();

// exact same functionality using OLOO:

var Foo = {
    init: function(who){
        this.me = who;
    },
    identify: function(){
        return 'I am ' + this.me;
    }
};

var Bar = Object.create( Foo );

Bar.speak = functio(){
    alert('Hello, ' + this.identify() + '.');
};

var b1 = Object.create( Bar );
b1.init( 'b1' );

var b2 = Object.create( Bar );
b2.init( 'b2' );

b1.speak();
b2.speak();

/*
- We still have the 3 objects linked together, but we've greatly simplified what we would need to keep
track of if we treated things that are not classes as though they are.

CLASSES VS OBJECTS

- Let's create a widget & button, where the button inherits/ delegates to widget to show the differences between
the common pseudo-class based design, and our new OLOO design.

Classic JS 'class' based design (with jQuery):
*/
// Parent class
function Widget(width,height){
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
}

Widget.prototype.render = function($where){
    if (this.$elem){
        this.$elem.css( {
            width: this.width + 'px',
            height: this.height + 'px'
        } ).appendTo( $where );
    }
};

// Child class
function Button(width,height,label) {
    //'super' constructor call
    Widget.call( this, width, height );
    this.label = label || 'Default';

    this.$elem = $( '<button>' ).text( this.label );
}

// make Button "inherit" from Widget
Button.prototype = Object.create( Widget.prototype );

// override base "inherited" `render(..)`
Button.prototype.render = function($where){
    // "super" call
    Widget.prototype.render.call( this, $where );
    this.$elem.click( this.onClick.bind( this ));
};

Button.prototype.onClick = function(evt){
    console.log( 'Button ' + this.label + ' clicked!');
}

$( document ).ready( function(){
    var $body = $( document.body );
    var btn1 = new Button( 125, 30, 'Hello');
    var btn2 = new Button( 150, 40, 'World');

    btn1.render( $body );
    btn2.render( $body );
} );

// ES6 `class` sugar (with jQuery) cleans this up, but it is still flawed under the hood:
class Widget {
    constructor(width,height){
        this.width = width || 50;
        this.height = height || 50;
        this.$elem = null;
    }
    render($where){
        if (this.$elem){
            this.$elem.css( {
                width: this.width + 'px',
                height: this.height + 'px'
            } ).appendTo( $where );
        }
    }
}

class Button extends Widget {
    constructor(width,height,label){
        super( width, height );
        this.label = label || 'Default';
        this.$elem = $('<button>').text( this.label );
    }
    render($where) {
        super.render( $where );
        this.$elem.click( this.onClick.bind( this ) );
    }
    onClick(evt){
        console.log( 'Button ' + this.label + ' clicked!');
    }
}
$( document ).ready( function(){
    var $body = $( document.body );
    var btn1 = new Button( 125, 30, 'Hello');
    var btn2 = new Button( 150, 40, 'World');

    btn1.render( $body );
    btn2.render( $body );
} );
/*
- Despite appearances, these are not real classes. They still rely on the [[Prototype]] mechanism.
- Let's try the equivalent in OLOO (with jQuery):
*/
var Widget = {
    init: function(width,height){
        this.width = width || 50;
        this.height = height || 50;
        this.$elem = null;
    },
    insert: function($where){
        if (this.$elem){
            this.$elem.css( {
                width: this.width + 'px',
                height: this.height + 'px'
            } ).appendTo( $where );
        }
    }
};

var Button = Object.create( Widget );

Button.setup = function(width,height,label){
    // delegated call
    this.init( width, height );
    this.label = label || 'Default';

    this.$elem = $('<button>').text( this.label );
};
Button.build = function($where) {
    // delegated call
    this.insert( $where );
    this.$elem.click( this.onClick.bind( this ) );
}
Button.onClick = function(evt){
    console.log( 'Button ' + this.label + ' clicked!');
};

$( document ).ready( function(){
    var $body = $( document.body );

    var btn1 = Object.create( Button );
    btn1.setup( 125, 30, 'Hello');

    var btn2 = Object.create( Button );
    btn2.setup( 150, 40, 'World');

    btn1.build( $body );
    btn2.build( $body );
} );
/*
- Widget & Button are not parent and child. They are two seperate objects.
- Button occasionally delegates to Widget.
*/
