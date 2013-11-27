define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var listTpl = require('./segment-list.tpl.html');
	
	var _data = null;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'delRow', function(evt, i) {
			rfl.alerts.confirm(
				rfl.util.formatMsg(langResourceCustomer.msg.delGroupConfirm, [_data[i].name]),
				function() {
					i = parseInt(i);
					rfl.ajax.del({
						queueName: 'delCustomerGroup',
						url: 'customers/groups/' + _data[i].id,
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
		}, 1);
		_bindEvent = rfl.empty;
	};
	
	function _render(mark, listId, page, sortKey, sortOrder) {
		page = parseInt(page) || 1;
		rfl.ajax.get({
			url: 'lists/' + listId + '/groups',
			cache: false,
			data: {
				pageNumber: page - 1,
				pageSize: G.ITEMS_PER_PAGE,
				property: sortKey || '',
				direction: sortOrder == 'desc' ? 'desc' : 'asc'
			},
			success: function(res) {
				if(res.code === 0) {
					_data = res.data.users;
					$('#main-div').html(listTpl.render({
						listId: listId,
						ajaxPagerUrlPattern: ['{{page}}', sortKey, sortOrder].join('/'),
						lang: {common: langResourceCommon, customer: langResourceCustomer},
						data: res.data,
						totalItems: res.data.total,
						auth: rfl.auth,
						//
						page: page,
						sortKey: sortKey,
						sortOrder: sortOrder,
					}, {util: rfl.util}));
				} else {
					rfl.alerts.show(res.message, 'error');
				}
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};
	
	function render() {
		if(arguments.length) {
			_render.apply(null, rfl.array.getArray(arguments));
		} else {
			//a refresh call, get current status from mark
			rfl.ajax.history.dispatch(function() {
				_render.apply(null, rfl.array.getArray(arguments));
			});
		}
	};
	
	function init() {
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_bindEvent();
		rfl.ajax.history.init(4, render);
	};
	
	return {
		render: render,
		init: init
	};
});