define(function(require) {
	var $ = require('jquery') || jQuery;
	var rfl = require('rfl');
	var searchControl = require('mod/nav-bar/search-main');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var listTpl = require('./search-campaign.tpl.html');

	var _opt;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'appSearchViewCampaign', function(evt, id) {
			rfl.util.toBase64({
				listId: _opt.listId || G.listId
			}, function(res) {
				rfl.util.gotoUrl('campaign/edit#!view/' + res + '/overview/' + id);
			});
		}, 1);
		_bindEvent = rfl.empty;
	};

	function search(key, container, opt) {
		_opt = opt || {};
		_bindEvent();
		rfl.ajax.get({
			url: 'lists/' + (opt.listId || G.listId) + '/searchCampaigns',
			data: {
				key: key
			},
			success: function(res) {
				if(res.code === 0) {
					if(res.data.campaigns.length) {
						$(container).html(listTpl.render({list: res.data.campaigns}));
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
