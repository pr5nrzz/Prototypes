/* Exampe1
// Part1
var myObject = {
	a: 2
};

myObject.a; // 2

// Part2
var anotherObject = { a: 2 };

//create an object linked to 'anotherObject'
var myObject = Object.create(anotherObject); // myObject is now [[Prototype]] linked to anotherObject

console.log(myObject.a);

// Part3
var anotherObject = { a: 2 };

// create an object linked to 'anotherObject'
var myObject = Object.create(anotherObject);

for (var k in myObject) {
	console.log("found " + k); // found a
}

console.log("a" in myObject); // true
console.log(Object.keys(myObject));

var myObject1 = {
	get a() {
		return this._a_;
	},
	set a(val) {
		this._a_ = val;
	}
};

var myObject2 = Object.create(myObject1);

myObject2.a = 10;

console.log(myObject1.a);
console.log(myObject2);
*/

/* Example2
var anotherObject = {
	a: 2
};

var myObject = Object.create(anotherObject);

anotherObject.a; // 2
myObject.a; // 2

anotherObject.hasOwnProperty("a"); // true
myObject.hasOwnProperty("a"); // false

myObject.a++; // oops, implicit shadowing!

anotherObject.a; // 2
myObject.a; // 3

myObject.hasOwnProperty("a"); // true
*/

/* Example3
// Part1
function Foo() {

}

console.log(Foo.prototype); // what exactly is this object?

// Part2
function Foo() {
	// ...
}

var a = new Foo();
// new Foo() results in a new object (we called it a), and that new object a is internally [[Prototype]] linked to the Foo.prototype object.

Object.getPrototypeOf(a) === Foo.prototype; // true
// new Foo() results in a new object (we called it a), and that new object 'a' is internally [[Prototype]] linked to the Foo.prototype object.
// We end up with two objects, linked to each other. That’s it. We didn’t instantiate a class. We certainly didn’t do any copying of behavior from a “class” into a concrete object. 
// We just caused two objects to be linked to each other.
*/

/* Example4 
// Part1
function Foo() {
	// ...
}

var a = new Foo();

// Part2
function Foo() {
	// ...
}

console.log(Foo.prototype.constructor === Foo); // true

var a = new Foo();
console.log(a.constructor === Foo); // true

// Part3
function NothingSpecial() {
	console.log("Don't mind me!");
}

var a = new NothingSpecial();
// "Don't mind me!"

console.log(a); // {}
// NothingSpecial is just a plain old normal function, but when called with new, it constructs an object, almost as a side-effect, which we happen to assign to a. 
// The call was a constructor call, but NothingSpecial is not, in and of itself, a constructor.
// In other words, in JS, it’s most appropriate to say that a “constructor” is any function called with the new keyword in front of it.
// Functions aren’t constructors, but function calls are “constructor calls” if and only if new is used.

// Mechanics
function Foo(name) {
	this.name = name;
}

Foo.prototype.myName = function () {
	return this.name;
};

var a = new Foo("a");
var b = new Foo("b");

a.myName(); // "a"
b.myName(); // "b"

// Part3
function Foo() { }

Foo.prototype = {}; // create a new prototype object

var a1 = new Foo();
console.log(a1.constructor === Foo); // false!  “constructor does not mean constructed by”.
console.log(a1.constructor === Object); // true!

// Part4
function Foo() { }

Foo.prototype = {}; // create a new prototype object

// Need to properly "fix" the missing `.constructor`
// property on the new object serving as `Foo.prototype`.
Object.defineProperty(Foo, "constructor", {
	enumerable: false,
	writable: true,
	configurable: true,
	value: Foo
});

console.log(Foo);
*/

