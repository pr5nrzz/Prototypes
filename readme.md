-> Objects in JavaScript have an internal property, denoted in the specification as [[Prototype]], which is simply a reference to another object. Almost all objects are given a non-null value for this property, at the time of their creation.

Q. What is the [[Prototype]] reference used for?
A. -> We examined the [[Get]] operation that is invoked when you reference a property on an object, such as myObject.a in Example1 (Part1). For that default [[Get]] operation, the first step is to check if the object itself has a property 'a' on it, and if so, it’s used.
-> But if 'a' isn’t present on 'myObject' that brings our attention now to the [[Prototype]] link of the object. The default [[Get]] operation proceeds to follow the [[Prototype]] link of the object if it cannot find the requested property on the object directly.
-> In Part2, clearly myObject.a doesn’t actually exist, but nevertheless, the property access succeeds (being found on anotherObject instead) and indeed finds the value 2. 
-> But, if 'a' weren’t found on 'anotherObject' either, its [[Prototype]] chain, if non-empty, is again consulted and followed. This process continues until either a matching property name is found, or the [[Prototype]] chain ends. If no matching property is ever found by the end of the chain, the return result from the [[Get]] operation is 'undefined'.
-> Similar to this [[Prototype]] chain look-up process, if you use a for..in loop to iterate over an object, any property that can be reached via its chain (and is also enumerable) will be enumerated. See Part3.
-> If you use the 'in' operator to test for the existence of a property on an object, in will check the entire chain of the object (regardless of enumerability).

Q. But where exactly does the [[Prototype]] chain “end”?
A. -> The top-end of every normal [[Prototype]] chain is the built-in Object.prototype. This object includes a variety of common utilities used all over JS, because all normal (built-in, not host-specific extension) objects in JavaScript “descend from” (aka, have at the top of their [[Prototype]] chain) the Object.prototype object.

Setting & Shadowing Properties:
-------------------------------
myObject.foo = "bar";
-> If the myObject object already has a normal data accessor property called 'foo' directly present on it, the assignment is as simple as changing the value of the existing property.
-> If 'foo' is not already present directly on myObject, the [[Prototype]] chain is traversed, just like for the [[Get]] operation. If 'foo' is not found anywhere in the chain, the property 'foo' is added directly to 'myObject' with the specified value, as expected.
-> However, if 'foo' is already present somewhere higher in the chain, nuanced (and perhaps surprising) behavior can occur with the myObject.foo = "bar" assignment.
-> If the property name 'foo' ends up both on myObject itself and at a higher level of the [[Prototype]] chain that starts at myObject, this is called 'shadowing'. The 'foo' property directly on myObject shadows any 'foo' property which appears higher in the chain, because the myObject.foo look-up would always find the 'foo' property that’s lowest in the chain.
-> We will now examine three scenarios for the myObject.foo = "bar" assignment when foo is not already on myObject directly, but is at a higher level of myObject’s [[Prototype]] chain:
    1. If a normal data accessor property named 'foo' is found anywhere higher on the [[Prototype]] chain, and it’s not marked as read-only (writable:false) then a new property called 'foo' is added directly to myObject, resulting in a shadowed property.
    2. If a 'foo' is found higher on the [[Prototype]] chain, but it’s marked as read-only (writable:false), then both the setting of that existing property as well as the creation of the shadowed property on myObject are disallowed. If the code is running in strict mode, an error will be thrown. Otherwise, the setting of the property value will silently be ignored. Either way, no shadowing occurs.
    3. If a foo is found higher on the [[Prototype]] chain and it’s a setter, then the setter will always be called. No 'foo' will be added to (aka, shadowed on) myObject, nor will the 'foo' setter be redefined.
    Note: If you want to shadow foo in cases #2 and #3, you cannot use = assignment, but must instead use Object.defineProperty(..) to add 'foo' to myObject.
    Note: In Example2, Though it may appear that myObject.a++ should (via delegation) look-up and just increment the anotherObject.a property itself in place, instead the ++ operation corresponds to myObject.a = myObject.a + 1. The result is [[Get]] looking up a property via [[Prototype]] to get the current value 2 from anotherObject.a, incrementing the value by one, then [[Put]] assigning the 3 value to a new shadowed property a on myObject. Oops!

