define(function() {
	var util = require("rfl").util;
	describe('Test rfl.util', function(){
		describe('Test rfl.util.cloneObject', function(){
			it("cloneObject should return a clone Object.", function(){
				var tmp = {
					a: 123,
					b: 234
				};
				expect(util.cloneObject(tmp)).toEqual(tmp);
			});
			it("in no deep clone", function(){
				var tmp = {
					a: {
						n: 123
					},
					b: 234
				},
					tmp2 = util.cloneObject(tmp);
				expect(tmp2).toEqual(tmp);
				tmp.a.n = 321;
				expect(tmp2).toEqual(tmp);
			});
			it("in deep clone", function(){
				var tmp = {
					a: {
						n: 123
					},
					b: 234
				},
					tmp2 = util.cloneObject(tmp, 1);
				expect(tmp2).toEqual(tmp);
				tmp.a.n = 321;
				expect(tmp2).not.toEqual(tmp, 1, 0);
			});
			it("if deep > level", function(){
				var tmp = {
					a: {
						n: 123
					},
					b: 234
				};
				expect(util.cloneObject(tmp, 3)).toEqual(tmp);
			});
		});

		describe('Test rfl.util.getByteLength', function(){
			it("String 'hello,world!' has 12 byte.", function(){
				expect(util.getByteLength("hello,world!")).toEqual(12);
			});
			it("String '世界，你好！' has 12 byte.", function(){
				expect(util.getByteLength("世界，你好！")).toEqual(12);
			})
		});

		describe('Test rfl.util.headByByte', function(){
			it("String 'hello,world!' 0-5 bytes is 'hello'", function(){
				expect(util.headByByte("hello,world!", 5)).toEqual("hello");
			});
			it("String '世界，你好' 0-5 bytes is '世界'", function(){
				expect(util.headByByte('世界，你好', 5)).toEqual("世界");
			});
			it("The final fix should be '...' .", function(){
				expect(util.headByByte('hello,world!', 5, '...')).toEqual('he...');
			});
		});

		describe('Test rfl.util.encodeHtml.', function(){
			it("HTML should be encoded.", function(){
				expect(util.encodeHtml("<html></html>")).toEqual("&lt;html&gt;&lt;/html&gt;");
			});
		});

		describe('Test rfl.util.decodeHtml.', function(){
			it("Should decode Html.", function(){
				expect(util.decodeHtml("&lt;html&gt;&lt;/html&gt;")).toEqual("<html></html>");
			});
		});

		describe('Test rfl.util.getUrlParam', function(){
			it("Should get the url param.", function(){
				expect(util.getUrlParam("id", {href: "http://www.test.org/?id=123&name=Bob#id=1234"})).toEqual('123');
			});
			it("All params should be string, so '123' + 4 = '1234'.", function(){
				var tmp = util.getUrlParam("id", {href: "http://www.test.org/?id=123&name=Bob#id=1234"}) + 4;
				expect(tmp).toEqual('1234');
			});
		});

		describe('Test rfl.util.getUrlParams', function(){
			it("Should get the url params.", function(){
				var tmp = util.getUrlParams({href: "http://www.test.org/?id=123&name=Bob#id=1234", search: "?id=123&name=Bob", hash: "#id=1234"});
				expect(tmp.id).toEqual('123');
				expect(tmp.name).toEqual("Bob");
			});
		});

	});
});