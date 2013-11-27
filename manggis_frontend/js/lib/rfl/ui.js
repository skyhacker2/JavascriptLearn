define(function(require) {
	var $ = require('jquery');
	var langResourceCommon = require('lang/' + G.LANG + '/common');
	
	var ui = {};

	ui.renderPageLoadError = function(container, opt) {
		opt = opt || {};
		$(container).html([
			'<div class="guiding error page-load-error off-screen off-top">',
				'<div class="icon-part">',
					'<i class="icon-frown"></i>',
				'</div>',
				'<div class="text-part">',
					'<h1>',
						opt.title || langResourceCommon.label.sorry,
					'</h1>',
					'<p class="desc">',
						opt.content || langResourceCommon.msg.pageLoadError,
					'</p>',
					opt.btn != undefined ? opt.btn : '<a class="btn btn-danger btn-lg" href="javascript:void(0);" onclick="location.reload();">' + langResourceCommon.label.refresh + ' <i class="icon-refresh"></i></a>',
				'</div>',
			'</div>'
		].join(''));
		setTimeout(function() {
			$('.off-screen', container).removeClass('off-top');
		}, 0);
	};

	ui.renderInvalidUrl = function(container) {
		ui.renderPageLoadError(container, {
			content: langResourceCommon.msg.invalidUrl,
			btn: ''
		});
	};
	
	return ui;
});
