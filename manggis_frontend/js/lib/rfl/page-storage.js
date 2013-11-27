define(function(require) {
	var $ = require('jquery');

	var _pathname = location.pathname;
	var _data = {};

	function set(key, val) {
		if(typeof val == 'undefined') {
			val = key;
			key = _pathname;
		}
		if(val && typeof val == 'object') {
			_data[key] = $.extend(_data[key] || {}, val);
		} else {
			_data[key] = val;
		}
	};

	function del(key) {
		_data[typeof key == 'undefined' ? _pathname : key] = undefined;
	};

	function get(key) {
		return _data[typeof key == 'undefined' ? _pathname : key];
	};

	return {
		set: set,
		get: get
	};
});