/* Example5
// Part1
// function Foo(name) {
// 	this.name = name;
// }

// Foo.prototype.myName = function () {
// 	return this.name;
// }

// function Bar(name, label) {
// 	// this -> new obj
// 	Foo.call(this, name);
// 	this.label = label;
// }

// // here, we make a new `Bar.prototype`
// // linked to `Foo.prototype`
// Bar.prototype = Object.create(Foo.prototype);
// // Beware! Now `Bar.prototype.constructor` is gone,
// // and might need to be manually "fixed"

// Bar.prototype.myLabel = function () {
// 	return this.label;
// }

// var a = new Bar("a", "a obj");

// console.log(a.myName());
// console.log(a.myLabel());

// Part2
// doesn't work like you want!
// Bar.prototype = Foo.prototype;

// Part3
// works kinda like you want, but with
// side-effects you probably don't want :(
// Bar.prototype = new Foo();

// Part4
// pre-ES6
// throws away default existing `Bar.prototype`
// Bar.prototype = Object.create(Foo.prototype);

// ES6+
// modifies existing `Bar.prototype`
// Object.setPrototypeOf(Bar.prototype, Foo.prototype);
// Ignoring the slight performance disadvantage (throwing away an object that’s later garbage collected) of the Object.create(..) approach,
// it’s a little bit shorter and may be perhaps a little easier to read than the ES6+ approach.
// But it’s probably a syntactic wash either way.

// Part5
function Foo() {
	// ...
}

Foo.prototype.blah = {};

var a = new Foo();

// Solution1
console.log(a instanceof Foo); // true

// With bound function
var Bar = Foo.bind(this);

var b = new Bar();
console.log(b instanceof Foo);

// Solution2
Foo.prototype.isPrototypeOf(a); // true
// Simply: does `b` appear anywhere in
// `c`s [[Prototype]] chain?
b.isPrototypeOf(c);

// Solution3
Object.getPrototypeOf(a) === Foo.prototype; // true

// Solution4
a.__proto__ === Foo.prototype; // true

// .__proto__ looks like a property, but it’s actually more appropriate to think of it as a getter/setter
Object.defineProperty(Object.prototype, "__proto__", {
	get: function () {
		return Object.getPrototypeOf(this);
	},
	set: function (o) {
		// setPrototypeOf(..) as of ES6
		Object.setPrototypeOf(this, o);
		return o;
	}
});
// when we access (retrieve the value of) a.__proto__, it’s like calling a.__proto__() (calling the getter function).
// That function call has 'a' as its this even though the getter function exists on the Object.prototype object,
// so it’s just like saying Object.getPrototypeOf( a ).
*/

/* Example6
// Part1
var foo = {
	something: function () {
		console.log("Tell me something good...");
	}
};

var bar = Object.create(foo);

bar.something(); // Tell me something good...

// Part2 (Object.create() Polyfilled)
// Object.create(..) was added in ES5. You may need to support pre-ES5 environments (like older IE’s)
if (!Object.create) {
	Object.create = function (o) {
		function F() { }
		F.prototype = o;
		return new F();
	};
}

// Part3
var anotherObject = { a: 2 };

var myObject = Object.create(anotherObject, {
	b: {
		enumerable: false,
		writable: true,
		configurable: false,
		value: 4
	},
	c: {
		enumerable: true,
		writable: false,
		configurable: false,
		value: 4
	}
});

console.log(myObject.hasOwnProperty("a")); // false
console.log(myObject.hasOwnProperty("b")); // true
console.log(myObject.hasOwnProperty("c")); // true

console.log(myObject.a); // 2
console.log(myObject.b); // 3
console.log(myObject.c); // 4

// Part4
var anotherObject = {
	cool: function () {
		console.log("cool!");
	}
};

var myObject = Object.create(anotherObject);

myObject.cool(); // "cool!"

// Part5
var anotherObject = {
	cool: function () {
		console.log("cool!");
	}
};

var myObject = Object.create(anotherObject);

myObject.doCool = function () {
	this.cool(); // internal delegation!
};

myObject.doCool(); // "cool!"
*/

/* Example7
// Part1
// class Task {
// 	id;

// 	// constructor `Task()`
// 	Task(ID) { id = ID; }
// 	outputTask() { output( id ); }
// }

// class XYZ inherits Task {
// 	label;

// 	// constructor `XYZ()`
// 	XYZ(ID,Label) { super( ID ); label = Label; }
// 	outputTask() { super(); output( label ); }
// }

// class ABC inherits Task {
// 	// ...
// }

// Part2
var Task = {
	setID: function (ID) {
		this.id = ID;
	},
	outputID: function () {
		console.log(this.id);
	}
}

// make `XYZ` delegate to `Task`
var XYZ = Object.create(Task);

XYZ.prepareTask = function (ID, Label) {
	this.setID(ID);
	this.label = Label;
}

XYZ.OutputTaskDetails = function () {
	this.outputID();
	console.log(this.label);
}

// ABC = Object.create( Task );
// ABC ... = ...
*/
