var extract = function(url, callback) {
	process.nextTick(function() {
		var i = 0; 
		for (var n = 1; n < 100000000; n++)
			i +=1;
		callback(i);
	});
	return 20;
};

var num = extract('', function (i) {
	console.log(i);
});

console.log(num);