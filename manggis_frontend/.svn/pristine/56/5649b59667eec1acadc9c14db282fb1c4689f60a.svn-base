define(function(require) {
	var $ = require('jquery');
	var array = require('./array');
	var util = require('./util');
	var InstanceManager = require('./instance-manager');
	
	var _im = new InstanceManager();
	
	/**
	 * @class
	 */
	function Delegator(ele, opt) {
		opt = opt || {};
		this._ele = $(ele);
		this._delegatedTypes = {};
		this._handlers = {};
		this._anonymousHandlers = {};
		this._eventHook = opt.eventHook;
		this._id = _im.add(this);
		this._ele.data('rfl-delegator-id', this._id);
	};
	
	Delegator._im = _im;
	
	Delegator.getDelegator = function(ele) {
		ele = $(ele);
		var delegator = _im.get(ele.data('rfl-delegator-id'));
		if(!delegator) {
			delegator = new Delegator(ele);
		}
		return delegator;
	};
	
	Delegator.getPageDelegator = function() {
		return Delegator.getDelegator(document.body);
	};
	
	Delegator.prototype = {
		_delegateEvent: function(type, maxBubble) {
			var that = this;
			var flag = this._delegatedTypes[type];
			if(flag) {
				flag.maxBubble = Math.max(flag.maxBubble, maxBubble);
				return;
			} else {
				var listener = function() {
					return that._eventListener.apply(that, array.getArray(arguments));
				};
				this._ele.on(type, listener);
				this._handlers[type] = {};
				this._anonymousHandlers[type] = [];
				this._delegatedTypes[type] = {maxBubble: maxBubble, listener: listener};
			}
		},
		
		_eventListener: function(evt) {
			var target, $target, type, flag, handler, maxBubble, bubbleTimes, cancelBubbleEl;
			var root = this._ele.get(0);
			target = evt.target;
			type = evt.type.toLowerCase();
			if(this._eventHook && this._eventHook(target, evt, type) === false) {
				return;
			}
			maxBubble = this._delegatedTypes[type].maxBubble;
			bubbleTimes = 0;
			while(target && target != root) {
				$target = $(target);
				if(new RegExp('(^|\\s+)' + type + '(\\s+|$)').test($target.data('rfl-cancel-bubble'))) {
					return;
				}
				if(target.disabled || $target.attr('disabled')) {
					break;
				}
				flag = $target.data('rfl-' + type);
				if(flag) {
					flag = flag.split(' ');
					handler = this._handlers[type][flag.shift()];
					flag.unshift(evt);
					if(handler && handler.apply(target, flag) === false) {
						break;
					}
				}
				if(bubbleTimes >= maxBubble) {
					break;
				}
				target = target.parentNode;
				bubbleTimes++;
			}
			if(this._anonymousHandlers[type]) {
				if($target) {
					cancelBubbleEl = $target.closest('[data-rfl-cancel-bubble]')[0];
					if(cancelBubbleEl && $.contains(root, cancelBubbleEl) && new RegExp('(^|\\s+)' + type + '(\\s+|$)').test($(cancelBubbleEl).data('rfl-cancel-bubble'))) {
						return;
					}
				}
				$.each(this._anonymousHandlers[type], function(i, handler) {
					handler.call(evt.target, evt);
				});
			}
		},
		
		getId: function() {
			return this._id;
		},
		
		delegate: function(type, handlerName, handler, opt) {
			var hasSameAnonymous = false;
			var maxBubble;
			if(typeof opt == 'number') {
				maxBubble = opt;
				opt = {};
			} else {
				opt = opt || {};
				maxBubble = opt.maxBubble || 0;
			}
			type = type.toLowerCase();
			this._delegateEvent(type, maxBubble);
			this._handlers[type][handlerName] = handler;
			return this;
		},
		
		delegateAnonymous: function(type, handler) {
			var hasSameAnonymous = false;
			type = type.toLowerCase();
			this._delegateEvent(type, 0);
			$.each(this._anonymousHandlers[type], function(h) {
				if(handler == h) {
					hasSameAnonymous = true;
					return false;
				}
			})
			if(!hasSameAnonymous) {
				this._anonymousHandlers[type].push(handler);
			}
			return this;
		},
		
		remove: function(type, handlerName) {
			if(!this._delegatedTypes[type]) {
				return this;
			}
			if(handlerName) {
				delete this._handlers[type][handlerName];
			} else {
				this._ele.off(type, this._delegatedTypes[type].listener);
				delete this._handlers[type];
				delete this._anonymousHandlers[type];
				delete this._delegatedTypes[type];
			}
			return this;
		},

		removeAnonymous: function(type, handler) {
			var that = this;
			if(!this._delegatedTypes[type]) {
				return this;
			}
			if(handler) {
				if(this._anonymousHandlers[type]) {
					$.each(this._anonymousHandlers[type], function(i, h) {
						if(h == handler) {
							that._anonymousHandlers[type].splice(i, 1);
							return false;
						}
					});
				}
			} else {
				delete this._anonymousHandlers[type];
			}
			return this;
		},
		
		destroy: function() {
			for(var type in this._delegatedTypes) {
				this.remove(type);
			}
			_im.remove(this.getId());
		},
		
		constructor: Delegator
	}
	
	return Delegator;
});
