define(function(require) {
	var $ = require('jquery');
	var json = require('./json');
	var localStorage = require('./local-storage');
	var dialog = require('./dialog');
	var confirmTpl = require('./confirm.tpl.html');
	var langResourceCommon = require('lang/' + G.LANG + '/common');
	
	var _uniqueIdCount = 0;
	
	var util = {};
	
	function _getUrl(url, param) {
		if(!(/^https?:/).test(url)) {
			url = G.ORIGIN + G.BASE + 'html/' + url.replace(/((?:#|\?).*$|$)/, '-' + G.LANG + '.html$1');
		}
		return util.appendQueryString(url, param);
	};

	util.url2obj = function(str) {
		if(typeof str != 'string') {
			return str;
		}
		var m = str.match(/([^:]*:)?(?:\/\/)?([^\/:]+)?(:)?(\d+)?([^?#]+)(\?[^?#]*)?(#[^#]*)?/);
		m = m || [];
		uri = {
			href: str,
			protocol: m[1] || 'http:',
			host: (m[2] || '') + (m[3] || '') + (m[4] || ''),
			hostname: m[2] || '',
			port: m[4] || '',
			pathname: m[5] || '',
			search: m[6] || '',
			hash: m[7] || ''
		};
		uri.origin = uri.protocol + '//' + uri.host;
		return uri;
	};

	util.cloneObject = function(obj, deep, _level) {
		var res = obj;
		deep = deep || 0;
		_level = _level || 0;
		if(_level > deep) {
			return res;
		}
		if(typeof obj == 'object' && obj) {
			if($.isArray(obj)) {
				res = [];
				$.each(obj, function(i, item) {
					res.push(item);
				})
			} else {
				res = {};
				for(var p in obj) {
					if(Object.prototype.hasOwnProperty.call(obj, p)) {
						res[p] = deep ? util.cloneObject(obj[p], deep, ++_level) : obj[p];
					}
				}
			}
		}
		return res;
	};
	
	util.getUniqueId = function() {
		return 'RFL_UNIQUE_ID_' + _uniqueIdCount++;
	};
	
	util.getOrigin = function(loc) {
		loc = loc || window.location;
		return loc.origin || [
			loc.protocol, '//', loc.host
		].join('');
	};

	util.getByteLength = function(str) {
		return str.replace(/[^\x00-\xff]/g, 'xx').length;
	};
	
	util.headByByte = function(str, len, postFix) {
		str = new String(str).toString();
		if(util.getByteLength(str) <= len) {
			return str;
		}
		postFix = postFix || '';
		var l;
		if(postFix) {
			l = len = len - util.getByteLength(postFix);
		} else {
			l = len;
		}
		do {
			str = str.slice(0, l--);
		} while(util.getByteLength(str) > len);
		return str + postFix;
	};
	
	util.encodeHtml = function(str) {
		return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
	};
	
	util.decodeHtml = function(str) {
		return (str + '').replace(/&quot;/g, '\x22').replace(/&#0*39;/g, '\x27').replace(/&#0*96;/g, '\x60').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
	};
	
	util.getUrlParam = function(name, loc) {
		loc = loc || window.location;
		var r = new RegExp('(\\?|#|&)' + name + '=(.*?)(&|#|$)');
		var m = (loc.href || '').match(r);
		return (m ? decodeURIComponent(m[2]) : '');
	};
	
	util.getUrlParams = function(loc) {
		loc = loc || window.location;
		var raw = loc.search, res = {}, p, i;
		if(raw) {
			raw = raw.slice(1);
			raw = raw.split('&');
			for(i = 0, l = raw.length; i < l; i++) {
				p = raw[i].split('=');
				res[p[0]] = decodeURIComponent(p[1] || '');
			}
		}
		raw = loc.hash;
		if(raw) {
			raw = raw.slice(1);
			raw = raw.split('&');
			for(i = 0, l = raw.length; i < l; i++) {
				p = raw[i].split('=');
				res[p[0]] = res[p[0]] || decodeURIComponent(p[1] || '');
			}
		}
		return res;
	};
	
	util.appendQueryString = function(url, param, isHashMode) {
		if(typeof param == 'object') {
			param = $.param(param, true);
		} else if(typeof param == 'string') {
			param = param.replace(/^&/, '');
		} else {
			param = '';
		}
		if(!param) {
			return url;
		}
		if(isHashMode) {
			if(url.indexOf('#') == -1) {
				url += '#' + param;
			} else {
				url += '&' + param;
			}
		} else {
			if(url.indexOf('#') == -1) {
				if(url.indexOf('?') == -1) {
					url += '?' + param;
				} else {
					url += '&' + param;
				}
			} else {
				var tmp = url.split('#');
				if(tmp[0].indexOf('?') == -1) {
					url = tmp[0] + '?' + param + '#' + (tmp[1] || '');
				} else {
					url = tmp[0] + '&' + param + '#' + (tmp[1] || '');
				}
			}
		}
		return url;
	};
	
	util.gotoUrl = function(url, param) {
		location.href = _getUrl(url, param);
	};
	
	util.replaceUrl = function(url, param) {
		location.replace(_getUrl(url, param));
	};
	
	util.formatMsg = function(msg, data) {
		msg = msg + '';
		if(data) {
			$.each(data, function(key, val) {
				msg = msg.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), val);
			});
		}
		return msg;
	};

	util.toBase64 = function(str, callback) {
		if(!str) {
			callback('');
			return;
		}
		require(['base64'], function(base64) {
			if(typeof str != 'string') {
				str = json.stringify(str);
			}
			callback(base64.toBase64(str, true));
		});
	};

	util.fromBase64 = function(str, callback, parseJson) {
		if(!str) {
			callback(parseJson ? null : '');
			return;
		}
		require(['base64'], function(base64) {
			var res;
			try {
				res = base64.fromBase64(str);
			} catch(e) {
				callback(parseJson ? null : '');
				return;
			}
			if(parseJson) {
				try {
					res = json.parse(res);
				} catch(e) {
					res = null;
				}
			}
			callback(res);
		});
	};

	util.formatDecimal = function(decimal, format, opt) {
		opt = opt || {};
		var res = '';
		var decimalMatchRes, formatMatchRes, fLen, dLen;
		decimal += '';
		decimalMatchRes = decimal.match(/^(\-?)(\w*)(.?)(\w*)/);
		formatMatchRes = format.match(/^(\-?)(\w*)(.?)(\w*)/);
		if(formatMatchRes[2]) {
			res += decimalMatchRes[2];
		}
		if(formatMatchRes[3] && formatMatchRes[4]) {
			res += formatMatchRes[3];
		} else {
			if(opt.round) {
				res = Math.round(decimal) + '';
			} else if(opt.ceil) {
				res = Math.ceil(decimal) + '';
			}
			return res;
		}
		fLen = Math.min(formatMatchRes[4].length, 4);
		dLen = decimalMatchRes[4].length;
		res += decimalMatchRes[4].slice(0, fLen);
		if(fLen > dLen) {
			res += '0000'.slice(0, fLen - dLen);
		}
		if(dLen > fLen && (opt.round && decimalMatchRes[4].charAt(fLen) >= 5 || opt.ceil && decimalMatchRes[4].charAt(fLen) > 0)) {
			res = util.formatDecimal((res * Math.pow(10, fLen) + 1) / Math.pow(10, fLen), format);
		}
		if(decimalMatchRes[1] && res != '0') {
			res = decimalMatchRes[1] + res;
		}
		return res;
	};

	util.formatDateTime = function(date, format) {
		if(!date) {
			return '';
		}
		var res = format, tt = '';
		date = new Date(date);
		res = res.replace(/yyyy|yy/, function($0) {
			if($0.length === 4) {
				return date.getFullYear();
			} else {
				return (date.getFullYear() + '').slice(2, 4);
			}
		}).replace(/MM|M/, function($0) {
			if($0.length === 2 && date.getMonth() < 9) {
				return '0' + (date.getMonth() + 1);
			} else {
				return date.getMonth() + 1;
			}
		}).replace(/dd|d/, function($0) {
			if($0.length === 2 && date.getDate() < 10) {
				return '0' + date.getDate();
			} else {
				return date.getDate();
			}
		}).replace(/HH|H/, function($0) {
			if($0.length === 2 && date.getHours() < 10) {
				return '0' + date.getHours();
			} else {
				return date.getHours();
			}
		}).replace(/hh|h/, function($0) {
			var hours = date.getHours();
			if(hours > 11) {
				tt = 'PM';
			} else {
				tt ='AM';
			}
			hours = hours > 12 ? hours - 12 : hours;
			if($0.length === 2 && hours < 10) {
				return '0' + hours;
			} else {
				return hours;
			}
		}).replace(/mm/, function($0) {
			if(date.getMinutes() < 10) {
				return '0' + date.getMinutes();
			} else {
				return date.getMinutes();
			}
		}).replace(/ss/, function($0) {
			if(date.getSeconds() < 10) {
				return '0' + date.getSeconds();
			} else {
				return date.getSeconds();
			}
		}).replace('tt', tt);
		return res;
	};

	util.formatLeftTime = function(ms, hh, mm, ss) {
		var s = m = h = 0;
		s = parseInt(ms / 1000);
		s = s || 1;
		if(s >= 60) {
			m = parseInt(s / 60);
			s = s % 60;
		}
		if(m >= 60) {
			h = parseInt(m / 60);
			m = m % 60;
		}
		return [h ? h + (hh || 'h') : '', m ? m + (mm || 'm') : '', s ? s + (ss || 's') : ''].join('');
	};

	util.formatFileSize = function(bytes) {
		var k, m, g;
		if(bytes < 100) {
			return util.formatDecimal(bytes, '0.00' , {ceil: 1}) + 'B';
		}
		k = bytes / 1024;
		if(k < 1000) {
			return util.formatDecimal(k, '0.00', {ceil: 1}) + 'KB';
		}
		m = k / 1024;
		if(m < 1000) {
			return util.formatDecimal(m, '0.00', {ceil: 1}) + 'MB';
		}
		g = m / 1024;
		return util.formatDecimal(g, '0.00', {ceil: 1}) + 'GB';
	};

	util.getLocalStoredList = function(listName) {
		var res = localStorage.get(listName);
		if(res) {
			res = json.parse(res);
		}
		return res || [];
	};

	util.unshiftLocalStoredList = function(listName, item, opt) {
		if(!item) {
			return;
		}
		var i, l, tmp, size, comparer;
		var list = util.getLocalStoredList(listName);
		opt = opt || {};
		size = opt.size || 10;
		comparer = opt.comparer || function(a, b) {return a === b};
		if(list && list.length) {
			if(list.length && comparer(item, list[0])) {
				return;
			}
			tmp = [];
			for(i = 0, l = list.length; i < l; i++) {
				if(!comparer(item, list[i]) && tmp.length < size - 1) {
					tmp.push(list[i]);
				}
			}
			tmp.unshift(item);
			list = tmp;
		} else {
			list = [item];
		}
		localStorage.set(listName, json.stringify(list));
	};

	util.removeFromLocalStoredList = function(listName, item, opt) {
		if(!item) {
			return;
		}
		var i, l, comparer;
		var list = util.getLocalStoredList(listName);
		opt = opt || {};
		comparer = opt.comparer || function(a, b) {return a === b};
		if(list && list.length) {
			for(i = list.length - 1; i >= 0; i--) {
				if(comparer(item, list[i])) {
					list.splice(i, 1);
				}
			}
			localStorage.set(listName, json.stringify(list));
		}
	};

	util.getSvrTime = function() {
		return require('./auth').getData('now') || new Date().getTime();
	};

	util.typeConfirm = function(type, body, callback){
		var message = "This action CANNOT be undone. Type <strong>" + type + "</strong> to confirm:";

		var confirm = dialog.create({
			title: "Are you ABSOLUTELY sure?",
			content: confirmTpl.render({message: message, body: body}),
			btns: [
				{
					text: type,
					className: 'btn-primary',
					click: _update
				},
				{
					text: langResourceCommon.label.cancel,
					dismiss: true
				}
			]
		});
		confirm.on('keyup', '#confirm-input', function(evt){
			if(evt.which === 13){
				_update();
			}
		})

		function _update(){
			if($("#confirm-input", confirm).val() === type){
				callback();
				confirm.modal('hide');
			}else{
				$('.help-inline', confirm).html("<br>Sorry, please enter the text exactly as displayed to confirm.").show();
				$('.control-group', confirm).addClass('error');
			}
		}
	}
	
	return util;
});