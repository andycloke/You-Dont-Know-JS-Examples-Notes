/* Chapter 4: Mixing (Up) 'Class' Objects
Notes and example code from ch4 of the 'this' & Object Prototypes book in the YDKJS series
https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch4.md

--------------------------------------------------------------------------------

CLASS THEORY
- Object oriented (OO) / class oriented programming takes into account that data has
some behaviour intrinsically associated with it.
- The aim is to package the data and behaviour together in classes, which package and classify the
data and common behaviours.

JavaScript Classes
- JavaScript doesn't actually have classes, but provides the illusion of them with various syntactic
and design patterns.

CLASS MECHANICS

Building
- A class is a blue-print.
    - To actually get a object we must instantiate (build) something from the class (blue-print).
- An object is a 'copy' of all the characteristics described by the class.

- A class is instantiated into object form by a copy operation.

Constructor
- Instances of classes rely on a special method of a class, called a constructor to initalise any state
that the instance will need.
- Typically the constructor is a method with the same name as the class.
- Pseudo-code:
*/
class CoolGuy{
    specialTrick = nothing

    CoolGuy(trick){
        specialTrick = trick
    }

    showOff(){
        output( "Here's my trick: ", specialTrick )
    }
}
Joe = new CoolGuy( 'Jumping Rope' )
Joe.showOff();                      // Here's my trick: jumping Rope

/* CLASS INHERITANCE
- In class-oriented languages, classes inherit (copies) the properties & methods of their parent classes.
- Child classes can then go on to have different behaviours etc without affecting the parent class.
- Examlple in pseudo-code (constructors omitted for brevity):
*/
class Vehicle {
    engines = 1

    ignition(){
        output( 'Turning on my eninge.' )
    }

    drive(){
        ignition()
        output( 'Steering and moving forward!' )
    }
}

class Car inherits Vehicle {
    wheels = 4

    drive(){
        inherited: drive()
        output('Rolling on all ', wheels, ' wheels!' )
    }
}

class SpeedBoat inherits Vehicle {
    engines = 2

    ignition(){
        output( 'Turning on my ', engines, ' engines.')
    }

    pilot(){
        inherited: drive()
        output( 'Speeding through the water with ease!' )
    }
}
/* Polymorphism
- Polymorphism is when a child class inherits and overwrites a method from a parent class.
- The the case of `Car` and the `drive()` method, it is relative polymorphism, since we don't absolutely
define the inheritence level, we just say `inherited` and take that to mean 'inherit from the class immediately above'
- Many languages use `super` instead of `inherited`
- `super` is also a way for clsses to inherit the constructor of their parent class.
- With real classes, the constructor belongs to the class.
- In JavaScript, we should thing of 'classes' as belonging to constructor., rather than the other way around.

- N.B. above - in Speedboat's inherited drive() method, it will call the SpeedBoat version of ignition.

- Classes are not linked to their parent classes, they simply make an initial copy. Once we start to overwrite methods
there is no effect on the equivalent methods in the original, parent class.

Multiple Inheritance
- In some languages classes can inherit from multiple parents.
- This raises problematic questions, such as: if a class inherits two different implementations of the same method,
which should it use?
- JavaScript does not provide a native mechanism for multiple inheritance.

MIXINS
- JS objects can be instantiated like classes.
- JS objects cannot be copied, only linked, so we use "mixin"s to fake the copying behaviour.

Explicit Mixins
- we can manually create a (simple) function called mixin(..) for copying classes.
    - often called extend(..) by libraries.
- There are no classes in JS, so we use objects.
- Car has a reference to each of Vehicle's functions, rather than copies.
*/
// super simple mixin(..) example
function mixin( sourceObj, targetObj ){
    for (var key in sourceObj){
        // only copy if not already present
        if (!(key in targetObj)){
            targetObj[key] = sourceObj[key];
        }
    }
    return targetObj;
}

var Vehicle = {
    engines: 1,

    ignition: function(){
        console.log('Turning on my engine');
    },

    drive: function(){
        this.ignition();
        console.log( 'Steering and moving forward');
    }
};

var Car = mixin( Vehicle, {
    wheels: 4,

    drive: function(){
        Vehicle.drive.call( this );
        console.log( 'Rolling on all ' + this.wheels + ' wheels!');
    }
} );

/* Polymorphism Revisited
- Car already has a drive property function (method) so that property reference is not overwritten.
- Vehicle.drive.call( this ); is equivalent to `drive: inherited` in our pseudo-code
- Vehicle.drive() would have a `this` binding of the Vehicle object, but we want it to be the Car object,
so we use .call( this ).
- Can think of this as 'explicit polymorphism'.
- N.B. we need to do this because we chose 'drive' as the function name, and so `mixin` won't make a copy of it.
- Signicant costs in terms of maintenance - best to avoid.

- Again, JS objects fail to copy function objects in the way class-oriented langages do, they simply copy
references to those function objects.
- Not much benefit is actually gained from using mixins, as opposed to just defining the poperties twice.

Parasitic Inheritance
- A variation on this explicit mixin pattern with uses both implicit & explicit inheritance.
*/
// "Traditional JS Class" `Vehicle`
function Vehicle(){
    this.engines = 1;
}
Vehicle.prototype.ignition = function(){
    console.log('Turning on my engine');
};
Vehicle.prototype.drive = function(){
    this.ignition();
    console.log('Steering and moving forward');
};

// "Parasitic Class" `Car`
function Car(){
    // first, `car` is a `Vehicle`
    var car = new Vehicle();

    // modify our `car` in orde to specialise it
    car.wheels = 4;

    // save a priviliged reference to `Vehicle::drive()`
    var vehDrive = car.drive;

    // overrise `Vehicle::drive()`
    car.drive = function(){
        vehDrive.call( this );
        console.log('Rolling on all ' + this.wheels + ' wheels!');
    };

    return car;
}

var myCar = new Car();

myCar.drive();
// Turning on my engine.
// Steering and moving forward
// Rolling on all 4 wheels!

/* Implicit Mixins
*/
var Something = {
    cool: function(){
        this.greeting = 'Hello World',
        this.count = this.count ? this.count + 1 : 1;
    }
};
Something.cool();
Something.greeting;     // 'Hello World'
Something.count;        // 1

var Another = {
    cool: function(){
        // implicit mixin of `Something` to `Another`
        Something.cool.call( this );
    }
};
Another.cool();
Another.greeting;       // 'Hello World'
Another.count;          // 1 (not shared state with `Something`)
/*
- `Something.cool.call( this );` would more typically be in a constructor rather than a method
- `Something.cool()` is borrowed and makes assignments agaisnt the Another object rather than the Something object

- Dangers are that the `Something.cool.call( this );` call is brittle - cannot be made into a relative (and therefore
more flexible) reference.
*/
