define(function(require) {
	var $ = require('jquery');
	var cookie = require('./cookie');
	var util = require('./util');
	var alerts = require('./alerts');
	
	var login = {};
	
	login.getSid = function() {
		return cookie.get('JSESSIONID');
	};
	
	login.validate = function() {
		return login.getSid() && true;
	};
	
	login.gotoLoginPage = function(jumpUrl) {
		if((/\/login\/login\-/).test(location.pathname)) {
			return;
		}
		var G = top.G;
		var url = [G.ORIGIN, G.BASE, 'html/login/login-', G.LANG, '.html'].join('');
		jumpUrl = typeof jumpUrl != 'undefined' ? jumpUrl : top.location.href;
		if(url != util.getOrigin() + location.pathname) {
			top.location.href = [url, jumpUrl ? '?jump=' + encodeURIComponent(jumpUrl) : ''].join('');
		}
	};
	
	login.logout = function() {
		require('./ajax').post({
			queueName: 'logout',
			url: 'j_spring_security_logout',
			data: {},
			success: function(res) {
				if(res.code === 0) {
					login.gotoLoginPage();
				} else {
					alerts.show({content: res.message, type: 'error'});
				}
			},
			error: function() {
				alerts.show({content: langResourceCommon.msg.serverBusy, type: 'error'});
			}
		});
	};
	
	return login;
});