define(function(require) {
	var Observer = require('./observer');
	
	var events = {};

	events._addObservers = function(observerNames) {
		var self = this;
		this.__observers = this.__observers || {};
		$.each(observerNames, function(i, name) {
			self.__observers[name] = new Observer();
		});
	};

	events._dispatchEvent = function(type, evt) {
		var observer = this.__observers && this.__observers[type];
		if(observer) {
			return observer.dispatch(evt);
		}
		return true
	};

	events.on = function(type, handler) {
		var observer = this.__observers && this.__observers[type];
		if(!observer) {
			return null;
		}
		return observer.subscribe(handler);
	};

	events.off = function(type, handler) {
		var observer = this.__observers && this.__observers[type];
		if(!observer) {
			return null;
		}
		return observer.remove(handler);
	};
	
	return events;
});
