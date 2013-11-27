define(function(require, exports) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var mainTpl = require('./change-password.tpl.html');

	var _dialog;

	function _update() {
		var valid = formUtil.validate('#change-password-form');
		var data = formUtil.getData('#change-password-form');
		if(valid.passed) {
			if(data.newPwd == data.confirmNewPwd) {
				rfl.ajax.put({
					queueName: 'changePassword',
					url: 'users/changePassword',
					data: data,
					success: function(res) {
						if(res.code === 0) {
							_hide();
							rfl.alerts.show(res.message, 'success');
						} else {
							rfl.alerts.show(res.message, {type: 'error', container: '#change-password-form'});
						}
					},
					error: function() {
						rfl.alerts.show(langResourceCommon.msg.serverBusy, {type: 'error', container: '#change-password-form'});
					}
				});
			} else {
				formUtil.highLight('#cp-confirm-new-pwd', require('lang/' + G.LANG + '/login').msg.pwdNotMatch);
				formUtil.focus('#cp-confirm-new-pwd');
			}
		} else {
			formUtil.focus(valid.failList[0].item);
		}
	};

	function _checkOne(evt){
		formUtil.validateOne(evt.target);
	}

	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('keyup', 'changePasswordSubmit', function(evt) {
			if(evt.keyCode ===13) {
				_update();
			}
		}).delegate('keypress', 'checkCapsLock', function(evt) {
			var langResourceLogin = require('lang/' + G.LANG + '/login')
			var keyCode = evt.keyCode || evt.which;//evt.which for firefox 2.0 or below
			var shiftKey = evt.shiftKey ? evt.shiftKey : ((keyCode === 16) ? true : false);
			if((keyCode >= 65 && keyCode <= 90) && !shiftKey || (keyCode >= 97 && keyCode <= 122) && shiftKey) {
				formUtil.highLight(evt.target, langResourceLogin.msg.capsLockOn, 'info');
			} else {
				formUtil.highLight(evt.target, '', '');
			}
		});
		_bindEvent = rfl.empty;
	};

	function _hide() {
		if(_dialog) {
			_dialog.modal('hide');
			_dialog = null;
		}
	};

	exports.show = function() {
		require(['lang/' + G.LANG + '/common', 'lang/' + G.LANG + '/login'], function(langResourceCommon, langResourceLogin) {
			formUtil.setCommonMsg(langResourceCommon.msg.validator);
			_bindEvent();
			_hide();
			_dialog = rfl.dialog.create({
				title: langResourceLogin.label.changePwd,
				content: mainTpl.render({lang: {login: langResourceLogin}}),
				btns: [
					{
						text: langResourceCommon.label.update,
						className: 'btn-primary',
						click: _update
					},
					{
						text: langResourceCommon.label.cancel,
						dismiss: true
					}
				]
			}).on("hidden", function(){
				$(document.body).off("blur", "[data-rfl-validate]", _checkOne);
			});
			$(document.body).on("blur", "[data-rfl-validate]", undefined, _checkOne);
		});
	};
});