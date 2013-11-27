define(function(require) {
	var $ = require('jquery')
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var groupTpl = require('./group.tpl.html');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceLogin = require('../../lang/' + G.LANG + '/login');
	var mailChecker = require('./mail-checker');

	var _currentEmail = '';
	
	function _login() {
		var valid = formUtil.validate('#login-form');
		var data, email;
		if(valid.passed) {
			data = formUtil.getData('#login-form');
			email = data.j_username;
			data.j_username = data.j_username + (data.group ? ';' + data.group : '');
			data.language = G.LANG_BACKEND_MAP[G.LANG] || '';
			rfl.ajax.post({
				queueName: 'login',
				url: 'j_spring_security_check',
				notJsonParamData: true,
				data: data,
				success: function(res) {
					var lang = G.LANG_MAP[data.language] || 'en';
					if(res.code === 0) {
						rfl.localStorage.set('email', email);
						data.group && rfl.localStorage.set('group', data.group);
						rfl.localStorage.set('language', lang);
						rfl.util.replaceUrl(rfl.util.getUrlParam('jump').replace(/-(en|zh-cn|zh-tw).htm/, '-' + lang + '.htm') || G.ORIGIN + G.BASE + 'html/customer/list-' + lang + '.html');
					} else {
						rfl.alerts.show(res.message, 'error');
					}
				},
				error: function() {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
				}
			});
		} else {
			formUtil.focus(valid.failList[0].item);
		}
	};

	function _getGroups() {
		var target = G.id('email');
		if(_currentEmail == target.value) {
			return;
		}
		var valid = formUtil.validateOne(target);
		if(valid.passed) {
			rfl.ajax.get({
				url: 'users/groups',
				cache: false,
				data: {
					email: target.value,
					language: G.LANG_BACKEND_MAP[G.LANG] || ''
				},
				success: function(res) {
					if(res.code === 0) {
						_currentEmail = target.value;
						if(res.data.length) {
							$('#group-div').html(groupTpl.render({cacheGroup: rfl.localStorage.get('group'), groups: res.data, lang: {login: langResourceLogin, common: langResourceCommon}}));
						}
					} else {
						var suggestion = mailChecker.suggest($('#email').val());
						if(suggestion) {
							formUtil.highLight(target, res.message + "<br />" + rfl.util.formatMsg(langResourceCommon.msg.mailCheck, suggestion), 'error');
						} else {
							formUtil.highLight(target, res.message, 'error');
						}
					}
				},
				error: function() {
					formUtil.highLight(target, langResourceCommon.msg.serverBusy, 'error');
				}
			});
		} else {
			formUtil.focus(target);
		}
	};
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'login', function(evt) {
			_login();
		}).delegate('keyup', 'keyupLogin', function(evt) {
			if(evt.keyCode === 13) {
				_login();
			}
		}).delegate('keypress', 'checkCapsLock', function(evt) {
			var keyCode = evt.keyCode || evt.which;//evt.which for firefox 2.0 or below
			var shiftKey = evt.shiftKey ? evt.shiftKey : ((keyCode === 16) ? true : false);
			if((keyCode >= 65 && keyCode <= 90) && !shiftKey || (keyCode >= 97 && keyCode <= 122) && shiftKey) {
				formUtil.highLight(evt.target, langResourceLogin.msg.capsLockOn, 'warning');
			} else {
				formUtil.highLight(evt.target, '', '');
			}
		}).delegate('click', 'getPwdBack', function(evt) {
			var valid = formUtil.validateOne($('#email'));
			if(valid.passed) {
				rfl.util.gotoUrl('login/forgot-password', {email: $('#email').val()});
			} else {
				rfl.util.gotoUrl('login/forgot-password');
			}
		}).delegate('click', 'changeLanguage', function(evt, lang) {
			if(lang !== G.LANG){
				rfl.localStorage.set('language', lang);
				rfl.util.replaceUrl(location.href.replace(/-(en|zh-cn|zh-tw).htm/g, '-' + lang + '.htm'));
			}
		});
		$('#email').on('blur', function(evt) {
			_getGroups();
		});
		_bindEvent = rfl.empty;
	};
	
	function init(listData) {
		_bindEvent();
		formUtil.setCommonMsg(langResourceCommon.msg.validator);

		//init language
		var lang = (rfl.localStorage.get('language') || navigator.language || navigator.userLanguage).toLowerCase();
		lang = G.LANG_MAP[lang] || 'en';
		if(lang != G.LANG) {
			rfl.util.replaceUrl(location.href.replace(new RegExp('-' + G.LANG + '\\.htm', 'g'), '-' + lang + '.htm'));
		}
		//$('#language').val(G.LANG_BACKEND_MAP[lang] || 'en');

		//init email
		var emailBox = G.id('email');
		if(!emailBox.value) {//if user haven't inputted anything
			emailBox.value = rfl.localStorage.get('email') || '';
			if(emailBox.value) {
				G.id('pwd').focus();
				_getGroups();
			} else {
				emailBox.focus();
			}
		} else {
			G.id('pwd').focus();
			_getGroups();
		}
		$('.login-container').removeClass('off');
	};
	
	return {
		init: init
	};
});