Q. Why does one object need to link to another object? What’s the real benefit? 
A. -> In JavaScript, there are no abstract patterns/blueprints for objects called “classes” as there are in class-oriented languages. JavaScript just has objects.
-> In fact, JavaScript is almost unique among languages as perhaps the only language with the right to use the label “object oriented”, because it’s one of a very short list of languages where an object can be created directly, without a class at all.
-> In JavaScript, classes can’t (being that they don’t exist!) describe what an object can do. The object defines its own behavior directly. There’s just the object.
-> In JS, all functions by default get a public, non-enumerable property on them called 'prototype', which points at an otherwise arbitrary object.
-> In Example3 (Part1), this object is often called “Foo’s prototype”, because we access it via an unfortunately-named Foo.prototype property reference.
-> In Part2, When 'a' is created by calling new Foo(), one of the things that happens is that 'a' gets an internal [[Prototype]] link to the object that Foo.prototype is pointing at.
-> In JavaScript, we don’t make copies from one object (“class”) to another (“instance”). We make links between objects. This mechanism is often called “prototypal inheritance”.

Constructors:
-------------
Q. In Example4 (Part1), what exactly leads us to think Foo is a “class”?
A. -> For one, we see the use of the new keyword, just like class-oriented languages do when they construct class instances.
-> For another, it appears that we are in fact executing a constructor method of a class, because Foo() is actually a method that gets called, just like how a real class’s constructor gets called when you instantiate that class.
-> In Part2, to further the confusion of “constructor” semantics, the Foo.prototype object by default gets a public, non-enumerable property called .constructor, and this property is a reference back to the function (Foo in this case) that the object is associated with.
-> Moreover, we see that object 'a' created by the “constructor” call new Foo() seems to also have a property on it called .constructor which similarly points to “the function which created it”.
Note: This is not actually true. 'a' has no .constructor property on it, and though a.constructor does in fact resolve to the Foo function, “constructor” does not actually mean “was constructed by”, as it appears.
-> In Mechanics example, this.name = name: adds the .name property onto each object (a and b, respectively; ), similar to how class instances encapsulate data values.
-> Foo.prototype.myName = ...: perhaps the more interesting technique, this adds a property (function) to the Foo.prototype object. Now, a.myName() works, but perhaps surprisingly. How?
-> What actually happens is that, a and b each end up with an internal [[Prototype]] linkage to Foo.prototype. When myName is not found on a or b, respectively, it’s instead found (through delegation) on Foo.prototype.

    “Constructor” Redux":
    --------------------
    -> a.constructor === Foo being true means that 'a' has an actual .constructor property on it, pointing at Foo? Not correct.
    -> In actuality, the .constructor reference is also delegated up to Foo.prototype, which happens to, by default, have a .constructor that points at Foo.
    -> It seems awfully convenient that an object 'a' “constructed by” Foo would have access to a .constructor property that points to Foo. But that’s nothing more than a false sense of security. It’s a happy accident, almost tangentially, that a.constructor happens to point at Foo via this default [[Prototype]] delegation.
    -> Another misconception is that the .constructor property on Foo.prototype is only there by default on the object created when Foo the function is declared. If you create a new object, and replace a function’s default .prototype object reference, the new object will not by default magically get a .constructor on it. See Part3.
    -> Object(..) didn’t “construct” a1 did it? It sure seems like Foo() “constructed” it.
    -> What’s happening? a1 has no .constructor property, so it delegates up the [[Prototype]] chain to Foo.prototype. But that object doesn’t have a .constructor either (like the default Foo.prototype object would have had!), so it keeps delegating, this time up to Object.prototype, the top of the delegation chain. That object indeed has a .constructor on it, which points to the built-in Object(..) function.
    -> Of course, you can add .constructor back to the Foo.prototype object, but this takes manual work, especially if you want to match native behavior and have it be non-enumerable. See Part4.

