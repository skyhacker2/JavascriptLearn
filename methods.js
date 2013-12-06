Function.prototype.method = function(name, func) {
	Array.prototype[name] = func;
};

Function.method("unshift", function(){
	this.splice.apply(this, [0,0].concat(Array.prototype.slice.apply(arguments)));
	//this.splice.apply(this, [0,0].concat(arguments.slice()));
	return this.length;
});

var arr = [1,2,3];
arr.unshift(4,5,6);
console.log(arr);

