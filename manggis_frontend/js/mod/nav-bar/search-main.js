define(function(require) {
	var $ = require('jquery') || jQuery;
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var mailTpl = require('./search.tpl.html');
	var msgTpl = require('./search-msg.tpl.html');

	var _autoComplete = null;
	var _currentTypeIndex = 0;
	var _opt = {};

	var _types = [
		{
			type: 'campaign',
			displayName: 'Campaign'
		},
		{
			type: 'customer',
			displayName: 'Customer'
		}
	];

	function _search() {
		var key = $('#app-search-box-input').val();
		require(['./search-' + _types[_currentTypeIndex].type + '-main'], function(mod) {
			mod.search(key, '.app-search-result', $.extend({}, _opt, {callback: function(res) {
				$('.app-search .app-search-box .icon-remove-sign').show();
			}}));
		});
	};

	var appSearch = {
		switchType: function(i) {
			if(!(i >= 0)) {
				i = (_currentTypeIndex + 1) % _types.length;
			}
			if(!_types[i] || i == _currentTypeIndex) {
				return;
			}
			_currentTypeIndex = i;
			_autoComplete && _autoComplete.clear();
			$('#smart-search-current-type').html(_types[_currentTypeIndex].displayName);
			formUtil.focus('#app-search-box-input');
		},

		clear: function(focus) {
			$('#app-search-box-input').val('');
			$('.app-search .app-search-box .icon-remove-sign').hide();
			$('.app-search .app-search-result').html('');
			if(focus) {
				formUtil.focus('#app-search-box-input');
			}
		},

		showMsg: function(msg, type) {
			var type = ({
				info: 'info',
				success: 'success',
				error: 'danger'
			})[type] || 'warning';
			$('.app-search .app-search-result').html(msgTpl.render({msg: msg, type: type})).find('.alert').fadeIn();
		},

		init: function(container, opt) {
			_opt = opt || {};
			if(_opt.searchType) {
				$.each(_types, function(item, i) {
					if(item.type == _opt.searchType) {
						_currentTypeIndex = i;
					}
				});
			}
			$(container).html(mailTpl.render({types: _types, currentType: _types[_currentTypeIndex]}));
			rfl.Delegator.getPageDelegator().delegate('click', 'appSearch', function(evt) {
				_search();
			}, 1).delegate('keyup', 'keyupAppSearch', function(evt) {
				if(evt.keyCode === 13) {
					_search();
				}
			}, 1).delegate('click', 'appSearchSwitchType', function(evt, i) {
				appSearch.switchType(parseInt(i));
			}, 1).delegate('click', 'appSearchClear', function(evt) {
				appSearch.clear(true);
			}, 1);
			this.init = rfl.empty;
		}
	};
	
	return appSearch;
});
