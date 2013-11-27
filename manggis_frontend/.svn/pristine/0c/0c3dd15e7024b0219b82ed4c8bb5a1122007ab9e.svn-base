define(function(require) {
	var $ = require('jquery') || jQuery;
	
	return function(item) {
		var passed = false;
		var inputType, groupType;
		item = $(item)[0];
		switch(item.tagName) {
			case 'INPUT':
				inputType = item.type.toUpperCase()
				if(inputType == 'CHECKBOX' || inputType == 'RADIO') {
					passed = item.checked;
				} else {
					item.value = $.trim(item.value);
					passed = !!item.value;
				}
				break;
			case 'SELECT':
			case 'TEXTAREA':
				item.value = $.trim(item.value);
				passed = !!item.value;
				break;
			default:
				groupType = $(item).data('validate-type');
				if(groupType == 'checkbox' || groupType == 'radio') {
					$('input[type="' + groupType + '"]', item).each(function(i, box) {
						if(box.checked) {
							passed = true;
							return false;
						}
					});
				}
		}
		return passed;
	};
});
