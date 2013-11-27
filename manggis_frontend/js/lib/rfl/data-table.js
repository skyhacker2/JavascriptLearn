define(function(require) {
	var $ = require('jquery');
	var Observer = require('./observer');
	var Delegator = require('./delegator');

	var _observers = {};
	
	var dataTable = {};
	
	dataTable.bindRowSelectionEvent = function() {
		Delegator.getPageDelegator().delegate('click', 'toggleDataTableAllRows', function(evt, container) {
			if(!container) {
				return;
			}
			var checked = this.checked;
			$(decodeURIComponent(container)).find('[data-toggle="data-table-row"]').each(function(i, item) {
				if(checked) {
					item.checked = true;
					$(item).closest('.mockup-checkbox').addClass('on');
				} else {
					item.checked = false;
					$(item).closest('.mockup-checkbox').removeClass('on');
				}
			});
			var observer = _observers['select'];
			observer && observer.dispatch({});
		}).delegate('click', 'toggleDataTableRow', function(evt, container) {
			if(!container) {
				return;
			}
			var checked = this.checked;
			var allChecked = true;
			var checkbox;
			if(checked) {
				$(decodeURIComponent(container)).find('[data-toggle="data-table-row"]').each(function(i, item) {
					if(!item.checked) {
						allChecked = false;
					}
				});
				if(allChecked) {
					checkbox = $(decodeURIComponent(container)).find('[data-toggle="data-table-all-rows"]');
					checkbox[0].checked = true;
					checkbox.closest('.mockup-checkbox').addClass('on');
				}
			} else {
				checkbox = $(decodeURIComponent(container)).find('[data-toggle="data-table-all-rows"]');
				checkbox[0].checked = false;
				checkbox.closest('.mockup-checkbox').removeClass('on');
			}
			var observer = _observers['select'];
			observer && observer.dispatch({});
		});
		dataTable.bindRowSelectionEvent = function() {};
	};

	dataTable.getSelectedList = function(container) {
		var res = [];
		$(decodeURIComponent(container)).find('[data-toggle="data-table-row"]').each(function(i, item) {
			if(item.checked) {
				res.push({checkbox: item, data: item.getAttribute('data-row-data')});
			}
		});
		return res;
	};

	dataTable.getSelectedDataList = function(container) {
		var res = [];
		$(decodeURIComponent(container)).find('[data-toggle="data-table-row"]').each(function(i, item) {
			if(item.checked) {
				res.push(item.getAttribute('data-row-data'));
			}
		});
		return res;
	};

	dataTable.on = function(type, handler) {
		var observer = _observers[type] = _observers[type] || new Observer();
		observer.subscribe(handler);
	};
	
	return dataTable;
});