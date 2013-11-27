var require = require || {
	baseUrl: G.CDN_ORIGIN + G.CDN_BASE + 'js/',
	paths: {
		'jquery': 'lib/jquery/jquery-1.9.1-main',
		'bootstrap': 'lib/bootstrap-3.0/main',
		'spine': 'lib/spine/main',
		'rfl': 'lib/rfl/main',
		'smart-search': 'lib/smart-search/main',
		'form-util': 'lib/form-util/main',
		'pair-box': 'lib/pair-box/main',
		'auto-complete': 'lib/auto-complete/main',
		'data-grid': 'lib/data-grid/main',
		'customizable-data-grid': 'lib/customizable-data-grid/main',
		'instant-editor': 'lib/instant-editor/main',
		'file-uploader': 'lib/file-uploader/main',
		'datepicker': 'lib/datepicker/main',
		'timepicker': 'lib/timepicker/main',
		'base64': 'lib/base64/main',
		'raphael': 'lib/raphael/main',
		'morris': 'lib/morris/main',
		'codemirror': 'lib/codemirror/main',
		'ckeditor': 'lib/ckeditor-4.2.1/ckeditor-main',
		'just-gage': 'lib/just-gage/main'
	},
	urlArgs: {
		'jquery': 'max_age=30000000',
		'spine': 'max_age=30000000',
		'bootstrap': 'max_age=30000000',
		'rfl': 'max_age=30000000',
		'smart-search': 'max_age=30000000',
		'form-util': 'max_age=30000000',
		'pair-box': 'max_age=30000000',
		'auto-complete': 'max_age=30000000',
		'data-grid': 'max_age=30000000',
		'customizable-data-grid': 'max_age=30000000',
		'instant-editor': 'max_age=30000000',
		'file-uploader': 'max_age=30000000',
		'datepicker': 'max_age=30000000',
		'timepicker': 'max_age=30000000',
		'base64': 'max_age=30000000',
		'raphael': 'max_age=30000000',
		'morris': 'max_age=30000000',
		'codemirror': 'max_age=30000000',
		'ckeditor': 'max_age=30000000'
	},
	shim: {
		'jquery': {
			exports: 'jQuery'
		},
		'spine': {
			exports: 'Spine',
			deps: ['jquery']
		},
		'bootstrap': {
			exports: 'jQuery.fn.modal',
			deps: ['jquery']
		},
		'datepicker': {
			exports: 'jQuery.fn.datepicker',
			deps: ['jquery']
		},
		'base64': {
			exports: 'Base64'
		},
		'raphael': {
			exports: 'Raphael'
		},
		'morris': {
			exports: 'Morris',
			deps: ['raphael']
		},
		'codemirror': {
			exports: 'CodeMirror'
		},
		'ckeditor': {
			exports: 'CKEDITOR'
		},
		'just-gage': {
			exports: 'JustGage',
			deps: ['raphael']
		}
	},
	onLoadStart: function() {
		require(['rfl'], function(rfl) {
			rfl.ajax.showLoading();	
		});
	},
	onLoadEnd: function() {
		require(['rfl'], function(rfl) {
			rfl.ajax.hideLoading();	
		});
	},
	errCallback: function() {
		require(['rfl', 'lang/%{{_lang_}}%/common'], function(rfl, langResource) {
			rfl.alerts.show(langResource.msg.serverBusy, 'error');
		}, function() {
		});
	}
};