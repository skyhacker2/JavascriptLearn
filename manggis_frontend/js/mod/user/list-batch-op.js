define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceUser = require('../../lang/' + G.LANG + '/user');

	function _activateUsers(idList, callback) {
		rfl.ajax.put({
			queueName: 'activateUsers',
			url: 'users/activate',
			data: idList,
			success: function(res) {
				rfl.alerts.show(res.message, res.code === 0 ? 'success' : 'error');
				callback && callback();
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};

	function _deactivateUsers(idList, callback) {
		rfl.ajax.put({
			queueName: 'deactivateUsers',
			url: 'users/deactivate',
			data: idList,
			success: function(res) {
				rfl.alerts.show(res.message, res.code === 0 ? 'success' : 'error');
				callback && callback();
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};

	function _deleteUsers(idList, callback) {
		rfl.ajax.del({
			queueName: 'deleteUsers',
			url: 'users',
			data: idList,
			success: function(res) {
				rfl.alerts.show(res.message, res.code === 0 ? 'success' : 'error');
				callback && callback();
			},
			error: function() {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};

	function _removeHighLight() {
		$('#main-div tr').removeClass('error');
	};

	function activateUsers(data, callback) {
		var validList = [];
		var invalidList = [];
		_removeHighLight();
		$.each(rfl.dataTable.getSelectedList('#main-div'), function(i, item) {
			var user = data[item.data];
			if(user.enabled) {
				invalidList.push(item);
			} else {
				validList.push(user.id);
			}
		});
		if(invalidList.length) {
			if(validList.length) {
				$.each(invalidList, function(i, item) {
					$(item.checkbox).closest('tr').addClass('error');
				});
				rfl.alerts.confirm(
					langResourceUser.msg.someUsersActive,
					function() {
						_removeHighLight();
						_activateUsers(validList, callback);
					},
					function() {
						_removeHighLight();
					}
				);
			} else {
				rfl.alerts.show(langResourceUser.msg.allUsersActive, 'error');
			}
		} else if(validList.length) {
			_activateUsers(validList, callback);
		}
	};

	function deactivateUsers(data, callback) {
		var validList = [];
		var invalidList = [];
		_removeHighLight();
		$.each(rfl.dataTable.getSelectedList('#main-div'), function(i, item) {
			var user = data[item.data];
			if(!user.enabled) {
				invalidList.push(item);
			} else {
				validList.push(user.id);
			}
		});
		if(invalidList.length) {
			if(validList.length) {
				$.each(invalidList, function(i, item) {
					$(item.checkbox).closest('tr').addClass('error');
				});
				rfl.alerts.confirm(
					langResourceUser.msg.someUsersInactive,
					function() {
						_removeHighLight();
						_deactivateUsers(validList, callback);
					},
					function() {
						_removeHighLight();
					}
				);
			} else {
				rfl.alerts.show(langResourceUser.msg.allUsersInactive, 'error');
			}
		} else if(validList.length) {
			_deactivateUsers(validList, callback);
		}
	};

	function deleteUsers(data, callback) {
		var idList = [];
		$.each(rfl.dataTable.getSelectedDataList('#main-div'), function(i, index) {
			var user = data[index];
			idList.push(user.id);
		});
		if(idList.length) {
			rfl.alerts.confirm(
				langResourceUser.msg.delUsersConfirm,
				function() {
					_deleteUsers(idList, callback);
				},
				{makeSure: true}
			);
		}
	};
		
	return {
		activateUsers: activateUsers,
		deactivateUsers: deactivateUsers,
		deleteUsers: deleteUsers
	};
});