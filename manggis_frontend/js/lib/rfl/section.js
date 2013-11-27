define(function(require) {
	var $ = require('jquery');
	var events = require('./events');
	
	var section = {};
	
	section.collapse = function(id) {
		if(id) {
			$('#' + id).addClass('collapse');
		} else {
			$('.section-collapse').addClass('collapse');
		}
	};
	
	section.expand = function(id) {
		if(id) {
			$('#' + id).removeClass('collapse');
		} else {
			$('.section-collapse').removeClass('collapse');
		}
	};

	$.extend(section, events);

	section._addObservers(['toggle']);

	$(document).delegate('[data-toggle="section"]', 'click', function(evt) {
		$(this).closest('.section-collapse').toggleClass('collapse');
		section._dispatchEvent('toggle', evt);
	});
	
	return section;
});