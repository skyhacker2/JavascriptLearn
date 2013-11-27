define(function(require) {
	var $ = require('jquery') || jQuery;
	var rfl = require('rfl');
	var mailTpl = require('./list-menu.tpl.html');

	var _listId = -1;
	var _lists = null;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'appMenuCreateCampaign', function(evt, i, type) {
			var list = _lists[i];
			rfl.util.toBase64({listId: list.id, listName: list.name}, function(res) {
				if(type) {
					rfl.util.gotoUrl('campaign/edit#!create/' + res + '/campaign//' + type);
				} else {
					rfl.util.gotoUrl('campaign/edit#!create/' + res + '/campaign//regular');
				}
			});
		}, 1);
		_bindEvent = rfl.empty;
	};

	function render(container, lists) {
		if(_listId === -1 || G.listId && G.listId != _listId) {
			_listId = G.listId;
			_lists = lists;
			_bindEvent();
			if(_listId && lists.length > 1) {
				$.each(_lists, function(i, list) {
					if(list.id == _listId) {
						_lists.unshift(_lists.splice(i, 1)[0]);
						return false;
					}
				});
			}
			$(container).html(mailTpl.render({lists: lists, curListId: G.listId}));
		}
	};
	
	return {
		render: render
	};
});
