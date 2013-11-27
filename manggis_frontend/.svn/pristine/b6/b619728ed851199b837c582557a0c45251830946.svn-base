define(function(require) {
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var editTpl = require('./list-edit.tpl.html');

	var _isEdit = false;
	var _data;

	function _submit() {
		var valid = formUtil.validate('#edit-list-form');
		if(valid.passed) {
			rfl.ajax[_isEdit ? 'put' : 'post']({
				queueName: 'editList',
				url: 'lists' + (_isEdit ? '/' + _data.id : ''),
				data: formUtil.getData('#edit-list-form'),
				success: function(res) {
					if(res.code === 0) {
						rfl.util.gotoUrl('customer/list-list');
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

	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'cancel', function(evt) {
			rfl.util.gotoUrl('customer/list-list');
		}).delegate('click', 'save', function(evt) {
			_submit();
		}).delegate('keyup', 'keyupSubmit', function(evt) {
			if(evt.keyCode === 13) {
				_submit();
			}
		});
		_bindEvent = rfl.empty;
	};
	
	function init(isEdit, data, fromCreate) {
		if(!rfl.auth.checkAndWarn('PERM_GROUP_ADMIN')) {
			return;
		}
		if(isEdit) {
			document.title = langResourceCustomer.label.editList + ' - ' + langResourceCommon.appName;
		}
		_isEdit = isEdit;
		_data = data;
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		$('#main-div').html(editTpl.render({lang: {common: langResourceCommon, customer: langResourceCustomer}, data: data || {}, isEdit: isEdit}));
		_bindEvent();
		fromCreate || G.id('edit-list-name').focus();
	};
	
	return {
		init: init
	};
});