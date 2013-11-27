define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var CustomizableDataGrid = require('customizable-data-grid');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var langResourceCdg = require('../../lang/' + G.LANG + '/customizable-data-grid');
	
	var _pageSize = 10;
	var _data = null;
	var _dataGrid = null;
	var _columns = null;
	var _listId;
	var _emailColumnId;
	var _instantEditor;
	var _onDelete;

	function _delCustomer(ids) {
		rfl.ajax.del({
			queueName: 'deleteCustomers',
			url: 'lists/' + _listId + '/customers',
			data: ids,
			success: function(res) {
				if(res.code === 0) {
					rfl.alerts.show(res.message, 'success');
					_onDelete && _onDelete();
				} else {
					rfl.alerts.show(res.message,'error');
				}
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};

	function _editCustomerProperty(rowIndex, columnIndex, columnId) {
		require(['instant-editor'], function(instantEditor) {
			_instantEditor = instantEditor;
			var initVal = _data[rowIndex].property[columnId] || '';
			var cell = $('#data-grid-x-cell-' + rowIndex + '-' + columnIndex);
			var column, tmp;
			$.each(_columns, function(i, col) {
				if(col.id == columnId) {
					column = col;
					return false;
				}
			});
			if(column.propertyType == 'DATE') {
				rfl.css.load('js/lib/datepicker/main.css');
				initVal = rfl.util.formatDateTime(initVal, 'yyyy-MM-dd');
			} else if(column.propertyType == 'SET') {
				if(initVal && column.itemIdValMap[initVal]) {
					initVal = {id: initVal, name: column.itemIdValMap[initVal]};
				}
			} else if(column.propertyType == 'MULTISET') {
				if(initVal && initVal.length) {
					tmp = [];
					$.each(initVal, function(i, id) {
						if(column.itemIdValMap[id]) {
							tmp.push({id: id, name: column.itemIdValMap[id]});
						}
					});
					initVal = tmp;
				}
			}
			instantEditor.show(column, cell, function(inputBox, opt) {
				require(['form-util'], function(formUtil) {
					formUtil.setCommonMsg(langResourceCommon.msg.validator);
					if(column.propertyType == 'DATE') {
						inputBox.value = inputBox.value.replace(/\/0/g, '/');
					}
					var valid = formUtil.validateOne(inputBox);
					var val = inputBox.value;
					var property = {};
					if(valid.passed) {
						if(column.propertyType == 'SET' || column.propertyType == 'MULTISET') {
							val = opt.autoComplete.getSelectedPropList('name').join(' || ');
						}
						if(val != initVal) {
							if(column.propertyType == 'DATE') {
								property[columnId] = val && (opt.date.getTime() + '');
							} else if(column.propertyType == 'SET') {
								property[columnId] = opt.autoComplete.getSelectedPropList('id')[0] || '';
							} else if(column.propertyType == 'MULTISET') {
								property[columnId] = opt.autoComplete.getSelectedPropList('id');
							} else {
								property[columnId] = val;
							}
							rfl.ajax.put({
								url: 'lists/customers/' + _data[rowIndex].id,
								data: {
									property: property
								},
								success: function(res) {
									var cell;
									if(res.code === 0) {
										_data[rowIndex].property[columnId] = property[columnId];
										cell = $('#data-grid-x-' + rowIndex + '-' + columnIndex + '-content');
										cell.html(rfl.util.encodeHtml(val));
										cell.closest('.data-grid-cell-inner').attr('title', val);
										instantEditor.hide();
									} else {
										formUtil.highLight(inputBox, res.message);
									}
								},
								error: function() {
									formUtil.highLight(inputBox, langResourceCommon.msg.serverBusy);
								}
							});
						} else {
							instantEditor.hide();
						}
					}
				});
			}, {
				initVal: initVal,
				dateFormat: 'yyyy-MM-dd',
				separator: ' || '
			});
		});
	};
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'delCustomer', function(evt, rowIndex) {
			var email = _dataGrid.getDataByRowIndex(rowIndex, 'property', _emailColumnId);
			rfl.alerts.confirm(rfl.util.formatMsg(langResourceCustomer.msg.delCustomer, [email]), function() {
				_delCustomer([_data[rowIndex].id]);
			}, {makeSure: true});
		}, 1).delegate('click', 'batchDelCustomers', function(evt, rowIndex) {
			if(!_dataGrid) {
				return;
			}
			var ids = _dataGrid.getSelectedData('', 'id');
			if(!ids.length) {
				rfl.alerts.show(langResourceCommon.msg.selectAtLeastOne, 'warn');
				return;
			}
			rfl.alerts.confirm(langResourceCustomer.msg.delCustomers, function() {
				_delCustomer(ids);
			}, {makeSure: true});
		}, 1).delegate('click', 'editCustomerProperty', function(evt, rowIndex, columnIndex, columnId) {
			_editCustomerProperty(rowIndex, columnIndex, columnId);
		}, 1);
		_bindEvent = rfl.empty;
	};

	function _getDiaplayValue(rawVal, column) {
		var res = rawVal;
		if(rawVal) {
			if(column.propertyType === 'DATE') {
				res = rfl.util.formatDateTime(rawVal, 'yyyy-MM-dd');
			} else if(rfl.config.CONTACT_PROPERTY_TYPE[column.propertyType]) {
				res = typeof rawVal == 'string' ? rawVal : rawVal.join('; ');
			} else if(column.propertyType === 'SET') {
				res = column.itemIdValMap[rawVal] || '';
			} else if(column.propertyType === 'MULTISET') {
				tmp = [];
				$.each(rawVal, function(i, id) {
					if(column.itemIdValMap[id]) {
						tmp.push(column.itemIdValMap[id]);
					}
				});
				res = tmp.join(' || ');
			}
		}
		return res;
	};

	function _initColumns(listId, columns, opt) {
		var setting = rfl.localStorage.get('CUSTOMER_COLUMN_SETTING_' + listId);
		var settingMap = {};
		columns = columns.concat();
		if(setting) {
			setting = rfl.json.parse(setting);
			$.each(setting.columns, function(i, column) {
				settingMap[column.id] = column;
				column.sequence = i;
			});
		}
		$.each(columns, function(i , column) {
			var setting = settingMap[column.id] || {};
			var itemIdValMap = column.itemIdValMap = {};
			column.sortable = true;
			column.title = '';
			column.width = setting.width;
			column.hidden = setting.hidden;
			if(column.propertyType == 'EMAIL') {
				_emailColumnId = column.id;
				if(setting.locked !== false) {
					column.locked = true;
				}
				if(!G.IS_PC) {
					settingMap[column.id] = settingMap[column.id] || {};
					settingMap[column.id].sequence = 0;
				}
			} else {
				column.locked = setting.locked;
			}
			if(!G.IS_PC) {
				column.locked = false;
			}
			if(column.items && column.items.length) {
				$.each(column.items, function(i, item) {
					itemIdValMap[item.id] = item.value;
				});
			}
			column.renderer = function(cellVal, rowIndex, rowData, columnIndex, columnData) {
				cellVal = _getDiaplayValue(cellVal, column);
				return rfl.config.CONTACT_PROPERTY_TYPE[columnData.propertyType] || rfl.config.ID_PROPERTY_TYPE[columnData.propertyType] ? (cellVal && rfl.util.encodeHtml(cellVal) || '') : '<a class="hidden" href="javascript:void(0);" onclick="return false;" data-rfl-click="editCustomerProperty ' + rowIndex + ' ' + columnIndex + ' ' + columnData.id + '">&nbsp;<i class="icon-pencil"></i>&nbsp;</a><span id="data-grid-x-' + rowIndex + '-' + columnIndex + '-content">' + (cellVal && rfl.util.encodeHtml(cellVal) || '') + '</span>';
			};
			column.titleRenderer = function(cellVal, rowIndex, rowData, columnIndex, columnData) {
				cellVal = _getDiaplayValue(cellVal, column);
				return cellVal && rfl.util.encodeHtml(cellVal) || '';
			};
			column.headerRenderer = opt.headerRenderer;
		});
		columns.sort(function(a, b) {
			var sa = settingMap[a.id];
			var sb = settingMap[b.id];
			if(sa && sb) {
				return sa.sequence - sb.sequence;
			} else if(sa) {
				return -1;
			} else {
				return 1;
			}
		});
		if(opt.opColumn !== false) {
			columns.unshift(opt.opColumn || {
				id: 'op',
				name: 'Operation',
				width: 60,
				locked: G.IS_PC,
				title: '',
				textAlign: 'center',
				renderer: function(cellVal, rowIndex, rowData, columnIndex, columnData) {
					return '<a href="javascript:void(0);" onclick="return false;" data-rfl-click="delCustomer ' + rowIndex + '" title="' + langResourceCommon.label.del + '" data-toggle="tooltip">&nbsp;<i class="icon-trash"></i>&nbsp;</a>';
				}
			});
		}
		_columns = columns;
		return columns;
	};
	
	function renderDataGrid(container, listId, columns, data, opt) {
		var setting = rfl.localStorage.get('CUSTOMER_COLUMN_SETTING_' + listId);
		opt = opt || {};
		_bindEvent();
		_listId = listId;
		_onDelete = opt.onDelete;
		_dataGrid && _dataGrid.destroy();
		_dataGrid = new CustomizableDataGrid(container, _initColumns(listId, columns, opt), {
			langResource: langResourceCdg,
			width: 'auto',
			height: setting && rfl.json.parse(setting).height,
			sequence: {width: 44},
			checkbox: opt.checkbox === false ? false : {width: 44},
			bordered: true,
			striped: true,
			sortColumnId: opt.sortColumnId,
			sortOrder: opt.sortOrder,
			dataProperty: 'property',
			onSelect: opt.onSelect,
			onBeforeRender: function() {
				_instantEditor && _instantEditor.hide();
			},
			onSettingApply: function(setting) {
				var cols = [];
				_columns = setting.columns;
				$.each(setting.columns, function(i, column) {
					var col = {
						id: column.id,
						width: column.width
					};
					if(typeof column.locked != undefined) {
						col.locked = column.locked;
					}
					if(typeof column.hidden != undefined) {
						col.hidden = column.hidden;
					}
					cols.push(col);
				});
				setting.columns = cols;
				rfl.localStorage.set('CUSTOMER_COLUMN_SETTING_' + listId, rfl.json.stringify(setting));
			},
			onSettingShow: function() {
				$('#top-pager-wrapper').hide();
			},
			onSettingHide: function() {
				$('#top-pager-wrapper').show();
			}
		});
		_data = data;
		_dataGrid.render(_data);
	};

	function setPageSize(size) {
		size = parseInt(size);
		if(size > 0) {
			rfl.localStorage.set('CUSTOMERS_PER_PAGE', size);
			_pageSize = size;
		}
	};

	function getPageSize() {
		return parseInt(rfl.localStorage.get('CUSTOMERS_PER_PAGE')) || _pageSize;
	};

	function getDataGrid() {
		return _dataGrid;
	};

	function getEmailColumnId() {
		return _emailColumnId;
	};
	
	return {
		renderDataGrid: renderDataGrid,
		setPageSize: setPageSize,
		getPageSize: getPageSize,
		getDataGrid: getDataGrid,
		getEmailColumnId: getEmailColumnId
	};
});
