define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var langResourcePropertyTypes = require('../../lang/' + G.LANG + '/property-types');
	var mainTpl = require('./import-match-column.tpl.html');
	var noticeTpl = require('./import-match-column-notice.tpl.html');

	var _ALL_STATUS_CLASSNAME = 'recommanded matched follow-up skipped';

	var _listId = '';
	var _sid = '';
	var _groupdIds = [];
	var _data = null;
	var _propertyAutoCompletes = null;
	var _propertyDataSource = null;
	var _groupAutoComplete = null;
	var _groupMap = null;
	var _showType = {
		'follow-up': true,
		'recommanded': true
	};

	function _skipAll(callback) {
		_initPropertyAutoComplete(null, function() {
			$('.follow-up input[value="S"]').each(function(i, radioBox) {
				_cancelCreateProperty(radioBox);
				_switchColumnType(radioBox, true);
				$('input[name="' + radioBox.name + '"]').parent().removeClass('on');
				$(radioBox.parentNode).addClass('on');
			});
			_renderShowType();
			callback && callback();
		});
	};

	function _finishImport() {
		var columns = [];
		if($('[data-skipped-count="' + _data.columns.length + '"]').length) {
			rfl.alerts.show('You can not skip all the columns.', 'error');
			return;
		}
		if(!formUtil.validate('.conflictions').passed) {
			formUtil.focus('[name="idConflict"]');
			return;
		}
		var campaignName = $('#edit-campaign-name').val()
		if(rfl.mockupFormControl.isCheckboxOn('createCampaign') && !campaignName) {
			formUtil.highLight('#edit-campaign-name', langResourceCommon.msg.validator.mandatory);
			formUtil.focus('#edit-campaign-name');
			return;
		}
		if($('[data-follow-up-count]').length) {
			rfl.alerts.confirm('You still have column(s) to follow up. Do you want to skip them?', function() {
				_skipAll(_finishImport);
			});
			return;
		}
		$.each(_data.columns, function(i, column) {
			if(!column.skipped) {
				columns.push({columnIndex: column.columnIndex, matched: column.matched});
			}
		});
		var conflictions = formUtil.getData('.conflictions');
		rfl.ajax.post({
			queueName: 'finishImportCustomers',
			url: 'lists/' + _listId + '/uploadCustomers/' + _sid,
			data: {
				idConflict: parseInt(conflictions.idConflict),
				contactConflict: parseInt(conflictions.contactConflict),
				columns: columns,
				groupIds: rfl.mockupFormControl.isCheckboxOn('selectActionSet') && _groupMap && _groupMap.getSelected('id') || [],
				campaignName: campaignName || undefined
			},
			success: function(res) {
				if(res.code === 0) {
					$('[data-rfl-click="finishImport"]')[0].disabled = true;
					setTimeout(function() {
						rfl.ajax.showLoading();
					}, 100);
					setTimeout(function() {
						rfl.ajax.hideLoading();
						location.hash = '!'  + [_listId, 'finished', res.data.jobId, new Date().getTime()].join('/');
					}, 1000);
				} else {
					rfl.alerts.show(res.message, 'error');
				}
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};

	function _renderShowType(fromSwitch) {
		var hasShown = false;
		$('.match-column-wrapper th, .match-column-wrapper td').hide();
		$.each(_showType, function(type, checked) {
			if(!checked) {
				return;
			}
			$('.match-column-wrapper th.' + type).each(function(j, th) {
				hasShown = true;
				$(th).show();
				$('.match-column-wrapper td[data-column-index="' + $(th).data('column-index') + '"]').show();
			});
		});
		if(!hasShown && !fromSwitch) {
			_showType['matched'] = true;
			_renderShowType(true);
			return;
		}
		$('#match-notice').html(noticeTpl.render($.extend(_data, {
			showType: _showType
		})));
	};

	function _switchShowType(checked, type) {
		if(type) {
			_showType[type] = !!checked;
		} else {
			_showType = {};
			if(checked) {
				$.each(_ALL_STATUS_CLASSNAME.split(' '), function(i, type) {
					_showType[type] = true;
				});
			}
		}
		_renderShowType(true);
	};

	function _switchColumnType(radioBox, batch) {
		var index = _getColumnIndex(radioBox);
		var column = _data.columns[index];
		var th = $(radioBox).closest('th');
		radioBox.checked = true;
		if(radioBox.value == 'M') {
			column.skipped = false;
			if(column.oldMatched) {
				if(_propertyAutoCompletes[index].addSelectedItem(column.oldMatched)) {
					_removeFromPropertyDataSource(column.oldMatched);
					column.matched = column.oldMatched;
				}
				formUtil.validate($('[data-type="match-form"]', th));
			}
			th.removeClass(_ALL_STATUS_CLASSNAME).addClass(column.matched ? (column.header == column.matched.name || column.matched.userSelection ? 'matched' : 'recommanded') : 'follow-up');
			$('[data-type="content"]', th).show();
		} else {
			column.skipped = true;
			th.removeClass(_ALL_STATUS_CLASSNAME).addClass('skipped');
			$('[data-type="content"]', th).hide();
			_initPropertyAutoComplete(null, function() {
				if(_propertyAutoCompletes[index]) {
					_addToPropertyDataSource(_propertyAutoCompletes[index].getSelectedDataList()[0]);
					_propertyAutoCompletes[index].setSelectedData([]);
					column.oldMatched = column.matched || column.oldMatched;
					column.matched = null;
					formUtil.validate($('[data-type="match-form"]', th));
				}
			});
		}
		if(!batch) {
			_renderShowType();
		}
	};

	function _createProperty(el) {
		var index = _getColumnIndex(el);
		var column = _data.columns[index];
		var th = $(el).closest('th');
		$('[data-type="header"]', th).hide();
		$('[data-type="match-form"]', th).hide();
		$('[data-type="new-form"]', th).show();
		_propertyNameExist(column.header, function(exist) {
			if(!exist && !$('#column-' + index + '-property-name').val()) {
				$('#column-' + index + '-property-name').val(column.header);
			}
		});
	};

	function _cancelCreateProperty(el) {
		var th = $(el).closest('th');
		$('[data-type="new-form"]', th).hide();
		$('[data-type="match-form"]', th).show();
		$('[data-type="header"]', th).show();
	};

	function _saveProperty(el) {
		var index = _getColumnIndex(el);
		var column = _data.columns[index];
		var th = $(el).closest('th');
		_validateNewForm(index, function(passed, data) {
			if(passed) {
				rfl.ajax.post({
					queueName: 'editProperty',
					url: 'lists/' + _listId + '/propertys',
					data: $.extend(data, {tag: 'NEW'}),
					success: function(res) {
						var item;
						if(res.code === 0) {
							item = res.data.property;
							_initPropertyAutoComplete(null, function() {
								if(_propertyAutoCompletes[index]) {
									_addToPropertyDataSource(item);
									_propertyAutoCompletes[index].addSelectedItem(item);
									_removeFromPropertyDataSource(item);
									column.matched = {id: item.id, name: item.name, userSelection: true};
									th.removeClass(_ALL_STATUS_CLASSNAME).addClass('matched');
									_renderShowType();
									formUtil.validate($('[data-type="match-form"]', th));
								}
							});
							_cancelCreateProperty(el);
						} else {
							rfl.alerts.show(res.message, 'error');
						}
					},
					error: function() {
						rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
					}
				});
			}
		});
	};

	function _createCustomerGroup() {
		require(['./import-create-group-main'], function(mod) {
			mod.init('#create-group-holder', _listId, function(group) {
				$('#create-group-holder').hide();
				$('#select-group-holder').show();
				if(_groupAutoComplete) {
					_groups.push(group);
					_groupAutoComplete.addSelectedItem(group);
				}
			}, function() {
				$('#create-group-holder').hide();
				$('#select-group-holder').show();
			});
			$('#select-group-holder').hide();
		});
	};

	function _showAdvancedSetting(btn) {
		$('#advanced-setting').show();
		$(btn).remove();
	};
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'switchShowType', function(evt, type) {
			_switchShowType(this.checked, type);
		}, 1).delegate('click', 'switchColumnType', function(evt) {
			_switchColumnType(this);
		}, 1).delegate('click', 'createProperty', function(evt) {
			_createProperty(this);
		}, 1).delegate('click', 'cancelCreateProperty', function(evt) {
			_cancelCreateProperty(this);
		}, 1).delegate('click', 'saveProperty', function(evt) {
			_saveProperty(this);
		}, 1).delegate('click', 'finishImport', function(evt) {
			_finishImport();
		}, 1).delegate('click', 'createCustomerGroup', function(evt) {
			_createCustomerGroup();
		}, 1).delegate('click', 'showAdvancedSetting', function(evt) {
			_showAdvancedSetting(this);
		}, 1).delegate('click', 'skipAll', function(evt) {
			_skipAll();
		}, 1);
		_bindEvent = rfl.empty;
	};

	function _propertyNameExist(name, callback) {
		var exist = false;
		if(!name) {
			callback(exist);
			return;
		}
		rfl.service.getProperties(_listId, function(propertys) {
			$.each(propertys, function(i, property) {
				if(property.name == name) {
					exist = true;
					return false;
				}
			});
			callback(exist);
		});
	};

	function _validateNewForm(index, callback) {
		var column = _data.columns[index];
		var nameValue = $('#column-' + index + '-property-name').val();
		_propertyNameExist(nameValue, function(nameExist) {
			var dataType = $('#column-' + index + '-data-type').val();
			var nameInput = $('#column-' + index + '-property-name');
			var namePassed, setValuesPassed, passed, newProperty;
			if(dataType == 'SET' || dataType == 'MULTISET') {
				setValuesPassed = formUtil.validateOne('#column-' + index + '-set-values');
			} else {
				setValuesPassed = {
					passed: true
				};
			}
			namePassed = !nameExist && formUtil.validateOne(nameInput).passed;
			passed = namePassed && setValuesPassed.passed;
			if(passed) {
				newProperty = {};
				newProperty.name = nameInput.val();
				newProperty.propertyType = dataType;
				if(dataType == 'SET' || dataType == 'MULTISET') {
					newProperty.items = [];
					$.each(setValuesPassed.data, function(i, val) {
						newProperty.items.push({value: val});
					});
				} else {
					newProperty.items = [];
				}
			} else {
				column.newProperty = null;
				if(!namePassed) {
					if(nameExist) {
						formUtil.highLight(nameInput, 'Property name exist');
					}
					formUtil.focus(nameInput);
				} else if(!setValuesPassed.passed) {
					formUtil.focus('#column-' + index + '-set-values');
				}
			}
			callback && callback(passed, newProperty);
		});
	};

	function _getColumnIndex(el) {
		return parseInt($(el).closest('[data-column-index]').data('column-index'));
	};

	function _removeFromPropertyDataSource(rItem) {
		if(!rItem) {
			return;
		}
		$.each(_propertyDataSource, function(i, item) {
			if(rItem.id == item.id) {
				_propertyDataSource.splice(i, 1);
				return false;
			}
		});
	};

	function _addToPropertyDataSource(aItem) {
		var hasSame = false;
		if(!aItem) {
			return;
		}
		$.each(_propertyDataSource, function(i, item) {
			if(aItem.id == item.id) {
				hasSame = true;
				return false;
			}
		});
		hasSame || _propertyDataSource.unshift(aItem);
	};

	function _initPropertyAutoComplete(evt, callback) {
		var oIndex;
		if(_propertyDataSource) {
			callback && callback();
			return;
		}
		if(evt) {
			oIndex = _getColumnIndex(this);
		}
		require(['auto-complete'], function(AutoComplete) {
			rfl.service.getProperties(_listId, function(propertys) {
				_propertyDataSource = _propertyDataSource || propertys.concat();
				$('[data-type="matched-name-input"]').each(function(i, el) {
					var index = _getColumnIndex(el);
					var column = _data.columns[index];
					_removeFromPropertyDataSource(column.matched);
				});
				$('[data-type="matched-name-input"]').each(function(i, el) {
					var index = _getColumnIndex(el);
					var column = _data.columns[index];
					var th = $(el).closest('th');
					_propertyAutoCompletes[index] && _propertyAutoCompletes[index].destroy();
					_propertyAutoCompletes[index] = new AutoComplete(el, {
						excludeExist: true,
						maxSelection: 1,
						dataSource: _propertyDataSource,
						initData: column.matched ? [column.matched] : [],
						onSelect: function(item) {
							column.matched = {id: item.id, name: item.name, userSelection: true};
							th.removeClass(_ALL_STATUS_CLASSNAME).addClass('matched');
							_renderShowType();
							_removeFromPropertyDataSource(item);
							setTimeout(function() {
								formUtil.validate($('[data-type="match-form"]', th));
							}, 200);
						},
						onRemove: function(items) {
							var item = items[0];
							_addToPropertyDataSource(item);
							if(item.id == column.matched.id) {
								column.matched = null;
								th.removeClass(_ALL_STATUS_CLASSNAME).addClass('follow-up');
								_renderShowType();
								formUtil.validate($('[data-type="match-form"]', th));
							}
						}
					});
					index == oIndex && _propertyAutoCompletes[index].showFullList(true);
				});
				$('#main-div').undelegate('[data-type="matched-name-input"]', 'focus', _initPropertyAutoComplete);
				callback && callback();
			});
			
		});
	};

	function _initGroupMap(groupIds) {
		require(['./group-map-main', 'ajax!' + G.getAjaxLoadUrl('lists/' + _listId + '/groups')], function(GroupMap, data) {
			if(_groupMap || rfl.ajax.dealCommonCode(data.code) || data.code !== 0) {
				return;
			}
			_groups = data.data.groups;
			_groupMap = new GroupMap('#action-set-section', _groups, {
				listId: _listId,
				maxSelection: 999,
				editable: true,
				selected: groupIds
			});
		});
	};

	function _render(mark, listId, step, sid, groupIds) {
		if(groupIds) {
			_groupIds = groupIds.split('_');
		} else {
			_groupIds = [];
		}
		$('#main-div').html(mainTpl.render($.extend(_data, {
			listId: listId,
			showType: _showType,
			lang: {common: langResourceCommon, customer: langResourceCustomer, propertyTypes: langResourcePropertyTypes}
		}))).delegate('[data-type="matched-name-input"]', 'focus', _initPropertyAutoComplete);
		_renderShowType();
		formUtil.initPlaceHolder('[data-type="set-values-input"]', {
			onFocus: function() {
				$(this).addClass('focus');
			},
			onBlur: function() {
				$(this).removeClass('focus');
			}
		});
		formUtil.validate('[data-type="match-form"]');
		rfl.mockupFormControl.on('toggle-checkbox', function(evt) {
			var target = evt.target;
			if(target.name == 'selectActionSet') {
				if(target.checked) {
					_initGroupMap(_groupIds);
					$('#action-set-section').removeClass('hidden');
				} else {
					$('#action-set-section').addClass('hidden');
				}
			} else if(target.name == 'createCampaign') {
				if(target.checked) {
					$('#create-campaign-section').removeClass('hidden');
					formUtil.focus('#edit-campaign-name');
				} else {
					$('#create-campaign-section').addClass('hidden');
				}
			}
		});
		if(_groupIds.length) {
			_initGroupMap(_groupIds);
			$('#action-set-section').removeClass('hidden');
			rfl.mockupFormControl.setCheckbox('selectActionSet', true);
		}
	};

	function switchDataType(el) {
		var section = $(el).closest('th').find('[data-type="set-values"]');
		if(el.value == 'SET' || el.value == 'MULTISET') {
			section.show();
		} else {
			section.hide();
		}
	};
	
	function render() {
		rfl.ajax.history.dispatch(function(mark, listId, step, sid, groupIds) {
			_listId = listId;
			_sid = sid;
			_propertyAutoCompletes = [];
			_propertyDataSource = null;
			_groupAutoComplete && _groupAutoComplete.destroy();
			_groupAutoComplete = null;
			_groupMap && _groupMap.destroy();
			_groupMap = null;
			rfl.ajax.get({
				url: 'mappingDetail/' + sid,
				cache: false,
				data: {},
				success: function(res) {
					if(res.code === 0) {
						_data = res.data;
						_render(mark, listId, step, sid, groupIds);
					} else if(res.code === rfl.config.RES_CODE.RESOURCE_NOT_EXIST) {
						rfl.ui.renderInvalidUrl('#main-div');
					} else {
						rfl.alerts.show(res.message, 'error');
					}
				},
				error: function() {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
				}
			});
			formUtil.setCommonMsg(langResourceCommon.msg.validator);
			_bindEvent();
		});
	};
	
	return {
		switchDataType: switchDataType,
		render: render
	};
});