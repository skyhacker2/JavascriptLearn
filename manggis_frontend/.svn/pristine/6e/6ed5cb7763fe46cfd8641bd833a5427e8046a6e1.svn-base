define(function(require) {
	var $ = require('jquery');
	var util = require('./util');
		
	var InstanceManager = function() {
		this._init();
	};
	
	InstanceManager.prototype = {
		_init: function() {
			this._pool = [];
		},
		
		add: function(inst) {
			var id = util.getUniqueId();
			this._pool.push({id: id, inst: inst});
			return id;
		},
		
		get: function(id) {
			var res;
			$.each(this._pool, function(i, item) {
				if(item.id == id) {
					res = item.inst;
					return false;
				}
				return true;
			});
			return res;
		},
		
		remove: function(id) {
			var i, item;
			for(var i = this._pool.length - 1; i >= 0; i--) {
				item = this._pool[i];
				if(item.id == id) {
					this._pool.splice(i, 1);
					return item.inst;
				}
			}
		},
		
		count: function() {
			return this._pool.length;
		},
		
		each: function(cb, bind) {
			$.each(this._pool, function(i, item) {
				if(item) {
					return cb.call(bind, item.inst, item.id);
				}
				return true;
			});
		},
		
		clear: function() {
			this._init();
		},
		
		constructor: InstanceManager
	}
	
	return InstanceManager;
});
