var Iconv = require('iconv').Iconv;
var iconv = new Iconv('UTF-8', 'ISO-8859-1');
var buffer = iconv.convert('hh');
console.log(buffer);
console.log("哈哈");