(Prototypal) Inheritance:
-------------------------
-> In Example5 (Part1), Bar.prototype = Object.create( Foo.prototype ). Object.create(..) creates a “ object’s internnew” object out of thin air, and links that newal [[Prototype]] to the object you specify (Foo.prototype in this case).
-> When function Bar() { .. } is declared, Bar, like any other function, has a .prototype link to its default object. But that object is not linked to Foo.prototype like we want. So, we create a new object that is linked as we want, effectively throwing away the original incorrectly-linked object.
Note: A common mis-conception/confusion here is that either of the following approaches would also work, but they do not work as you’d expect:
    1. In Part2, Bar.prototype = Foo.prototype doesn’t create a new object for Bar.prototype to be linked to. It just makes Bar.prototype be another reference to Foo.prototype, which effectively links Bar directly to the same object as Foo links to: Foo.prototype. This means when you start assigning, like Bar.prototype.myLabel = ..., you’re modifying not a separate object but the shared Foo.prototype object itself, which would affect any objects linked to Foo.prototype. This is almost certainly not what you want. If it is what you want, then you likely don’t need Bar at all, and should just use only Foo and make your code simpler.
    2. In Part3, Bar.prototype = new Foo() does in fact create a new object which is duly linked to Foo.prototype as we’d want. But, it uses the Foo(..) “constructor call” to do it. If that function has any side-effects (such as logging, changing state, registering against other objects, adding data properties to this, etc.), those side-effects happen at the time of this linking (and likely against the wrong object!), rather than only when the eventual Bar() “descendants” are created, as would likely be expected.
-> So, we’re left with using Object.create(..) to make a new object that’s properly linked, but without having the side-effects of calling Foo(..). The slight downside is that we have to create a new object, throwing the old one away, instead of modifying the existing default object we’re provided.
-> It would be nice if there was a standard and reliable way to modify the linkage of an existing object. Prior to ES6, there’s a non-standard and not fully-cross-browser way, via the .__proto__ property, which is settable. ES6 adds a Object.setPrototypeOf(..) helper utility, which does the trick in a standard and predictable way. Refer Part4.

    Inspecting “Class” Relationships:
    ---------------------------------
    -> What if you have an object like 'a' and want to find out what object (if any) it delegates to? Inspecting an instance (just an object in JS) for its inheritance ancestry (delegation linkage in JS) is often called introspection (or reflection) in traditional class-oriented environments.
    -> In Part5, How do we then introspect 'a' to find out its “ancestry” (delegation linkage)?:
        1. In Solution1, The instanceof operator takes a plain object as its left-hand operand and a function as its right-hand operand. The question instanceof answers is: in the entire [[Prototype]] chain of a, does the object arbitrarily pointed to by Foo.prototype ever appear? Unfortunately, this means that you can only inquire about the “ancestry” of some object (a) if you have some function (Foo, with its attached .prototype reference) to test with. If you have two arbitrary objects, say a and b, and want to find out if the objects are related to each other through a [[Prototype]] chain, instanceof alone can’t help.
        Note: If you use the built-in .bind(..) utility to make a hard-bound function, the function created will not have a .prototype property. Using instanceof with such a function transparently substitutes the .prototype of the target function that the hard-bound function was created from. It’s fairly uncommon to use hard-bound functions as “constructor calls”, but if you do, it will behave as if the original target function was invoked instead, which means that using instanceof with a hard-bound function also behaves according to the original function.
        2. Notice that in this case, we don’t really care about (or even need) Foo, we just need an object (in our case, arbitrarily labeled Foo.prototype) to test against another object. The question isPrototypeOf(..) answers is: in the entire [[Prototype]] chain of a, does Foo.prototype ever appear? Same question, and exact same answer. But in this second approach, we don’t actually need the indirection of referencing a function (Foo) whose .prototype property will automatically be consulted.
        3. We can also directly retrieve the [[Prototype]] of an object.
        4. The strange .__proto__ (not standardized until ES6!) property “magically” retrieves the internal [[Prototype]] of an object as a reference, which is quite helpful if you want to directly inspect (or even traverse: .__proto__.__proto__...) the chain.

