define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var langResourcePropertyTypes = require('../../lang/' + G.LANG + '/property-types');
	var listTpl = require('./property-list.tpl.html');
	
	var _listId, _listName, _propertys;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'delRow', function(evt, i) {
			rfl.alerts.confirm(
				rfl.util.formatMsg(langResourceCustomer.msg.delPropertyConfirm, [_propertys[i].name]),
				function() {
					i = parseInt(i);
					rfl.ajax.del({
						queueName: 'delProperty',
						url: 'lists/propertys/' + _propertys[i].id,
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
				},
				{makeSure: true}
			);
		}, 1).delegate('click', 'createProperty', function(evt, i) {
			rfl.util.toBase64({listName: _listName}, function(res) {
				rfl.util.gotoUrl('customer/property-edit#listId=' + _listId + '&i=' + res);
			});
		}, 1);
		_bindEvent = rfl.empty;
	};
	
	function _render() {
		$('#main-div').html(listTpl.render({
			listId: _listId,
			propertys: _propertys,
			lang: {common: langResourceCommon, customer: langResourceCustomer, propertyTypes: langResourcePropertyTypes},
			auth: rfl.auth
		}, {util: rfl.util}));
	};
	
	function render(mark, listId) {
		var args = arguments;
		if(args.length) {
			if(listId == _listId) {
				_render();
			} else {
				rfl.ajax.get({
					url: 'lists/' + listId + '/propertys',
					success: function(res) {
						if(res.code === 0) {
							_listId = listId;
							_listName = res.data.listName;
							_propertys = res.data.propertys;
							_render();
						} else if(res.code === 2) {
							rfl.ui.renderInvalidUrl('#main-div');
						} else {
							rfl.ui.renderPageLoadError('#main-div');
						}
					},
					error: function() {
						rfl.ui.renderPageLoadError('#main-div');
					}
				});
			}
		} else {
			//a refresh call, get current status from mark
			_listId = null;
			rfl.ajax.history.dispatch(function() {
				render.apply(null, rfl.array.getArray(args));
			});
		}
	};
	
	function init(initData) {
		_listId = initData.listId;
		_listName = initData.listName;
		_propertys = initData.propertys;
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_bindEvent();
		rfl.ajax.history.init(1, render);
	};
	
	return {
		render: render,
		init: init
	};
});