G.getUrlParams = function(loc) {
	loc = loc || window.location;
	var raw = loc.search, res = {}, p, i;
	if(raw) {
		raw = raw.slice(1);
		raw = raw.split('&');
		for(i = 0, l = raw.length; i < l; i++) {
			p = raw[i].split('=');
			res[p[0]] = p[1] || '';
		}
	}
	raw = loc.hash;
	if(raw) {
		raw = raw.slice(1);
		raw = raw.split('&');
		for(i = 0, l = raw.length; i < l; i++) {
			p = raw[i].split('=');
			res[p[0]] = res[p[0]] || p[1] || '';
		}
	}
	return res;
};

G.getAjaxHistoryParams = function() {
	return location.hash.replace(/^#!/, '').split('/');
};

G.resolveUrl = function(base, url) {
	if(!url) {
		url = base;
		base = location.protocol + '//' + location.host + location.pathname;
	}
	if((/^https?:|^\//).test(url)) {
		return url;
	}
	if((/^#/).test(url)) {
		base = base + location.search;
		url = base + url;
	} else if((/^\?/).test(url)) {
		url = base + url;
	} else {
		if(!(/^\./).test(url)) {
			url = './' + url;
		}
		var bArr = base.split('/'),
			pArr = url.split('/'),
			part;
		bArr.pop();
		while(pArr.length) {
			part = pArr.shift();
			if(part == '..') {
				if(bArr.length) {
					part = bArr.pop();
					while(part == '.') {
						part = bArr.pop();
					}
					if(part == '..') {
						bArr.push('..', '..');
					}
				} else {
					bArr.push(part);
				}
			} else if(part != '.') {
				bArr.push(part);
			}
		}
		url = bArr.join('/');
	}
	return url;
};

G.getAjaxLoadUrl = function(url) {
	var dataType;
	if(G.ORIGIN == G.CGI_ORIGIN) {
		dataType = 'json';
	} else {
		dataType = 'jsonp';
	}
	if(!(/^https?:/).test(url)) {
		url = G.CGI_ORIGIN + G.CGI_BASE + url;
	}
	return url.replace(/[^\/]+$/, function(m) {
		return m.replace(/^\w+/, function(m) {
			return m + '.' + dataType;
		});
	});
};

G.pageRequire = require.config({
	baseUrl: require.PAGE_BASE_URL
});

//init tooltip and preload
require(['jquery', 'spine', 'bootstrap', 'rfl'], function($, Spine, bt, rfl) {
	Spine.Ajax.on('start', function() {
		rfl.ajax.showLoading();
	}).on('end', function() {
		rfl.ajax.hideLoading();
	});
	$(document.body).tooltip({selector: '[data-toggle="tooltip"]'});
	//Drag back and forward
	(function() {
		var downInfo = {
			time: 0,
			x: 0,
			y: 0
		};
		$(document).on('mousedown', function(evt) {
			if(evt.button === 1) {
				downInfo = {
					time: new Date(),
					x: evt.clientX,
					y: evt.clientY
				};
			}
		}).on('mouseup', function(evt) {
			var offsetX, offsetY;
			if(evt.button === 1 && new Date() - downInfo.time < 500) {
				offsetX = Math.abs(evt.clientX - downInfo.x);
				offsetY = Math.abs(evt.clientY - downInfo.y);
				if(offsetX > 300 && offsetX / offsetY >= 2) {
					if(evt.clientX - downInfo.x > 0) {
						history.back();
					} else {
						history.forward();
					}
				}
			}
		});
	})();
});