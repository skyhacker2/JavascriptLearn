define(function(require) {
	var ajax = require('./ajax');
	var alerts = require('./alerts');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	
	var _data;
	var _hasPerm = {};
	
	var auth = {};
	
	auth.init = function(data, callback) {
		if(!ajax.dealCommonCode(data.code)) {
			if(data.code === 0) {
				_data = data.data;
				$.each(_data.authorities, function(i, k) {
					_hasPerm[k] = 1;
				});
				callback && callback();
			} else {
				alerts.show(data.message, 'error');
			}
		}
	};

	auth.getData = function(type) {
		if(type) {
			return _data[type];
		} else {
			return _data;
		}
	};
	
	auth.hasPerm = function(perm) {
		return true;
		return !!_hasPerm[perm];
	};

	auth.canAccessGroup = function(groupId) {
		var currentGroup = auth.getData('currentGroup');
		return currentGroup.superGroup || groupId == currentGroup.id;
	};

	auth.checkAndWarn = function(perm, checkGroup, groupId) {
		if(perm && !auth.hasPerm(perm) || checkGroup && !auth.canAccessGroup(groupId)) {
			alerts.show(langResourceCommon.msg.noPerm, {type: 'error', timeout: 0});
			return false;
		}
		return true;
	};
	
	return auth;
});