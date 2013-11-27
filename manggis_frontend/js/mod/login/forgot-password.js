define(function(require) {
	var $ = require('jquery')
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var groupTpl = require('./group.tpl.html');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceLogin = require('../../lang/' + G.LANG + '/login');
		
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'getPwdBack', function(evt) {
			var valid = formUtil.validate('#forgot-pwd-form');
			var data;
			if(valid.passed) {
				data = formUtil.getData('#forgot-pwd-form');
				rfl.ajax.post({
					queueName: 'getPwdBack',
					url: 'resetPassword',
					data: data,
					success: function(res) {
						if(res.code === 0) {
							rfl.alerts.show(res.message, {type: 'success', timeout: 10000});
							G.id('submit-btn').disabled = true;
							setTimeout(function() {
								G.id('submit-btn').disabled = false;
							}, 10000);
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
		});
		_bindEvent = rfl.empty;
	};
	
	function init(listData) {
		_bindEvent();
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		var email = rfl.util.getUrlParam('email');
		if(email) {
			$('#email').val(email);
		}
		$('.login-container').removeClass('off');
	};
	
	return {
		init: init
	};
});