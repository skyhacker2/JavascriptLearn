define(function(require) {
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var editTpl = require('./group-edit.tpl.html');

	var _isEdit = false;
	var _data;

	function _submit() {
		var valid = formUtil.validate('#edit-group-form');
		if(valid.passed) {
			rfl.ajax[_isEdit ? 'put' : 'post']({
				queueName: 'editCustomerGroup',
				url: 'customer/group' + (_isEdit ? '/' + _data.id : ''),
				data: formUtil.getData('#edit-group-form'),
				success: function(res) {
					if(res.code === 0) {
						if(_isEdit) {
							rfl.alerts.show(res.message, {type: 'success', btns: [
								{
									text: langResourceCustomer.label.importCustomers,
									className: 'btn-success',
									click: function() {
										rfl.util.gotoUrl('customer/import#groupIds=' + _data.id);
									}
								}
							], timeout: 10000});
						} else {
							rfl.alerts.show(res.message, {type: 'success', btns: [
								{
									text: langResourceCustomer.label.importCustomers,
									className: 'btn-success',
									click: function() {
										rfl.util.gotoUrl('customer/import#groupIds=' + res.data.id);
									}
								},
								{
									text: langResourceCommon.label.createAnother,
									click: function() {
										location.reload();
									}
								}
							], timeout: 10000});
							init(true, res.data, true);
						}
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
			rfl.util.gotoUrl('customer/group-list');
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
		_isEdit = isEdit;
		_data = data;
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		G.id('title').innerHTML = _isEdit ? langResourceCustomer.label.editCustomerGroup : langResourceCustomer.label.createCustomerGroup;
		$('#main-div').html(editTpl.render({lang: {common: langResourceCommon, group: langResourceCustomer}, data: data || {}, isEdit: isEdit}));
		_bindEvent();
		fromCreate || G.id('edit-group-name').focus();
	};
	
	return {
		init: init
	};
});