define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var listTpl = require('./list-list.tpl.html');
	var deleteTpl = require('./delete-list.tpl.html');
	
	var _data = null;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'delRow', function(evt, i) {
			rfl.util.typeConfirm(
				"DELETE", deleteTpl.render(_data.lists[i]),
				function() {
					i = parseInt(i);
					rfl.ajax.del({
						queueName: 'delList',
						url: 'lists/' + _data.lists[i].id,
						success: function(res) {
							if(res.code === 0) {
								rfl.alerts.show(res.message, 'success');
								render();
							} else {
								rfl.alerts.show(res.message,'error');
							}
						},
						error: function() {
							rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
						}
					});
				}
			);
		}, 1).delegate('click', 'importCustomer', function(evt, i, listId) {
			var listName = _data.lists[i].name;
			rfl.util.toBase64({listName: listName}, function(res) {
				rfl.util.gotoUrl('customer/import#!' + listId + '/' + res);
			});
		});
		_bindEvent = rfl.empty;
	};
	
	function _render(res) {
		if(res.code === 0) {
			_data = res.data;
			$('#main-div').html(listTpl.render({
				lang: {common: langResourceCommon, customer: langResourceCustomer},
				data: res.data,
				auth: rfl.auth
			}, {util: rfl.util}));
		} else {
			rfl.alerts.show(res.message, 'error');
		}
	};
	
	function render(data) {
		if(data) {
			_render(data);
		} else {
			rfl.ajax.get({
				url: 'lists',
				cache: false,
				data: {},
				success: function(res) {
					_render(res);
				},
				error: function() {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
				}
			});
		}
	};
	
	function init(data) {
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_bindEvent();
		render(data);
	};
	
	return {
		render: render,
		init: init
	};
});