define(function() {
	var array = require("rfl").array;
	describe('Test rfl.array', function(){
		describe('Test rfl.array.isArray', function(){
			it('[] should be array.', function(){
				expect(array.isArray([])).toBeTruthy();
			});
			it('Number should not be array.', function(){
				expect(array.isArray(123)).toBeFalsy();
			});
			it('String should not be array.', function(){
				expect(array.isArray("hello,world")).toBeFalsy();
			});
			it('Object should not be array.', function(){
				expect(array.isArray({})).toBeFalsy();
			});
			it('HTMLCollection should not be array.', function(){
				expect(array.isArray(document.getElementsByTagName("head"))).toBeFalsy();
			});
			it('Arugments should not be array.', function(){
				expect(array.isArray(arguments)).toBeFalsy();
			});
		});

		describe('Test rfl.array.getArray.', function(){
			it('HTMLCollection can be transformed to Array', function(){
				expect(array.isArray(array.getArray(document.getElementsByTagName("head")))).toBeTruthy();
			});
			it('Arugments can be transformed to Array', function(){
				expect(array.isArray(array.getArray(arguments))).toBeTruthy();
			});
		});

		describe('Test rfl.array.difference.', function(){
			it('the number in [1, 2, 3] which did not exist in [2, 3, 4, 5] is [1].', function(){
				var ex = array.difference([1, 2, 3, 6], [2, 3, 4, 5]);
				expect(ex).toContain(1);
				expect(ex).toContain(6);
				expect(ex).not.toContain(2);
				expect(ex).not.toContain(3);
				expect(ex).not.toContain(4);
				expect(ex).not.toContain(5);
			});
		});
	});
});