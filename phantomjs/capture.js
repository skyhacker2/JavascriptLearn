var page = require('webpage').create();
page.open('http://www.taobao.com', function() {
	page.render('taobao.png');
	phantom.exit();
});