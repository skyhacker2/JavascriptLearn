define(function(require) {
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var langResourcePropertyTypes = require('../../lang/' + G.LANG + '/property-types');
	var mainTpl = require('./property-edit.tpl.html');
	var setTpl = require('./property-edit-set.tpl.html');
	
	var _isEdit = false;
	var _data;
	var _listId;

	function _submit() {
		var valid = formUtil.validate('#edit-property-form');
		var data = formUtil.getData('#edit-property-form');
		if(valid.passed) {
			data.itemNames = undefined;
			data.items = [];
			if(_isEdit) {
				$('input', '#existing-property-set-div').each(function(i, item) {
					data.items.push({id: $(item).data('id'), value: item.value});
				});
			}
			if((data.propertyType == 'SET' || data.propertyType == 'MULTISET') && !data.items.length && !valid.data.itemNames.length) {
				formUtil.focus('#edit-property-set');
				formUtil.highLight('#edit-property-set', langResourceCommon.msg.validator.mandatory);
				return;
			}
			$.each(valid.data.itemNames, function(i, val) {
				data.items.push({value: val});
			});
			if(!_isEdit) {
				data.tag = 'NEW';//System will generate the tag automatically in create phase, this default value is a trick for backend validation framework.
			}
			rfl.ajax[_isEdit ? 'put' : 'post']({
				queueName: 'editProperty',
				url: _isEdit ? 'lists/propertys' + _data.property.id : 'lists/' + _listId + '/propertys',
				data: data,
				success: function(res) {
					if(res.code === 0) {
						if(_isEdit) {
							rfl.alerts.show(res.message, 'success');
							_init(true, res.data);
						} else {
							rfl.alerts.show(res.message, {type: 'success', btns: [
								{
									text: langResourceCommon.label.createAnother,
									className: 'btn-success',
									click: function() {
										location.reload();
									}
								}
							], timeout: 10000});
							_init(true, res.data, true);
						}
					} else {
						rfl.alerts.show(res.message, 'error');
					}
				},
				error: function() {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
				}
			});
		} else {
			formUtil.focus(valid.failList[0].item);
		}
	};
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'cancel', function(evt) {
			rfl.util.gotoUrl('customer/property-list#!' + _listId);
		}).delegate('click', 'save', function(evt) {
			_submit();
		}).delegate('keyup', 'keyupSubmit', function(evt) {
			if(evt.keyCode === 13 && (evt.target.tagName != 'TEXTAREA' || evt.ctrlKey)) {
				_submit();
			}
		}).delegate('click', 'setItemUp', function(evt, i) {
			var items = _data.property.items;
			var item = items[i];
			if(!item) {
				return;
			}
			var tmp = items.splice(i, 1)[0];
			if(i == '0') {
				items.push(tmp);
			} else {
				items.splice(i - 1, 1, tmp, items[i - 1]);
			}
			$('#existing-property-set-div').html(setTpl.render({
				data: _data, 
				lang: {common: langResourceCommon, customer: langResourceCustomer, propertyTypes: langResourcePropertyTypes}
			}));
		}, 1).delegate('click', 'setItemDown', function(evt, i) {
			var items = _data.property.items;
			var item = items[i];
			if(!item) {
				return;
			}
			var tmp = items.splice(i, 1)[0];
			if(i >= items.length) {
				items.unshift(tmp);
			} else {
				items.splice(i, 1, items[i], tmp);
			}
			$('#existing-property-set-div').html(setTpl.render({
				data: _data, 
				lang: {common: langResourceCommon, customer: langResourceCustomer, propertyTypes: langResourcePropertyTypes}
			}));
		}, 1).delegate('click', 'setItemDelete', function(evt, i) {
			var items = _data.property.items;
			var item = items[i];
			if(!item) {
				return;
			}
			items.splice(i, 1);
			$('#existing-property-set-div').html(setTpl.render({
				data: _data, 
				lang: {common: langResourceCommon, customer: langResourceCustomer, propertyTypes: langResourcePropertyTypes}
			}));
		}, 1);
		_bindEvent = rfl.empty;
	};
	
	function _init(isEdit, data, fromCreate) {
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_isEdit = isEdit;
		_data = data;
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		$('#main-div').html(mainTpl.render({
			listId: _listId, 
			lang: {common: langResourceCommon, customer: langResourceCustomer, propertyTypes: langResourcePropertyTypes}, 
			data: data || {}, 
			isEdit: isEdit
		}));
		changeDataType();
		_bindEvent();
		formUtil.initPlaceHolder('#edit-property-form .place-holder-input');
		G.id('edit-property-name').focus();
	};

	function changeDataType() {
		var type = $('#edit-property-dataType').val();
		if(type == 'SET' || type == 'MULTISET') {
			$('#edit-set-form').show();
			formUtil.focus('#edit-property-set');
		} else {
			$('#edit-set-form').hide();
		}
	};
	
	function init(isEdit, data, fromCreate) {
		var params = rfl.util.getUrlParams();
		_listId = G.listId = params.listId;
		if(isEdit) {
			document.title = langResourceCustomer.label.editProperty + ' - ' + langResourceCommon.appName;
			_init(isEdit, data, fromCreate);
		} else {
			rfl.util.fromBase64(params.i, function(res) {
				data = {listName: res.listName, property: {}};
				if(res) {
					_init(isEdit, data, fromCreate);
				} else {
					rfl.ui.renderInvalidUrl('#main-div');
				}
			}, true);
		}
	};
	
	return {
		changeDataType: changeDataType,
		init: init
	};
});