Object Links:
-------------
Q. What’s the point of the [[Prototype]] mechanism? Why is it so common for JS developers to go to so much effort (emulating classes) in their code to wire up these linkages?
A. -> In Example6 (Part1), Object.create(..) creates a new object (bar) linked to the object we specified (foo), which gives us all the power (delegation) of the [[Prototype]] mechanism, but without any of the unnecessary complication of new functions acting as classes and constructor calls, confusing .prototype and .constructor references, or any of that extra stuff.
Note: Object.create(null) creates an object that has an empty (aka, null) [[Prototype]] linkage, and thus the object can’t delegate anywhere. Since such an object has no prototype chain, the instanceof operator (explained earlier) has nothing to check, so it will always return false. These special empty-[[Prototype]] objects are often called “dictionaries” as they are typically used purely for storing data in properties, mostly because they have no possible surprise effects from any delegated properties/functions on the [[Prototype]] chain, and are thus purely flat data storage.
-> We don’t need classes to create meaningful relationships between two objects. The only thing we should really care about is objects linked together for delegation, and Object.create(..) gives us that linkage without all the class cruft.
-> In Part2, This usage of Object.create(..) is by far the most common usage, because it’s the part that can be polyfilled. There’s an additional set of functionality that the standard ES5 built-in Object.create(..) provides, which is not polyfillable for pre-ES5.
-> In Part3, The second argument to Object.create(..) specifies property names to add to the newly created object, via declaring each new property’s property descriptor. Because polyfilling property descriptors into pre-ES5 is not possible, this additional functionality on Object.create(..) also cannot be polyfilled.

    Links As Fallbacks?:
    --------------------
    -> It may be tempting to think that these links between objects primarily provide a sort of fallback for “missing” properties or methods. While that may be an observed outcome, but this is not the right way of thinking about [[Prototype]].
    -> In Part4, the code will work by virtue of [[Prototype]], but if you wrote it that way so that anotherObject was acting as a fallback just in case myObject couldn’t handle some property/method that some developer may try to call, odds are that your software is going to be a bit more “magical” and harder to understand and maintain.
    -> That’s not to say there aren’t cases where fallbacks are an appropriate design pattern, but it’s not very common or idiomatic in JS, so if you find yourself doing so, you might want to take a step back and reconsider if that’s really appropriate and sensible design.
    -> Designing software where you intend for a developer to, for instance, call myObject.cool() and have that work even though there is no cool() method on myObject introduces some “magic” into your API design that can be surprising for future developers who maintain your software.
    -> You can however design your API with less “magic” to it, but still take advantage of the power of [[Prototype]] linkage. Refer Part5.

Towards Delegation-Oriented Design:
-----------------------------------
-> In Example7 (Part1), contains a code for class oriented programming approach. You can instantiate one or more copies of the XYZ child class, and use those instance(s) to perform task “XYZ”. These instances have copies both of the general Task defined behavior as well as the specific XYZ defined behavior. Likewise, instances of the ABC class would have copies of the Task behavior and the specific ABC behavior. After construction, you will generally only interact with these instances (and not the classes), as the instances each have copies of all the behavior you need to do the intended task.
-> In Delegation theory, You will first define an object (not a class, nor a function as most JS’rs would lead you to believe) called Task, and it will have concrete behavior on it that includes utility methods that various tasks can use (read: delegate to!). Then, for each task (“XYZ”, “ABC”), you define an object to hold that task-specific data/behavior. You link your task-specific object(s) to the Task utility object, allowing them to delegate to it when they need to. Refer Part2.
-> In Part2, Task and XYZ are not classes (or functions), they’re just objects. XYZ is set up via Object.create(..) to [[Prototype]] delegate to the Task object.
-> As compared to class-orientation (aka, OO – object-oriented), this style of code is called “OLOO” (objects-linked-to-other-objects). All we really care about is that the XYZ object delegates to the Task object (as does the ABC object).
-> In JavaScript, the [[Prototype]] mechanism links objects to other objects. There are no abstract mechanisms like “classes”, no matter how much you try to convince yourself otherwise. 
