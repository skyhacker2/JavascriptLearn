var Class = function() {
	var klass = function() {
		//this.init.apply(this, arguments);
		this.init(arguments);
	};
	klass.prototype.init = function(){}
	return klass;
};

var Person = new Class;

Person.prototype.init = function() {
	console.log("Person created");
};

var person = new Person;