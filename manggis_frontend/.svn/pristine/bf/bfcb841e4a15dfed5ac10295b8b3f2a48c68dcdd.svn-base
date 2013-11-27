var ROOT = (location.pathname.match(/(.*?\/)static\//) || ['/', '/'])[1];

var G = G || {
	DOMAIN: %{{config.domain}}%,

	ORIGIN: %{{config.origin}}%,
	CGI_ORIGIN: %{{config.cgiOrigin}}%,
	CDN_ORIGIN: %{{config.cdnOrigin}}%,

	BASE: '%{{config.base}}%' ? '%{{config.base}}%' : ROOT + 'static/',
	CGI_BASE: '%{{config.cgiBase}}%' ? '%{{config.cgiBase}}%' : ROOT,
	CDN_BASE: '%{{config.cdnBase}}%' ? '%{{config.cdnBase}}%' : ROOT + 'static/',

	LANG: '%{{_lang_}}%',
	LANG_MAP: {
		'en': 'en', 'zh-cn': 'zh-cn', 'zh-tw': 'zh-tw',
		'en_US': 'en', 'zh_CN': 'zh-cn', 'zh_TW': 'zh-tw'
	},
	LANG_BACKEND_MAP: {
		'en': 'en_US', 'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW'
	},

	//pager setting
	PAGE_ASIDE: %{{pageAside}}%,
	ITEMS_PER_PAGE: %{{itemsPerPage}}%,
	BATCH_OP_REQUIRES: %{{batchOpRequires}}%,
	ONE_SCREEN_RECORDS: %{{oneScreenRecords}}%,
	
	pageTime: [new Date()]
};

G.IS_PROTOTYPE = G.CGI_BASE.indexOf('/static/mockup-data/') >= 0;

if(G.LANG.indexOf('%{{') === 0) {
	G.LANG = 'en';
}

if(G.DOMAIN) {
	document.domain = G.DOMAIN;
}

G.THEME = (function() {
	var m = document.cookie.match(/(?:^|;)\s*theme=([a-zA-Z0-9]+)/);
	if(m) {
		return m[1];
	} else {
		return 'purple';
	}
})();

G.IS_PC = (function() {
	var ua = navigator.userAgent;
	var list = ['Android', 'iPhone', 'iPod', 'iPad', 'Windows Phone', 'BlackBerry', 'MeeGo', 'SymbianOS'];
	for(var i = 0, l = list.length; i < l; i++) {
		if(ua.indexOf(list[i]) > 0) {
			return false;
		}
	}
	return true;
})();

G.id = function(id) {
	return document.getElementById(id);
};

document.write([
	'<!--[if IE]><base href="' + G.ORIGIN + G.BASE + '"></base><![endif]--><!--[if !(IE)]><!--><base href="' + G.ORIGIN + G.BASE + '" /><!--<![endif]-->',
	window.PROXY_PAGE ? '' : '<link rel="shortcut icon" href="favicon.ico" />',
	window.PROXY_PAGE ? '' : '<link rel="stylesheet" href="' + G.CDN_ORIGIN + G.CDN_BASE + 'js/lib/bootstrap-3.0/less/bootstrap-' + G.THEME + '-main.css?max_age=30000000" />'
].join(''));