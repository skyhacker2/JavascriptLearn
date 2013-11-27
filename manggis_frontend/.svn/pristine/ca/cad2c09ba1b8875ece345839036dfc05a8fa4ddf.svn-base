define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var AutoComplete = require('auto-complete');
	var langResourceCommon = require('lang/' + G.LANG + '/common');
	var mainTpl = require('./dialog.tpl.html');

	var _autoComplete = null;
	var _proper = null;
	var _editor = null;

	function _bindEvent() {
		$(document).on('click', function(evt) {
			if(!$(evt.target).closest('.popover').length && evt.target.className.indexOf('insertpersonalizedinformation') < 0) {
				_hide();
			}
		});
		rfl.ajax.history.on('change', function(evt) {
			_hide();
		});
		_bindEvent = rfl.empty;
	};

	function _hide() {
		if(_editor && _editor.focusManager){
			_editor.focusManager.unlock();
			_editor.focus();
			_editor = null;
		}
		if(_proper) {
			_proper.popover('hide').popover('destroy');
			_proper = null;
		}
	}

	function show(editor, opt) {
		_hide();
		_editor = editor;
		_bindEvent();
		opt = opt || {};
		if(editor.focusManager) {
			editor.focusManager.lock();
		} 
		_proper = $($('.cke_button__insertpersonalizedinformation_icon:visible', opt.context)[0]).popover({
			placement: opt.placement || 'bottom',
			trigger: 'manual',
			container: 'body',
			html: true,
			animation: false,
			title: 'Insert Customer Property',
			content: mainTpl.render({
				lang: {common: langResourceCommon}
			})
		});
		_proper.popover('show');

		formUtil.initPlaceHolder('#personalize-property-name');
		rfl.service.getFrequencyOrderProperties(opt.listId || rfl.pageStorage.get().urlParams.listId, function(properties) {
			_autoComplete && _autoComplete.destroy();
			_autoComplete = new AutoComplete('#personalize-property-name', {
				excludeExist: true,
				maxSelection: 1,
				dataSource: properties,
				initData: [],
				onSelect: function(item) {
					formUtil.checkPlaceHolder('#personalize-property-name');
					_hide();
					setTimeout(function() {
						editor.insertHtml('${' + item.tag + '}', 'text');
					}, 200);
					rfl.service.unshiftProperty(item.id);
				}
			});
			formUtil.focus('#personalize-property-name');
		});
	};

	return {
		show: show
	};
});