define(function(require) {
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var AutoComplete = require('auto-complete');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	var langResourceUser = require('lang/{{G.LANG}}/user');
	var mainTpl = require('./edit.tpl.html');
	var autoCompleteListTpl = require('./edit-auto-complete-list.tpl.html');
	var selectedGroupsTpl = require('./edit-selected-groups.tpl.html');
	
	var _isEdit = false;
	var _data;
	var _pairBox;
	var _autoComplete;
	var _autoCompleteBox;
	var _curEditGroup;
	var _roleList;

	function _getRoleList(callback, isNecessary) {
		if(_roleList) {
			callback && callback(_roleList);
		} else {
			rfl.ajax.get({
				url: 'roles',
				cache: false,
				data: {},
				success: function(res) {
					if(res.code === 0) {
						_roleList = res.data.roles;
						callback && callback(_roleList);
					} else {
						rfl.alerts.show(res.message, 'error');
					}
				},
				error: function() {
					isNecessary ? rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error') : (callback && callback([]));
				}
			});
		}
	}

	function _submit() {
		var currentGroup = rfl.auth.getData('currentGroup');
		var valid = formUtil.validate('#edit-user-form');
		var data = formUtil.getData('#edit-user-form');
		if(valid.passed) {
			rfl.ajax[_isEdit ? 'put' : 'post']({
				queueName: 'editUser',
				url: 'user' + (_isEdit ? '/' + _data.id : ''),
				data: $.extend(data, {
					email:  _isEdit ? _data.email : data.email, 
					groups: currentGroup.superGroup ? _pairBox.getSelectedDataList(function(item) {
						var res = {id: item.id, roleIds: []};
						item.roles && $.each(item.roles, function(i, role) {
							res.roleIds.push(role.id);
						});
						return res;
					}) : [],
					roleIds: currentGroup.superGroup ? [] : _autoComplete.getSelectedPropList('id')
				}),
				success: function(res) {
					if(res.code === 0) {
						rfl.alerts.show(res.message, {type: 'success', btns: [
							{
								text: 'Back to manage users',
								className: 'btn-success',
								click: function() {
									rfl.util.gotoUrl('user/list');
								}
							}
						], timeout: 10000});
						if(!_isEdit) {
							init(true, res.data);
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

	function _showAutoCompleteBox(target, groupId) {
		var offset = $(target).offset();
		_curEditGroup = _pairBox.getSelectedItemById(groupId);
		if(!_autoCompleteBox) {
			_autoCompleteBox = $('<div class="form-inline float-auto-complete-box" style="position: absolute; display: none;"><input type="text" class="form-control" data-rfl-cancel-bubble="click" style="margin-bottom: 5px; width: 300px;" /> <button class="btn btn-default close-float-auto-complete-box-btn" style="margin-bottom: 5px;">' + langResourceCommon.label.done + '</button></div>').appendTo('body');
			_initAutoComplete(_autoCompleteBox.find('input'), {
				richSelectionResult: true,
				nameMaxLength: 36, 
				initData: _curEditGroup.roles, 
				listStyle: {width: '282px'}, 
				onKeydown: function(evt) {
					if(evt.keyCode === 13 && !_autoComplete.isListShown()) {
						_hideAutoCompleteBox(evt);
					}
				}
			}, function() {
				doShow();
			});
		} else {
			doShow();
			_autoComplete.setSelectedData(_curEditGroup.roles);
		}
		function doShow() {
			$(target).css('visibility', 'hidden');
			_autoCompleteBox.css({left: (offset.left + 10) + 'px', top: (offset.top + 2) + 'px'});
			_autoCompleteBox.show();
			setTimeout(function() {
				_autoCompleteBox.find('input')[0].focus();
			}, 200);
		}
	};

	function _hideAutoCompleteBox(evt) {
		if(!_autoCompleteBox) {
			return;
		}
		if($(evt.target.parentNode).hasClass('auto-complete-rich-item')) {
			return;
		}
		if(evt.type == 'click' && $(evt.target).closest('.float-auto-complete-box').length && !$(evt.target).hasClass('close-float-auto-complete-box-btn')) {
			return;
		}
		_curEditGroup.roles = _autoComplete.getSelectedDataList();
		_pairBox.render();
		_autoCompleteBox.hide();
	};
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'viewPermissions', function(evt) {
			$('#permissions-div').show();
			$(this).remove();
		}).delegate('click', 'cancel', function(evt) {
			rfl.util.gotoUrl('user/list');
		}).delegate('click', 'save', function(evt) {
			_submit();
		}).delegate('click', 'addAllGroups', function(evt) {
			_pairBox && _pairBox.addAll();
		}, 1).delegate('click', 'removeAllGroups', function(evt) {
			_pairBox && _pairBox.removeAll();
		}, 1).delegate('click', 'selectRoleUnderGroup', function(evt, id) {
			_showAutoCompleteBox(this.parentNode, id);
		}, 1).delegate('keyup', 'keyupSubmit', function(evt) {
			if(evt.keyCode === 13) {
				_submit();
			}
		}).delegateAnonymous('click', _hideAutoCompleteBox);
		_bindEvent = rfl.empty;
	};

	function _initPairBox() {
		_getRoleList(function(roleList){
			require(['pair-box'], function(PairBox) {
				rfl.ajax.get({
					url: 'groups',
					cache: false,
					success: function(res) {
						if(res.code === 0) {
							var availableList = res.data.groups;
							var selectedList = _isEdit ? _data.groups : (availableList.length === 1 ? [availableList[0]] : []);
							//_isEdit || (roleList.length === 1) && (selectedList.length == 1) && (selectedList[0].roles = [roleList[0]]);
							_pairBox = new PairBox('#available-groups', '#selected-groups', availableList, {
								selectedDataList: selectedList,
								selectedListTpl: selectedGroupsTpl
							});
						} else {
							rfl.alerts.show(res.message, 'error');
						}
					},
					error: function() {
						rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
					}
				});
			});
		});

	};

	function _initAutoComplete(box, opt, callback) {
		_getRoleList(function(_roleList){
			_isEdit || opt.initData && opt.initData.length === 0 && (_roleList.length === 1) && (opt.initData = [_roleList[0]]);
			_autoComplete = new AutoComplete(box, $.extend({
				richSelectionResult: true,
				listMaxLength: 6,
				listTpl: autoCompleteListTpl,
				dataSource: _roleList
			}, opt));
			callback && callback();
		}, true);	
	}
	
	function init(isEdit, data, fromCreate) {
		var currentGroup = rfl.auth.getData('currentGroup');
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN', isEdit ? true : false, data && data.groups[0] && data.groups[0].id)) {
			return;
		}
		_isEdit = isEdit;
		_data = data;
		formUtil.setCommonMsg(langResourceCommon.msg.validator);
		$('#main-div').html(mainTpl.render({data: data || {}, currentGroup: currentGroup, isEdit: isEdit}));
		if(currentGroup.superGroup) {
			_initPairBox();
		} else {
			_autoComplete && _autoComplete.destroy();//destroy the former widget before repainting
			_initAutoComplete('#edit-user-roles', {
				excludeExist: true,
				nameMaxLength: 70, 
				initData: isEdit ? data.groups[0] && data.groups[0].roles || [] : [], 
				listStyle: {width: '542px'},
				onFocus: function(evt) {
					$('#edit-user-roles').addClass('input-xxlarge');
				},
				onBlur: function(evt) {
					$('#edit-user-roles').removeClass('input-xxlarge');
				},
				onKeydown: function(evt) {
					if(evt.keyCode === 13 && !_autoComplete.isListShown()) {
						_submit();
					}
				}
			});
		}
		_bindEvent();
		_isEdit || G.id('edit-user-email').focus();
	};
	
	return {
		init: init
	};
});
