define(function(require) {
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var PairBox = require('pair-box');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	var langResourceRole = require('lang/{{G.LANG}}/role');
	var editTpl = require('./edit.tpl.html');

	var _isEdit = false;
	var _data;
	var _pairBox;
	
	function _submit() {
		if(!_pairBox) {
			return;
		}
		var valid = formUtil.validate('#edit-role-form');
		var selectedPerms = [];
		$.each(_pairBox.getSelectedDataList(), function(i, item) {
			$.each(item.permissions, function(j, perm) {
				selectedPerms.push(perm.id);
			});
		});
		if(valid.passed) {
			rfl.ajax[_isEdit ? 'put' : 'post']({
				queueName: 'editRole',
				url: 'role' + (_isEdit ? '/' + _data.id : ''),
				data: $.extend(formUtil.getData('#edit-role-form'), {permissionIds: selectedPerms}),
				success: function(res) {
					if(res.code === 0) {
						if(_isEdit) {
							rfl.alerts.show(res.message, 'success');
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
							init(true, res.data, true);
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
			rfl.util.gotoUrl('role/list');
		}).delegate('click', 'save', function(evt) {
			_submit();
		}).delegate('click', 'addAllPerm', function(evt) {
			_pairBox && _pairBox.addAll();
		}, 1).delegate('click', 'removeAllPerm', function(evt) {
			_pairBox && _pairBox.removeAll();
		}, 1).delegate('keyup', 'keyupSubmit', function(evt) {
			if(evt.keyCode === 13) {
				_submit();
			}
		});
		_bindEvent = rfl.empty;
	};

	function _getPermissionGroupMap(list) {
		var res = {};
		$.each(list, function(i, group) {
			$.each(group.permissions, function(j, perm) {
				res[perm.id] = group;
			});
		});
		return res;
	};

	function _getPermissionIdMap(list) {
		var res = {};
		$.each(list, function(i, group) {
			$.each(group.permissions, function(j, perm) {
				res[perm.id] = perm;
			});
		});
		return res;
	};

	function _initPairBox() {
		rfl.ajax.get({
			url: 'permissionGroups',
			cache: false,
			success: function(res) {
				if(res.code === 0) {
					var availableList = res.data.permissionGroups;
					var selectedList = [];
					var selectedGroup = {};
					if(_isEdit) {
						var permissionGroupMap = _getPermissionGroupMap(availableList);
						var permissionIdMap = _getPermissionIdMap(availableList);
						$.each(_data.permissionIds, function(i, permId) {
							var group = permissionGroupMap[permId];
							selectedGroup[group.id] = selectedGroup[group.id] || {id: group.id, name: group.name, permissions: []};
							selectedGroup[group.id].permissions.push(permissionIdMap[permId]);
						});
						$.each(selectedGroup, function(groupId, group) {
							selectedList.push(group);
						});
					}
					_pairBox = new PairBox('#available-permissions', '#selected-permissions', availableList, {
						selectedDataList: selectedList,
						getStdItem: function(item) {
							return {
								id: item.id,
								name: item.name,
								children: item.permissions
							};
						},
						setChildren: function(item, children) {
							item.permissions = children;
						}
					});
				} else {
					rfl.alerts.show(res.message, 'error');
				}
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};

	function init(isEdit, data, fromCreate) {
		if(!rfl.auth.checkAndWarn('PERM_ROLE_ADMIN')) {
			return;
		}
		_isEdit = isEdit;
		_data = data;
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		$('#main-div').html(editTpl.render({data: data || {}, isEdit: isEdit}));
		_initPairBox();
		_bindEvent();
		fromCreate || G.id('edit-role-name').focus();
	};
	
	return {
		init: init
	};
});