define(function(require) {
	var $ = require('jquery') || jQuery;
	var mainTpl = require('./main.tpl.html');
	var AutoComplete;

	var _LANG_RESOURCE = {
		label: {
			ok: 'OK',
			or: 'or',
			cancel: 'cancel'
		}
	};

	var _editCellLayer;
	var _autoComplete;
	var _date;

	var _callback;
	var _initVal;

	function _save() {
		var inputBox = $('#instant-editor-input')[0];
		_callback && _callback(inputBox, {autoComplete: _autoComplete, date: _date});
	};

	function _init() {
		_editCellLayer = $('<div style="position: absolute; z-index: 99;"></div>').appendTo(document.body);
		_editCellLayer.delegate('.instant-editor-btn-update', 'click', function(evt) {
			_save();
		}).delegate('.instant-editor-btn-cancel', 'click', function(evt) {
			hide();
		}).delegate('#instant-editor-input', 'keypress', function(evt) {
			if(evt.keyCode === 13 && !(_autoComplete && _autoComplete.isListShown())) {
				_save();
			}
		});
		_init = function() {
			_autoComplete && _autoComplete.destroy();
			_autoComplete = null;
			_date = null;
		};
	};

	function _getAutoCompleteStdItem(item) {
		return typeof item == 'string' ? {id: item, name: item} : {id: item.id || item.name || item.value, name: item.name || item.value};
	};
	
	function _show(data, targetEl, callback, opt) {
		_init();
		opt = opt || {};
		var offset = $(targetEl).offset();
		var pageWidth = $(document.body).width();
		var layerWidth;
		var inputBox;
		_callback = callback;
		_initVal = opt.initVal;
		_editCellLayer.html(mainTpl.render({
			lang: opt.lang || _LANG_RESOURCE,
			data: data,
			initVal: _initVal,
			dateFormat: opt.dateFormat || 'yyyy/M/d',
			label: opt.label,
			validator: opt.validator,
			maxlength: opt.maxlength
		})).show();
		layerWidth = _editCellLayer.width();
		_editCellLayer.css({
			left: offset.left + layerWidth + 10 > pageWidth ? (pageWidth - layerWidth - 10) + 'px' : offset.left + 'px',
			top: offset.top + 'px'
		});
		inputBox = $('#instant-editor-input')[0];
		if(data.propertyType == 'SET' || data.propertyType == 'MULTISET') {
			_autoComplete = new AutoComplete(inputBox, {
				separator: opt.separator,
				richSelectionResult: true,
				maxSelection: data.propertyType == 'SET' ? 1 : 9999,
				dataSource: data.items,
				getStdItem: _getAutoCompleteStdItem
			});
			if(_initVal) {
				if(data.propertyType == 'MULTISET') {
					$.each(_initVal, function(i, val) {
						if(val) {
							_autoComplete.addSelectedItem(_getAutoCompleteStdItem(val));
						}
					});
				} else {
					_autoComplete.addSelectedItem(_getAutoCompleteStdItem(_initVal));
				}
			}
		} else if(data.propertyType == 'DATE') {
			$(inputBox).closest('.input-group').datepicker().on('changeDate', function(evt) {
				_date = evt.date;
				if(evt.viewMode == 'days') {
					$(inputBox).closest('.input-group').datepicker('hide');
				}
			});
		}
		inputBox.focus();
	};

	function show(data) {
		var args = Array.prototype.slice.call(arguments);
		if(data.propertyType == 'SET' || data.propertyType == 'MULTISET') {
			require(['auto-complete'], function(ac) {
				AutoComplete = ac;
				_show.apply(null, args);
			});
		} else if(data.propertyType == 'DATE') {
			require(['datepicker'], function(dp) {
				_show.apply(null, args);
			});
		} else {
			_show.apply(null, args);
		}
	};

	function hide() {
		_autoComplete && _autoComplete.destroy();
		_autoComplete = null;
		_date = null;
		_editCellLayer && _editCellLayer.fadeOut();
	};
	
	return {
		show: show,
		hide: hide
	};
});
