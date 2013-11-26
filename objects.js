// 

var name;

var name1 = undefined || "eleven";
console.log(name1);
var name2 = name1 || "chen";
console.log(name2);

var name3 = name && "paul";
console.log(name3);
var name4 = name3 && "wu";
console.log(name4);


// referance

var person = {
	nickname:"eleven"
};

var x = person;
console.log(x.nickname);
x.nickname = "chen";
console.log(person.nickname);
console.log(x.nickname);


// propotype
console.log("propotype")
if (typeof Object.create != "function") {
	Object.create = function(o) {
		var F = function(){};
		F.prototype = o;
		return new F();
	}
}
var anothor_person = Object.create(person);
anothor_person.nickname = "chen";
console.log(anothor_person.nickname);
person.lastname = "eleven";
console.log(anothor_person.lastname);
delete anothor_person.nickname;
console.log(anothor_person.nickname);
console.log("End propotype")
// Enumeration
var car = {
	name : "福特"
}
for (name in car) {
	console.log(name + ": " + car[name]);
}
