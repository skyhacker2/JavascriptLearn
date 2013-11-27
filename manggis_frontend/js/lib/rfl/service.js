define(function(require) {
	var $ = require('jquery');
	var util = require('./util');
	var ajax = require('./ajax');
	var alerts = require('./alerts');
	var langResourceCommon = require('lang/' + G.LANG + '/common');

	var service = {};
	
	_getListResources = function(resouceName, listId, callback, opt) {
		opt = opt || {};
		require(['ajax!' + G.getAjaxLoadUrl('lists/' + listId + '/' + resouceName + '@noCahce=' + (opt.noCahce ? 'true' : ''))], function(res) {
			if(ajax.dealCommonCode(res.code)) {
				return;
			}
			if(res.code === 0) {
				callback(res.data[resouceName]);
			} else {
				if(opt.error) {
					opt.error(res);
				} else {
					alerts.show(res.message, 'error');
				}
			}
		}, function() {
			if(opt.error) {
				opt.error({});
			} else {
				alerts.show(langResourceCommon.msg.serverBusy, 'error');
			}
		});
	};
	
	service.unshiftProperty = function(id) {
		util.unshiftLocalStoredList('FREQUENTLY_USED_PROPERTY_IDS', id);
	};
	
	service.getFrequencyOrderProperties = function(listId, callback, opt) {
		return _getListResources('propertys', listId, function(propertys) {
			var ids = util.getLocalStoredList('FREQUENTLY_USED_PROPERTY_IDS');
			var order = {};
			if(!(propertys && propertys.length && ids && ids.length)) {
				callback(propertys);
				return;
			}
			$.each(ids, function(i, id) {
				order[id] = ids.length - i;
			});
			propertys = propertys.concat();
			propertys.sort(function(a, b) {
				return (order[b.id] || 0) - (order[a.id] || 0);
			});
			callback(propertys);
		}, opt);
	};
	
	service.getProperties = function(listId, callback, opt) {
		return _getListResources('propertys', listId, callback, opt);
	};
	
	service.getCustomerGroups = function(listId, callback, opt) {
		return _getListResources('groups', listId, callback, opt);
	};

	return service;
});
