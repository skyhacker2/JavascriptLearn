define(function(require) {
	var $ = require('jquery');
	var config = require('./config');
	var alerts = require('./alerts');
	var history = require('./history');
	var json = require('./json');
	var util = require('./util');
	var events = require('./events');
	var langResourceCommon = require('lang/{{G.LANG}}/common');

	var _PROXY_PATH = ('{{CGI_BASE}}static/js/lib/rfl/ajax-proxy.html').replace('{{CGI_BASE}}', G.CGI_BASE);
	
	var _postQueue = {};
	var _proxyQueue = [];
	var _proxyFrame = null;
	
	var ajax = {};
	
	/**
	 * cross domain proxy
	 * @param {Object} opt  
	 */
	function _proxyCall(opt) {
		var xhr;
		var complete = opt.complete;
		opt.complete = function() {
			opt.loading === false || ajax.hideLoading();
			complete && complete();
		};
		if(opt.getXhr) {
			try {
				xhr = new _proxyFrame.contentWindow.XMLHttpRequest()
			} catch(e) {
				xhr = new _proxyFrame.contentWindow.ActiveXObject('MSXML2.XMLHTTP')
			}
			opt.getXhr(xhr);
		} else {
			opt.loading === false || ajax.showLoading();
			_proxyFrame.contentWindow.require(['rfl'], function(rfl) {
				if(opt.type == 'GET') {
					rfl.ajax.get(opt);
				} else {
					rfl.ajax.post(opt);
				}
			}, function() {
				opt.loading === false || ajax.hideLoading();
			});
		}
	};
	
	/**
	 * cross domain proxy
	 * @param {Object} opt  
	 */
	function _proxy(opt) {
		if(!_proxyFrame) {
			opt.urlObj = opt.urlObj || util.url2obj(opt.url);
			_proxyFrame = document.createElement('iframe');
			_proxyFrame.style.display = 'none';
			_proxyFrame.src = opt.urlObj.origin + _PROXY_PATH;
			$(_proxyFrame).on('load', function onload(evt) {
				if(_proxyFrame._loaded) {
					while(_proxyQueue.length) {
						_proxyCall(_proxyQueue.shift());
					}
				} else {
					$(_proxyFrame).off('load', onload).remove();
					_proxyFrame = null;
					while(_proxyQueue.length) {
						opt = _proxyQueue.shift();
						opt.error && opt.error();
						opt.complete && opt.complete();
					}
				}
			});
			_proxyFrame = document.body.appendChild(_proxyFrame);
		}
		if(_proxyFrame._loaded) {
			_proxyCall(opt);
		} else {
			_proxyQueue.push(opt);
		}
	};
	
	/**
	 * returns the full url according to backend service name and data type
	 * @private
	 * @param {String} url 
	 * @param {String} dataType 
	 * @returns {String} the full url
	 */
	ajax.getDataTypeUrl = function(url, dataType) {
		if(!(/^https?:/).test(url)) {
			url = G.CGI_ORIGIN + G.CGI_BASE + url;
		}
		return url.replace(/[^\/]+$/, function(m) {
			return m.replace(/^[\w\-\.]+/, function(m) {
				return m.split('.')[0] + '.' + dataType;
			});
		});
	};
	
	/**
	 * show the loading icon
	 */
	ajax.showLoading = function() {
		if(!document.getElementById('ajax-loading')) {
			$('<div id="ajax-loading" class="ajax-loading"></div>').appendTo(document.body);
		}
		$('#ajax-loading').show();
	};
	
	/**
	 * hide the loading icon
	 */
	ajax.hideLoading = function() {
		$('#ajax-loading').hide();
	};
	
	/**
	 * take action to some common code
	 * @param {Number} code 
	 * @returns {Boolean} whether common code has been dealt
	 */
	ajax.dealCommonCode = function(code) {
		var res = true;
		if(code === config.RES_CODE.NEED_LOGIN && !(/\/login\/login\-/).test(location.pathname)) {
			require('./login').gotoLoginPage();
		} else {
			res = false;
		}
		return res;
	};
	
	/**
	 * ajax get wrapper for jquery ajax
	 * @param {Object} opt  
	 */
	ajax.get = function(opt) {
		var jqXHR, success;
		opt = opt || {};
		opt.type = opt._method = 'GET';
		opt.headers = opt.headers || {};
		opt.headers['X-Requested-With'] = 'XMLHttpRequest';
		success = opt.success;
		opt.success = function(res, textStatus, jqXHR) {
			if(!ajax.dealCommonCode(res.code) && success) {
				success(res, textStatus, jqXHR);
			}
		}
		opt.url = ajax.getDataTypeUrl(opt.url, 'json');
		opt.urlObj = util.url2obj(opt.url);
		if(G.ORIGIN != opt.urlObj.origin && opt.dataType == 'json') {
			_proxy(opt);
			return;
		} else {
			opt.dataType = opt.dataType || (G.ORIGIN == opt.urlObj.origin ? 'json' : 'jsonp');
			if(opt.dataType == 'jsonp') {
				opt.url = ajax.getDataTypeUrl(opt.url, 'jsonp');
				opt.urlObj = util.url2obj(opt.url);
				opt.scriptCharset = opt.scriptCharset || opt.charset || 'UTF-8';
				if(!opt.jsonpCallback) {
					opt.url.split('/').pop().replace(/^[a-zA-Z_]\w*/, function(m) {
						opt.jsonpCallback = m;
					});
					opt.jsonpCallback = opt.jsonpCallback || 'jsonpCallback';
				}
				opt.jsonp = opt.jsonp || 'callback';
			}
		}
		jqXHR = $.ajax(opt);
		opt.loading === false || ajax.showLoading();
		jqXHR.always(function() {
			opt.loading === false || ajax.hideLoading();
		});
	};
	
	/**
	 * ajax post wrapper for jquery ajax
	 * @param {Object} opt  
	 */
	ajax.post = function(opt) {
		var jqXHR, success, data;
		opt = opt || {};
		opt.type = opt._method = opt._method || 'POST';
		opt.dataType = 'json';
		opt.url = ajax.getDataTypeUrl(opt.url, opt.dataType);
		opt.urlObj = util.url2obj(opt.url);
		if(G.ORIGIN != opt.urlObj.origin) {
			_proxy(opt);
			return;
		}
		data = opt.data || {};
		opt.charset = opt.charset || 'UTF-8';
		opt.headers = opt.headers || {};
		opt.headers['X-Requested-With'] = 'XMLHttpRequest';
		if(!opt.notJsonParamData) {
			opt.contentType = 'application/json; charset=' + opt.charset;
			opt.data = typeof data == 'string' ? data : json.stringify(data);
		}
		success = opt.success;
		opt.success = function(res, textStatus, jqXHR) {
			if(!ajax.dealCommonCode(res.code) && success) {
				success(res, textStatus, jqXHR);
			}
		}
		if(opt.queueName) {
			if(_postQueue[opt.queueName]) {
				return;
			}
			_postQueue[opt.queueName] = true;
		}
		//for prototype
		if(G.IS_PROTOTYPE) {
			opt.type = 'POST';
			opt.url = util.appendQueryString(opt.url, {_method: (opt._method || 'POST').toLowerCase()});
		}
		jqXHR = $.ajax(opt);
		opt.loading === false || ajax.showLoading();
		jqXHR.always(function() {
			if(opt.queueName) {
				_postQueue[opt.queueName] = false;
			};
			opt.loading === false || ajax.hideLoading();
		});
	};
	
	/**
	 * ajax put wrapper for jquery ajax
	 * @param {Object} opt  
	 */
	ajax.put = function(opt) {
		opt = opt || {};
		opt._method = 'PUT';
		ajax.post(opt);
	};
	
	/**
	 * ajax delete wrapper for jquery ajax
	 * @param {Object} opt  
	 */
	ajax.del = function(opt) {
		opt = opt || {};
		opt._method = 'DELETE';
		ajax.post(opt);
	};
	
	/**
	 * get FileUploader options
	 * @param {String} url  
	 * @param {String} dataType  
	 */
	ajax.getUploadOpt = function(url, dataType, callback) {
		url = ajax.getDataTypeUrl(url, dataType);
		if(G.ORIGIN == G.CGI_ORIGIN) {
			callback({
				url: url
			});
		} else {
			callback({
				url: url,
				data: {domain: G.DOMAIN || ''},
				xhrGetter: function(getXhr) {
					_proxy({
						url: url,
						getXhr: getXhr,
						error: function() {
							alerts.show(langResourceCommon.msg.serverBusy, 'error');
						}
					});
				}
			});
		}
	};
	
	/**
	 * ajax history support
	 * @namespace
	 */
	ajax.history = (function() {
		var _markRegExp = /^#!\/?/;
		var _handlers = {};
		var _fallbackHandler;

		function _getDefaultHandlers(count, callback) {
			var res = {};
			var i, key, tmp;
			count = parseInt(count);
			if(!(count > 0)) {
				return res;
			}
			for(i = 1; i <= count; i++) {
				tmp = [];
				for(j = 0; j < i; j++) {
					tmp.push('([^/]*)');
				}
				key = '^' + tmp.join('/') + (i == count ? '' : '$');
				res[key] = callback;
			}
			return res;
		};
		
		function setHandler(key, handler) {
			_handlers[key] = handler;
		};
		
		function setMark(mark, title) {
			mark && history.setMark(mark, title);
		};
		
		function getMark() {
			return history.getMark();
		};
		
		function dispatch(mark) {
			var m, h;
			if(typeof mark == 'function') {
				h = mark;
				mark = getMark();
			}
			$.each(_handlers, function(key, handler) {
				m = mark.match(new RegExp(key));
				if(m) {
					m[0] = mark;
					h = h || handler;
					return false;
				}
				return true;
			});
			m = m || [mark];
			h = h || _fallbackHandler;
			if(h && h.apply(null, m) !== false) {
				setMark(mark);
			}
		};

		function _init(handlers, fallbackHandler) {
			if(typeof handlers == 'function') {
				_fallbackHandler = handlers;
			} else if(typeof handlers == 'number' & handlers > 0 && typeof fallbackHandler == 'function') {
				_handlers = _getDefaultHandlers(handlers, fallbackHandler);
				_fallbackHandler = fallbackHandler;
			} else if(typeof handlers == 'object' && handlers) {
				_handlers = handlers;
				if(typeof fallbackHandler == 'function') {
					_fallbackHandler = fallbackHandler;
				}
			}
			history.setListener(function(mark) {
				var res = ajax.history._dispatchEvent('change', {
					fromMark: history.getPrevMark() || '',
					toMark: mark
				});
				res === false || dispatch(mark);
			});
			history.init();
			_init = function() {};
		};
		
		function init(handlers, fallbackHandler) {
			_init(handlers, fallbackHandler);
		};
		
		var ajaxHistory = $.extend({
			setHandler: setHandler,
			setMark: setMark,
			getMark: getMark,
			dispatch: dispatch,
			init: init
		}, events);

		ajaxHistory._addObservers(['change']);

		return ajaxHistory;
	})();
	
	return ajax;
});
