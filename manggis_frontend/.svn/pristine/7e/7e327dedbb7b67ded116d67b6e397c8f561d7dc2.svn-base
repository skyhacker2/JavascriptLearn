define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var GroupMap = require('mod/customer/group-map-main');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var listTpl = require('./group-list.tpl.html');
	
	var _listId, _listName, _groups, _groupMap;
	
	function _render() {
		$('#main-div').html(listTpl.render({
			listId: _listId,
			lang: {common: langResourceCommon, customer: langResourceCustomer}
		}));
		_groupMap && _groupMap.destroy();
		_groupMap = new GroupMap('#group-map-container', _groups, {
			listId: _listId,
			maxSelection: 2,
			editable: true,
			manageable: true
		});
	};

	function render(mark, listId) {
		var args = arguments;
		G.listId = listId;
		if(args.length) {
			if(listId == _listId) {
				_render();
			} else {
				rfl.ajax.get({
					url: 'lists/' + listId + '/groups',
					success: function(res) {
						if(res.code === 0) {
							_listId = listId;
							_listName = res.data.listName;
							_groups = res.data.groups;
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
		_groups = initData.groups;
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		rfl.ajax.history.init(1, render);
	};
	
	return {
		render: render,
		init: init
	};
});