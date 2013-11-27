define(function(){
	var $ = require('jquery');
	var rfl = require('rfl');
	var _callbacks = {};

	function _error() {
		rfl.alerts.show('You could not use this shortcuts here!', 'error');
	}

	function init() {
		$(document).on('keydown', function(evt){
			if(evt.ctrlKey && evt.which === 83){
				var callback = _callbacks[rfl.history.getMark().split("/")[2]];
				callback ? callback(evt) : _error();
				evt.preventDefault();
				return false;
			}
		});
	}

	function bind(callback) {
		_callbacks[rfl.history.getMark().split("/")[2]] = callback;
	}

	return {
		init: init,
		bind: bind
	}
});