define(function(require) {
	var $ = require('jquery') || jQuery;
	var rfl = require('rfl');
	var searchControl = require('mod/nav-bar/search-main');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var listTpl = require('./search-customer.tpl.html');

	var _opt;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'appSearchViewCustomer', function(evt, id) {
			//TODO
		}, 1);
		_bindEvent = rfl.empty;
	};

	function search(key, container, opt) {
		_opt = opt || {};
		_bindEvent();
		rfl.ajax.get({
			url: 'lists/' + (opt.listId || G.listId) + '/searchCustomers',
			data: {
				key: key
			},
			success: function(res) {
				if(res.code === 0) {
					if(res.data.customers.length) {
						$(container).html(listTpl.render({list: res.data.customers}));
					} else {
						searchControl.showMsg('No result.', 'info');
					}
				} else {
					searchControl.showMsg(res.message, 'error');
				}
				_opt.callback && _opt.callback(res);
			},
			error: function() {
				searchControl.showMsg(langResourceCommon.msg.serverBusy, 'error');
				_opt.callback && _opt.callback({code: -1, message: langResourceCommon.msg.serverBusy});
			}
		});
	};
	
	return {
		search: search
	};
});
