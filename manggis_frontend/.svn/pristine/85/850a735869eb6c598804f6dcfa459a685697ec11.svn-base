define(function(require) {
	var $ = require('jquery');
	
	var array = {};

	array.isArray = Array.isArray || function(obj) {
		return Object.prototype.toString.call(obj) == '[object Array]';
	};
	
	array.getArray = function(arr) {
		return Array.prototype.slice.call(arr);
	};
	
	array.difference = function(arr1, arr2, fun) {
		var res = [];
		$.each(arr1, function(i, item1) {
			var same = false;
			$.each(arr2, function(j, item2) {
				if(item1 === item2 || fun && !fun(item1, item2)) {
					same = true;
					return false;
				}
				return true;
			});
			if(!same) {
				res.push(item1);
			}
		});
		return res;
	};
	
	return array;
});