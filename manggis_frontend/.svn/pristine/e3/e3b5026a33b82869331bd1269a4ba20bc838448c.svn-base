define(function() {
	var InstanceManager = require("rfl").InstanceManager;
	describe('Test rfl.InstanceManager', function(){
		it("Can get and set item in InstanceManager.", function(){
			var tmp = {a: "test"},
				im = new InstanceManager(),
				id = im.add(tmp);

			expect(im.get(id)).toEqual(tmp);
		});
		it("Can count the all items in InstanceManager.", function(){
			var tmp = {a: "test"},
				im = new InstanceManager(),
				id = im.add(tmp);

			expect(im.count()).toBe(1);
			im.remove(id);
			expect(im.count()).toBe(0);
			id = im.add(tmp);
			expect(im.count()).toBe(1);
			im.clear();
			expect(im.count()).toBe(0);
		});
		it("Can remove the item.", function(){
			var tmp = {a: "test"},
				im = new InstanceManager(),
				id = im.add(tmp);

			expect(im.remove(id)).toEqual(tmp);

		});
	});
});