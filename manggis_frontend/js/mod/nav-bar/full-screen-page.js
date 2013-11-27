define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');

	var _containerScroll = false;

	var fullScreenPage = {};

	fullScreenPage.checkScroll = function(dom, scrollDom) {
		var winScroll = dom === window;
		$(dom).on('scroll', function(evt) {
			var scrollTop;
			if(winScroll) {
				if(_containerScroll) {
					return;
				}
				scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
			} else {
				scrollTop = $(scrollDom || dom)[0].scrollTop;
				_containerScroll = true;
			}
			if(scrollTop > (winScroll ? 60 : 120)) {
				$(document.body).addClass('hide-top-bar');
			} else if(scrollTop <= 60) {
				$(document.body).removeClass('hide-top-bar');
			}
		});
	};
	
	fullScreenPage.init = function() {
		$(document.body).delegate('.full-screen-page-footer .steps li.dropdown, .full-screen-page-header .header-actions li.dropdown', 'mouseenter', function(evt) {
			$(this).addClass('on');
		})
		.delegate('.full-screen-page-footer .steps li.dropdown, .full-screen-page-header .header-actions li.dropdown', 'mouseleave', function(evt) {
			$(this).removeClass('on');
		});
		fullScreenPage.checkScroll(window);
		fullScreenPage.init = rfl.empty;
	};
	
	return fullScreenPage;
});