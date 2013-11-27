define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	var langResourceUser = require('lang/{{G.LANG}}/user');
	var batchOpMod = require('./list-batch-op');
	var listTpl = require('./list.tpl.html');
	
	var _data = null;

	function _search() {
		rfl.ajax.history.dispatch(function(mark, page, sortKey, sortOrder, group, searchText) {
			page = 1;
			group = $('#search-group').val();
			rfl.ajax.history.setMark([page, sortKey, sortOrder, group].join('/'));
			render();
			return false;
		});
	};
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'delRow', function(evt, i) {
			rfl.alerts.confirm(
				rfl.util.formatMsg(langResourceUser.msg.delUserConfirm, [_data[i].email]),
				function() {
					i = parseInt(i);
					rfl.ajax.del({
						queueName: 'delUser',
						url: 'user/' + _data[i].id,
						success: function(res) {
							if(res.code === 0) {
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
		}, 1).delegate('click', 'delRows', function(evt) {
			batchOpMod.deleteUsers(_data, render);
		}, 1).delegate('click', 'toggleActiveRow', function(evt, i) {
			var item = _data[parseInt(i)];
			if(!item) {
				return;
			}
			rfl.ajax.put({
				queueName: 'toggleActiveGroup',
				url: 'user/' + (item.enabled ? 'deactivate/' : 'activate/') + item.id,
				success: function(res) {
					if(res.code === 0) {
						rfl.alerts.show(res.message, 'success');
						render();
					} else {
						rfl.alerts.show(res.message, 'error');
					}
				},
				error: function() {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
				}
			});
		}, 1).delegate('click', 'activateRows', function(evt) {
			batchOpMod.activateUsers(_data, render);
		}, 1).delegate('click', 'deactivateRows', function(evt) {
			batchOpMod.deactivateUsers(_data, render);
		}, 1).delegate('mouseover', 'showGroupAndRole', function(evt, i) {
			if(!G.IS_PC) {
				return;
			}
			var user = _data[parseInt(i)];
			var groups = [];
			$.each(user.groups, function(i, group) {
				var roles = [];
				groups.push('<strong>' + rfl.util.encodeHtml(group.name) + '</strong>');
				$.each(group.roles, function(j, role) {
					roles.push(rfl.util.encodeHtml(role.name));
				});
				if(roles.length) {
					groups.push('&nbsp;&nbsp;&nbsp;&nbsp;' + roles.join('; ') + '; ');
				}
			});
			if(groups.length) {
				$(this).popover({
					html: true,
					container: '#main-div',
					placement: 'right',
					title: langResourceUser.label.group + ' &amp; ' + langResourceUser.label.role,
					content: groups.join('<br />')
				}).popover('show');
			}
		}).delegate('mouseout', 'hideGroupAndRole', function(evt, i) {
			if(!G.IS_PC) {
				return;
			}
			var user = _data[parseInt(i)];
			$(this).popover('hide');
		});
		_bindEvent = rfl.empty;
	};
	
	function _render(mark, page, sortKey, sortOrder, groupId, searchText) {
		page = parseInt(page) || 1;
		var currentGroup = rfl.auth.getData('currentGroup');
		if(currentGroup.superGroup){
			rfl.ajax.get({
				url: 'groups',
				success: function(res) {
					if(res.code === 0) {
						getUsers(res.data.groups);
					}
				},
				error: function() {
					getUsers(rfl.auth.getData('groups'));
				}
			});
		} else {
			getUsers(rfl.auth.getData('groups'));
		}
		function getUsers(groups){
			rfl.ajax.get({
				url: 'users',
				cache: false,
				data: {
					pageNumber: page - 1,
					pageSize: G.ITEMS_PER_PAGE,
					property: sortKey || '',
					direction: sortOrder == 'desc' ? 'desc' : 'asc',
					groupId: groupId || '',
					criteriaString: decodeURIComponent(searchText || '')
				},
				success: function(res) {
					if(res.code === 0) {
						_data = res.data.users;
						$('#main-div').html(listTpl.render({
							rfl: rfl,
							ajaxPagerUrlPattern: ['{{page}}', sortKey, sortOrder, groupId, searchText].join('/'),
							lang: {common: langResourceCommon, user: langResourceUser},
							data: res.data,
							totalItems: res.data.total,
							auth: rfl.auth,
							groups: groups,
							currentGroup: rfl.auth.getData('currentGroup'),
							currentUserId: rfl.auth.getData('id'),
							//
							page: page,
							sortKey: sortKey,
							sortOrder: sortOrder,
							groupId: groupId,
							searchText: searchText
						}));
					} else {
						rfl.alerts.show(res.message, 'error');
					}
				},
				error: function() {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
				}
			});
		}
		
	};

	function changeGroup() {
		_search();
	};
	
	function render() {
		if(arguments.length) {
			_render.apply(null, rfl.array.getArray(arguments));
		} else {
			//a refresh call, get current status from mark
			rfl.ajax.history.dispatch(function() {
				_render.apply(null, rfl.array.getArray(arguments));
			});
		}
	};
	
	function init() {
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_bindEvent();
		rfl.dataTable.bindRowSelectionEvent();
		rfl.dataTable.on('select', function(e) {
			if(rfl.dataTable.getSelectedList('#main-div').length) {
				$('#main-div .batch-op-btns').removeClass('hidden');
			} else {
				$('#main-div .batch-op-btns').addClass('hidden');
			}
		});
		rfl.ajax.history.init(5, render);
	};
	
	return {
		changeGroup: changeGroup,
		render: render,
		init: init
	};
});