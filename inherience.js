Function.method = function(name, func) {
	console.log(this);
	console.log(Function.prototype == this.prototype);
};
Function.prototype.method = function(name, func) {

};
console.log(function(){}.prototype);
console.log(Function.prototype);

var Foo = function() {
	this.name = 'eleven';
};
var foo = new Foo;
Foo.prototype.getName = function() {
	return this.name;
};

var fun = new Foo;
console.log(foo.constructor == Foo);
console.log(foo.getName());
console.log(fun.getName());
