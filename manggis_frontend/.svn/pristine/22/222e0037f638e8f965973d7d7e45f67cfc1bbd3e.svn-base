define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var DataGrid = require('data-grid');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	var langResourceCustomer = require('lang/{{G.LANG}}/customer');
	var langResourceCustomerImport = require('lang/{{G.LANG}}/customer-import');

	var _data = {};

	function _renderIssue(issue) {
		var columnHeaders = issue.columnHeaders;
		var columns = [];
		var data = _data[issue.type] = [];
		$.each(issue.customers, function(i, customer) {
			data.push(customer);
			$.each(issue.found[i], function(i, found) {
				data.push(found);
			});
		});
	};
	
	function init(issues) {
		if(issues && issues.length) {
			$.each(issues, function(i, issue) {
				if(issue.type == 'chooseToMergeEmail' || issue.type == 'chooseToMergeEmail') {
					_renderIssue(issue);
				}
			});
		}
	};
	
	return {
		init: init
	};
});