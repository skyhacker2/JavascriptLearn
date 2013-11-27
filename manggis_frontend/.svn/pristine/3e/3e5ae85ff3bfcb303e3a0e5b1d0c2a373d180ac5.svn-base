define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	var langResourceAdRemark = require('lang/{{G.LANG}}/ad-remark');
	var listTpl = require('./list.tpl.html');
	var dialogTpl = require('./dialog.tpl.html');
	var formUtil = require('form-util');
	var AutoComplete = require('auto-complete');
	var domains = require('../campaign/domains/' + G.LANG);
	
	var _data = null;
	var _dialog = null;
	var _dataSource = [];
	var _domainMap = {};
	var _autoCompleteGroup;
	var domainTest = /^([a-zA-Z0-9\-]{1,63}\.)+[a-zA-Z0-9\-]{1,63}$/;

	for (var i = domains.length - 1; i >= 0; i--) {
		_domainMap[domains[i]] = i + 1;
		_dataSource.push({
			id: i + 1,
			name: domains[i]
		});
	}

	function _submit(data) {
		return function() {
			var valid = formUtil.validate($('#new-remark-form', _dialog));
			var groupDataLen = _autoCompleteGroup.getSelectedDataList().length;
			if (!groupDataLen) {
				formUtil.highLight($('#domains'), langResourceCommon.msg.validator.mandatory);
			} else {
				formUtil.highLight($('#domains'), '', '');
			}
			if (valid.passed && groupDataLen) {
				var _data = formUtil.getData($('#new-remark-form', _dialog));
				_data.domains = _autoCompleteGroup.getSelectedPropList('name');
				if (data) {
					rfl.ajax.put({
						url: 'adremarks/' + data.id,
						data: _data,
						success: function(res) {
							if(res.code === 0) {						
								rfl.alerts.show(res.message, 'success');
								render();
							} else {
								rfl.alerts.show(res.message,'error');
							}
						}
					});
				} else {
					rfl.ajax.post({
						url: 'adremarks',
						data: _data,
						success: function(res) {
							if(res.code === 0) {
								rfl.alerts.show(res.message, 'success');
								render();
							} else {
								rfl.alerts.show(res.message,'error');
							}
						}
					});
				}
				_dialog.modal('hide');
			} else {
				if (groupDataLen) {
					formUtil.focus(valid.failList[0].item);
				} else {
					formUtil.focus('#domains');
				}
			}
		}
	};
	
	function _edit(data) {
		_dialog = rfl.dialog.create({
			title: '[AD] Subject Suffix',
			content: dialogTpl.render({data: data || {}}),
			btns: [
				{
					text: data ? 'Update' : 'Create',
					className: 'btn-primary',
					click: _submit(data)
				}, 
				{
					text: 'Cancel',
					dismiss: true
				}
			]
		});
		rfl.Delegator.getDelegator(_dialog).delegate('keyup', 'submit', function(evt){
			if (evt.which === 13) {
				(_submit(data))();
			}
		});
		var initData,
			dataList;
		if (data && data.domains && data.domains.length) {
			initData = [];
			dataList = data.domains;
			for (var i = dataList.length; i--;) {
				if (!_domainMap[dataList[i]]) {
					domains.push(dataList[i]);
					initData.push({
						id: domains.length,
						name: dataList[i]
					});
					_domainMap[dataList[i]] = domains.length;
				} else {
					initData.push({
						id: _domainMap[dataList[i]],
						name: dataList[i]
					});
				}
			}
		}
		
		setTimeout(function () {
			_autoCompleteGroup = new AutoComplete('#domains', {
				richSelectionResult: true,
				dataSource: _dataSource,
				initData: initData,
				separator: '; ',
				noResultMsg: '',
				onKeyup: function(evt){
					if (evt.keyCode === 13 || (evt.keyCode > 36 && evt.keyCode < 41)) return;
					_dataSource.length = 0;
					if (this.value !== '' && !_domainMap[this.value] && domainTest.test(this.value)) {
						_dataSource.push({
							id: domains.length + 1,
							name: this.value
						});
					}
					for (var i = 0; i < domains.length; i++) {
						_dataSource.push({
							id: i + 1,
							name: domains[i]
						});
					}
				},
				onSelect: function (item) {
					if (!_domainMap[item.name]) {
						domains.push(item.name);
						_domainMap[item.name] = item.id;
					}
					this.value = '';
					this.focus();
				},
				onBlur: function () {
					for (var i = _dataSource.length; i--;) {
						if (_dataSource[i].name === this.value.replace(';', '')) {
							_autoCompleteGroup.addSelectedItem(_dataSource[i]);
							if (!_domainMap[_dataSource[i].name]) {
								domains.push(_dataSource[i].name);
								_domainMap[_dataSource[i].name] = _dataSource[i].id;
							}
							this.value = '';
						}	
					}		
				},
				onFocus: function () {
					return false;
				}
			});
			// paste patch
			_autoCompleteGroup._box.on('paste', function () {
				var that = this;
				setTimeout(function () {
					var values = that.value.split(';');
					var value;
					var i = 0;
					var len = values.length;
					var item;
					for (; i < len; i++) {
						value = $.trim(values[i]);
						if (domainTest.test(value)) {
							if (_domainMap[value]) {
								item = {
									id: _domainMap[value],
									name: value
								};
								_autoCompleteGroup.addSelectedItem(item);
							} else {
								item = {
									id: domains.length + 1,
									name: value
								};
								_dataSource.push(item);
								_autoCompleteGroup.addSelectedItem(item);
								domains.push(item.name);
								_domainMap[item.name] = item.id;
							}
						}
					}
					that.value = '';
				}, 20);
			});
		}, 500);
	}

	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'delRow', function(evt, i) {
			rfl.alerts.confirm(
				rfl.util.formatMsg(langResourceAdRemark.msg.delUserConfirm, [_data[i].domains, _data[i].remark]),
				function () {
					i = parseInt(i);
					rfl.ajax.del({
						queueName: 'delAdRemark',
						url: 'adremarks/' + _data[i].id,
						success: function (res) {
							if (res.code === 0) {
								rfl.alerts.show(res.message, 'success');
								render();
							} else {
								rfl.alerts.show(res.message,'error');
							}
						},
						error: function() {
							rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
						}
					});
				},
				{makeSure: true}
			);
		}, 1).delegate('click', 'editRow', function (evt, i) {
			_edit(_data[+i]);
		}, 1).delegate('click', 'create', function () {
			_edit();
		}, 1);

		_bindEvent = rfl.empty;
	}
	
	function _render (mark, page, sortKey, sortOrder) {
		page = parseInt(page) || 1;
		var currentGroup = rfl.auth.getData('currentGroup');
		rfl.ajax.get({
			url: 'adremarks',
			cache: false,
			data: {
				pageNumber: page - 1,
				pageSize: G.ITEMS_PER_PAGE,
				property: sortKey || '',
				direction: sortOrder == 'desc' ? 'desc' : 'asc'
			},
			success: function (res) {
				if (res.code === 0) {
					_data = res.data.adRemarks;
					$('#main-div').html(listTpl.render({
						langResourceCommon: langResourceCommon,
						ajaxPagerUrlPattern: ['{{page}}', sortKey, sortOrder].join('/'),
						data: res.data,
						totalItems: res.data.total,
						//
						page: page,
						sortKey: sortKey,
						sortOrder: sortOrder
					}, {util: rfl.util}));
				} else {
					rfl.alerts.show(res.message, 'error');
				}
			},
			error: function () {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
		
	};
	
	function render () {
		if (arguments.length) {
			_render.apply(null, rfl.array.getArray(arguments));
		} else {
			// a refresh call, get current status from mark
			rfl.ajax.history.dispatch(function () {
				_render.apply(null, rfl.array.getArray(arguments));
			});
		}
	};
	
	function init() {
		if (!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_bindEvent();
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		rfl.ajax.history.init(5, render);
	};
	
	return {
		render: render,
		init: init
	};
});