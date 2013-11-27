define(function() {
	var json = require("rfl").json;
	describe('Test rfl.json', function(){
		describe('Test rfl.json.parse', function(){
			it("Should parse JSON.", function(){
				expect(json.parse('{"a":"test"}').a).toEqual("test");
			});
		});

		describe('Test rfl.json.stringify', function(){
			it("Should stringify whole Object.", function(){
				expect(json.stringify({a:"test"})).toEqual('{"a":"test"}');
			});
			it("Should stringify Number useless quotation marks.", function(){
				expect(json.stringify({a:123})).toEqual('{"a":123}');
			});
			it("Should stringify Boolean", function(){
				expect(json.stringify({a:true})).toEqual('{"a":true}');
			});
			it("Should stringify Object", function(){
				expect(json.stringify({a:{}})).toEqual('{"a":{}}');
			});
			it("Should stringify Null", function(){
				expect(json.stringify({a:null})).toEqual('{"a":null}');
			});
			it("Should delete the udnefined property", function(){
				expect(json.stringify({a:undefined})).toEqual('{}');
			});
		});
	});

});