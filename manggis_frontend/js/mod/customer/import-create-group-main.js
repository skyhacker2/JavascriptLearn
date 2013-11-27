define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var mainTpl = require('./import-create-group.tpl.html');
	var noticeTpl = require('./import-match-column-notice.tpl.html');

	var _holder, _listId, _callback, _cancelCallback;

	function _submit() {
		var valid = formUtil.validate(_holder);
		if(valid.passed) {
			rfl.ajax.post({
				queueName: 'createCustomerGroup',
				url: 'lists/' + _listId + '/groups',
				data: formUtil.getData(_holder),
				success: function(res) {
					if(res.code === 0) {
						$('#new-customer-group').val('');
						_callback && _callback(res.data);
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
		rfl.Delegator.getPageDelegator().delegate('click', 'saveCustomerGroup', function(evt) {
			_submit();
		}, 1).delegate('click', 'cancelCreateCustomerGroup', function(evt) {
			_cancelCallback && _cancelCallback();
		}, 1).delegate('keyup', 'keyupSubmit', function(evt) {
			if(evt.keyCode === 13) {
				_submit();
			}
		});
		_bindEvent = rfl.empty;
	};

	function _init() {
		$(_holder).html(mainTpl.render($.extend({}, {lang: {common: langResourceCommon, customer: langResourceCustomer}}))).show();
		_bindEvent();
		formUtil.focus('#new-customer-group');
	};
	
	function init(holder, listId, callback, cancelCallback) {
		_holder = holder;
		_listId = listId;
		_callback = callback;
		_cancelCallback = cancelCallback;
		_init();
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
	};
	
	return {
		init: init
	};
});