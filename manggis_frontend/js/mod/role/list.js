define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	var langResourceRole = require('lang/{{G.LANG}}/role');
	var listTpl = require('./list.tpl.html');
	
	var _data = null;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'delRow', function(evt, i) {
			var item = _data[parseInt(i)];
			if(!item) {
				return;
			}
			rfl.alerts.confirm(
				rfl.util.formatMsg(langResourceRole.msg.delRoleConfirm, [item.name]),
				function() {
					rfl.ajax.del({
						queueName: 'delRole',
						url: 'role/' + item.id,
						success: function(res) {
							if(res.code === 0) {
								rfl.alerts.show(res.message, 'success');
								render();
							} else {
								rfl.alerts.show(res.message, 'error');
							}
						},
						error: function() {
							rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
						}
					});
				},
				{makeSure: true}
			);
		}, 1);
		_bindEvent = rfl.empty;
	};
	
	function _render(res) {
		if(res.code === 0) {
			_data = res.data.roles;
			$('#main-div').html(listTpl.render({data: _data, auth: rfl.auth}));
		} else {
			rfl.alerts.show(res.message, 'error');
		}
	};
	
	function render(data) {
		if(data) {
			_render(data);
		} else {
			rfl.ajax.get({
				url: 'roles',
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
		if(!rfl.auth.checkAndWarn('PERM_ROLE_ADMIN')) {
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