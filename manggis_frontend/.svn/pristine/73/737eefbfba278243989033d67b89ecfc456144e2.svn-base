define(function(require) {
	var _INTERVAL = 100;
	
	var _ua = navigator.userAgent.toLowerCase();
	var _ieFrameSrc = require.toUrl('./history-blank.html', true);
	var _domain = document.domain;
	var _ieFrame = null;
	var _markCacheIndexHash = {};
	var _cache = [];
	var _cacheEnabled = true;
	var _cacheSize = 100;
	var _previousMark;
	var _currentMark;
	var _listener = null;
	var _listenerBind = null;
	var _isSupportHistoryState = false && !!history.pushState;
	var _isFrameNeeded = (/msie/).test(_ua) && !(/opera/).test(_ua) && (!document.documentMode || document.documentMode < 8);
	var _isSupportHashChange = !_isFrameNeeded && ('onhashchange' in window);
	
	function _updateCurrentMark(mark) {
		if(mark == _currentMark) {
			return;
		}
		_previousMark = _currentMark;
		_currentMark = mark;
		_isFrameNeeded && _setIeFrameSrc(mark);
	};
	
	function _checkMark() {
		if(!_isSupportHistoryState && !_isSupportHashChange) {
			setTimeout(arguments.callee, _INTERVAL);
		}
		var mark = getMark();
		if(mark == _currentMark || !_isValidMark(mark)) {
			return;
		}
		_updateCurrentMark(mark);
		_listener && _listener.call(_listenerBind, mark);
	};
	
	function _setCache(mark, data) {
		if(!_cacheEnabled) {
			return;
		}
		delete _cache[_markCacheIndexHash[mark]];
		_cache.push(data);
		_markCacheIndexHash[mark] = _cache.length - 1;
		delete _cache[_markCacheIndexHash[mark] - _cacheSize];
	};
	
	function _setIeFrameSrc(mark) {
		if(_ieFrame) {
			if(_ieFrame.contentWindow && _ieFrame.contentWindow.document) {
				var doc = _ieFrame.contentWindow.document;
				var markEl = doc.getElementById('mark');
				if(markEl && mark == markEl.value) {
					return;
				}
				doc.open();
				doc.write([
					'<html>',
						'<head><title>' + document.title + '</title></head>',
						'<body>',
							'<textarea id="mark">' + mark + '</textarea>',
							'<script type="text/javascript">',
								_domain ? 'document.domain = "' + _domain + '"' : '',
								'var mark = document.getElementById("mark").value',
								'if(mark || parent.location.hash) {',
									'parent.location.hash = "!" + mark',
								'}',
							'</s' + 'cript>',
						'</body>',
					'</html>'
				].join('\n'));
				doc.close();
			} else {
				setTimeout(function() {
					_setIeFrameSrc(mark);
				}, 100);
			}
		} else {
			var src = _domain ? _ieFrameSrc + '#' + mark : 'about:blank';
			_ieFrame = document.createElement('iframe');
			_ieFrame.src = src;
			_ieFrame.style.display = 'none';
			_ieFrame = document.body.appendChild(_ieFrame);
			_domain || _setIeFrameSrc(mark);
		}
	};
	
	function _isValidMark(mark) {
		return typeof mark == 'string' && !(/^[#!]/).test(mark);
	}
	
	//Public
	function init(opt) {
		opt = opt || {};
		_ieFrameSrc = opt.ieFrameSrc || _ieFrameSrc;
		_domain = opt.domain || _domain;
		_cacheEnabled = typeof opt.cacheEnabled != 'undefined' ? opt.cacheEnabled : _cacheEnabled;
		_cacheSize = opt.cacheSize || _cacheSize;
		if(_isSupportHistoryState) {
			$(window).on('popstate', _checkMark);
		} else if(_isSupportHashChange) {
			$(window).on('hashchange', _checkMark);
		}
		_checkMark();
		init = function() {};
	};
		
	function setListener(listener, bind) {
		_listener = typeof listener == 'function' ? listener : null;
		_listenerBind = bind || null;
	};
	
	function setCache(mark, data) {
		if(!_isValidMark(mark)) {
			return;
		}
		_setCache(mark, data);
	};
	
	function getCache(mark) {
		return _cache[_markCacheIndexHash[mark]];
	};
	
	function clearCache() {
		_markCacheIndexHash = {};
		_cache = [];
	};
	
	function setMark(mark, title, stateObj) {
		if(title) {
			document.title = title;
		}
		if(mark == _currentMark || !_isValidMark(mark)) {
			return;
		}
		_updateCurrentMark(mark);
		if(_isSupportHistoryState) {
			history.pushState(stateObj, title || document.title, '/' + mark);
		} else {
			location.hash = '!' + mark;
		}
	};
	
	function getMark() {
		if(_isSupportHistoryState) {
			return location.pathname.replace(/^\//, '');
		} else if((/^#!/).test(location.hash)) {
			return location.hash.replace(/^#!/, '');
		} else {
			return '';
		}
	};
	
	function getPrevMark() {
		return _previousMark;
	};
	
	function needFrame() {
		return _isFrameNeeded;
	};
	
	function isSupportHistoryState() {
		return _isSupportHistoryState;
	};
	
	return {
		init: init,
		setListener: setListener,
		setCache: setCache,
		getCache: getCache,
		clearCache: clearCache,
		setMark: setMark,
		getMark: getMark,
		getPrevMark: getPrevMark,
		needFrame: needFrame,
		isSupportHistoryState: isSupportHistoryState
	};
});
