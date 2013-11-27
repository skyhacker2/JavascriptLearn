define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var customerList = require('./customer-list');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var listTpl = require('./list-customer-list.tpl.html');
	
	var _data = null;
	var _columns = null;
	var _listId, _listName, _page, _itemsPerPage;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'importCustomers', function(evt) {
			rfl.util.toBase64({listName: _listName}, function(res) {
				rfl.util.gotoUrl('customer/import#!' + _listId + '/' + res)
			});
		}, 1).delegate('click', 'setItemsPerPage', function(evt, num) {
			if(_itemsPerPage == num) {
				return;
			}
			rfl.ajax.history.dispatch(function(mark, listId, page, sortKey, sortOrder) {
				var hash;
				customerList.setPageSize(num);
				page = 1;
				hash = '#!' + [listId, page, sortKey || '', sortOrder || ''].join('/');
				if(location.hash == hash) {
					_render(mark, listId, page, sortKey, sortOrder);
				} else {
					location.hash = hash;
				}
			});
		}, 1).delegate('click', 'editListName', function(evt) {
			require(['instant-editor'], function(instantEditor) {
				instantEditor.show({propertyType: 'TEXT'}, $(evt.target).closest('h1'), function(inputBox, opt) {
					require(['form-util'], function(formUtil) {
						formUtil.setCommonMsg(langResourceCommon.msg.validator);
						var valid = formUtil.validateOne(inputBox);
						var val = inputBox.value;
						if(valid.passed) {
							if(val != _data.groupName) {
								rfl.ajax.put({
									url: 'lists/' + _listId,
									data: {
										name: val
									},
									success: function(res) {
										if(res.code === 0) {
											_data.listName = val;
											$('[data-type="list-name"]').html(rfl.util.encodeHtml(val));
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
					initVal: _listName,
					validator: 'mandatory name',
					maxlength: rfl.config.MAX_LENGTH.NAME,
					lang: langResourceCommon
				});
			});
		}, 1);
		_bindEvent = rfl.empty;
	};
	
	function _render(mark, listId, page, sortKey, sortOrder) {
		_itemsPerPage = customerList.getPageSize();
		_page = page = parseInt(page) || 1;
		sortOrder = sortOrder == 'desc' ? 'desc' : 'asc';
		rfl.ajax.get({
			url: 'lists/' + _listId + '/customers',
			cache: false,
			data: {
				pageNumber: page - 1,
				pageSize: _itemsPerPage,
				property: sortKey || '',
				direction: sortOrder
			},
			success: function(res) {
				if(res.code === 0) {
					_data = res.data;
					$('#main-div').html(listTpl.render({
						listId: listId,
						listName: _listName,
						ajaxPagerUrlPattern: [listId, '{{page}}', sortKey, sortOrder].join('/'),
						lang: {common: langResourceCommon, customer: langResourceCustomer},
						data: res.data,
						totalItems: res.data.total,
						pageItems: _data.customers.length,
						itemsPerPage:  _itemsPerPage,
						auth: rfl.auth,
						//
						page: page
					}, {util: rfl.util}));
					formUtil.initPlaceHolder('#customer-search-box');
					if(_data && _data.customers.length) {
						customerList.renderDataGrid('#data-grid', _listId, _columns, _data.customers, {
							sortColumnId: sortKey,
							sortOrder: sortOrder,
							checkbox: true,
							opColumn: {
								id: 'op',
								name: 'Operation',
								width: 80,
								locked: G.IS_PC,
								title: '',
								textAlign: 'center',
								renderer: function(cellVal, rowIndex, rowData, columnIndex, columnData) {
									return '<a href="javascript:void(0);" onclick="return false;" data-rfl-click="delCustomer ' + rowIndex + '" title="' + langResourceCommon.label.del + '" data-toggle="tooltip">&nbsp;<i class="icon-trash"></i>&nbsp;</a>';
								}
							},
							headerRenderer: function(columnName, columnIndex, columnData, sortColumnId, sortOrder) {
								return rfl.config.CONTACT_PROPERTY_TYPE[columnData.propertyType] ? columnName : [
									'<a class="text-gray-dark" href="html/customer/list-customer-list-' + G.LANG + '.html#!' + _listId + '/' + _page + '/' + columnData.id + '/' + (sortColumnId == columnData.id && sortOrder == 'desc' ? 'asc' : 'desc') + '">',
										columnName,
										sortColumnId == columnData.id ? (sortOrder == 'desc' ? '<span class="data-grid-sort-arrow-down"></span>' : '<span class="data-grid-sort-arrow-up"></span>') : '',
									'</a>'
								].join('');
							},
							onSelect: function() {
								if(customerList.getDataGrid().getSelectedData('', 'id').length) {
									$('#main-div .batch-op-btns').removeClass('hidden');
								} else {
									$('#main-div .batch-op-btns').addClass('hidden');
								}
							},
							onDelete: function() {
								render();
							}
						});
					}
				} else {
					rfl.alerts.show(res.message, 'error');
				}
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};
	
	function render(mark, listId) {
		var args = arguments;
		if(args.length) {
			if(listId == _listId) {
				_render.apply(null, rfl.array.getArray(args));
			} else {
				rfl.ajax.get({
					url: 'lists/' + listId + '/propertys',
					success: function(res) {
						if(res.code === 0) {
							_listId = G.listId = listId;
							_listName = res.data.listName;
							_columns = res.data.propertys;
							_render.apply(null, rfl.array.getArray(args));
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
			rfl.ajax.history.dispatch(function() {
				render.apply(null, rfl.array.getArray(arguments));
			});
		}
	};
	
	function init(initData) {
		_listId = initData.listId;
		_listName = initData.listName;
		_columns = initData.propertys;
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_bindEvent();
		rfl.ajax.history.init(4, render);
	};
	
	return {
		render: render,
		init: init
	};
});
