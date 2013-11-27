define(function(require) {
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var editTpl = require('./group-edit.tpl.html');

	var _isEdit = false;
	var _data;
	var _listId;

	function _submit() {
		var valid = formUtil.validate('#edit-group-form');
		if(valid.passed) {
			rfl.ajax[_isEdit ? 'put' : 'post']({
				queueName: 'editCustomerGroup',
				url: _isEdit ? 'lists/groups' + _data.id : 'lists/' + _listId + '/groups',
				data: formUtil.getData('#edit-group-form'),
				success: function(res) {
					if(res.code === 0) {
						if(_isEdit) {
							rfl.alerts.show(res.message, {type: 'success', btns: [
								{
									text: langResourceCustomer.label.importCustomers,
									className: 'btn-success',
									click: function() {
										rfl.util.toBase64({listName: _data.listName}, function(res) {
											rfl.util.gotoUrl('customer/import#!' + _listId + '/' + res);
										});
									}
								}
							], timeout: 10000});
						} else {
							rfl.alerts.show(res.message, {type: 'success', btns: [
								{
									text: langResourceCustomer.label.importCustomers,
									className: 'btn-success',
									click: function() {
										rfl.util.toBase64({listName: _data.listName}, function(res) {
											rfl.util.gotoUrl('customer/import#!' + _listId + '/' + res);
										});
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
			rfl.util.gotoUrl('customer/group-list#!' + _listId);
		}).delegate('click', 'save', function(evt) {
			_submit();
		}).delegate('keyup', 'keyupSubmit', function(evt) {
			if(evt.keyCode === 13) {
				_submit();
			}
		});
		_bindEvent = rfl.empty;
	};
	
	function _init(isEdit, data, fromCreate) {
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_isEdit = isEdit;
		_data = data;
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		$('#main-div').html(editTpl.render({
			listId: _listId,
			lang: {common: langResourceCommon, customer: langResourceCustomer}, 
			data: data || {}, 
			isEdit: isEdit
		}));
		fromCreate || G.id('edit-group-name').focus();
		_bindEvent();
	};
	
	function init(isEdit, data, fromCreate) {
		var params = rfl.util.getUrlParams();
		_listId = G.listId = params.listId;
		if(isEdit) {
			document.title = langResourceCustomer.label.editCustomerGroup + ' - ' + langResourceCommon.appName;
			_init(isEdit, data, fromCreate);
		} else {
			rfl.util.fromBase64(params.i, function(res) {
				data = {listName: res.listName, group: {}};
				if(res) {
					_init(isEdit, data, fromCreate);
				} else {
					rfl.ui.renderInvalidUrl('#main-div');
				}
			}, true);
		}
	};
	
	return {
		init: init
	};
});