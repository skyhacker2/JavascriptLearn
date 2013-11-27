define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var availableListTpl = require('./available-list.tpl.html');
	var selectedListTpl = require('./selected-list.tpl.html');
	
	var PairBox = function(availableBox, selectedBox, availableDataList, opt) {
		opt = opt || {};
		this._opt = opt;
		this._availableBox = $(availableBox);
		this._selectedBox = $(selectedBox);
		this._availableDataList = availableDataList || [];
		this._selectedDataList = opt.selectedDataList || [];
		this._availableListTpl = opt.availableListTpl || availableListTpl;
		this._selectedListTpl = opt.selectedListTpl || selectedListTpl;
		this._init();
	};

	$.extend(PairBox.prototype, {
		/**
		 * stdItem: {
		 *     id: 1,
		 *     name: 'name',
		 *     children: [//optional
		 *         {id: 11, name: 'child name'}
		 *     ]
		 * }
		 */
		_init: function() {
			var self = this;
			this._bindEvent();
			$.each(this._selectedDataList, function(i, item) {
				self._removeFromDataList(self._availableDataList, item);
			});
			this._render();
		},

		_bindEvent: function() {
			var self = this;
			rfl.Delegator.getDelegator(this._availableBox).delegate('click', 'add', function(evt, id) {
				self._add(id);
				self._render();
			}, 1).delegate('click', 'addChild', function(evt, id, childId) {
				self._add(id, childId);
				self._render();
			}, 1);
			rfl.Delegator.getDelegator(this._selectedBox).delegate('click', 'remove', function(evt, id) {
				self._remove(id);
				self._render();
			}, 1).delegate('click', 'removeChild', function(evt, id, childId) {
				self._remove(id, childId);
				self._render();
			}, 1);
			this._bindEvent = function() {};
		},

		_removeEvent: function() {
			rfl.Delegator.getDelegator(this._availableBox).destroy();
		},

		_render: function() {
			this._availableBox.html(this._availableListTpl.render($.extend(this._opt.availableListTplData, {list: this._availableDataList}), this._opt));
			this._selectedBox.html(this._selectedListTpl.render($.extend(this._opt.selectedListTplData, {list: this._selectedDataList}), this._opt));
		},

		_each: function(dataList, callback) {
			var getStdItem = this._opt.getStdItem;
			$.each(dataList, function(i, item) {
				var stdItem = getStdItem ? getStdItem(item) : item;
				return callback(i, item, stdItem);
			});
		},

		_cloneItem: function(item) {
			function F() {};
			F.prototype = item;
			return new F();
		},

		_getItemFromList: function(list, id, childId) {
			var self = this;
			var getStdChildItem = this._opt.getStdChildItem;
			var setChildren = this._opt.setChildren;
			var res;
			this._each(list, function(i, item, stdItem) {
				var children = [];
				if(stdItem.id == id) {
					res = self._cloneItem(item);
					if(childId && stdItem.children) {
						$.each(stdItem.children, function(i, item) {
							var stdChildItem = getStdChildItem ? getStdChildItem(item) : item;
							if(stdChildItem.id == childId) {
								children.push(item);
								return false;
							}
							return true;
						});
						if(setChildren) {
							setChildren(res, children);
						} else {
							res.children = children;
						}
					} else if(stdItem.children) {
						if(setChildren) {
							setChildren(res, stdItem.children.concat());
						} else {
							res.children = stdItem.children.concat();
						}
					}
					return false;
				}
				return true;
			});
			return res;
		},

		_add: function(id, childId) {
			var item = this._getItemFromList(this._availableDataList, id, childId);
			this._addToDataList(this._selectedDataList, item);
			this._removeFromDataList(this._availableDataList, item);
		},

		_remove: function(id, childId) {
			var item = this._getItemFromList(this._selectedDataList, id, childId);
			this._addToDataList(this._availableDataList, item);
			this._removeFromDataList(this._selectedDataList, item);
		},

		_addToDataList: function(list, addedItem) {
			if(!addedItem) {
				return;
			}
			var self = this;
			var getStdItem = this._opt.getStdItem;
			var setChildren = this._opt.setChildren;
			var stdAddedItem = getStdItem ? getStdItem(addedItem) : addedItem;
			var added = false;
			this._each(list, function(i, item, stdItem) {
				if(stdItem.id == stdAddedItem.id) {
					if(stdItem.children) {
						stdItem.children = stdItem.children.concat(stdAddedItem.children);
						if(setChildren) {
							setChildren(item, stdItem.children);
						}
					}
					added = true;
					return false;
				}
			});
			if(!added) {
				list.unshift(addedItem);
			}
			return addedItem;
		},

		_removeFromDataList: function(list, removedItem) {
			if(!removedItem) {
				return;
			}
			var self = this;
			var getStdItem = this._opt.getStdItem;
			var getStdChildItem = this._opt.getStdChildItem;
			var setChildren = this._opt.setChildren;
			var stdRemovedItem = getStdItem ? getStdItem(removedItem) : removedItem;
			this._each(list, function(i, item, stdItem) {
				if(stdItem.id == stdRemovedItem.id) {
					if(stdItem.children) {
						stdItem.children = rfl.array.difference(stdItem.children, stdRemovedItem.children, function(a, b) {
							a = getStdChildItem ? getStdChildItem(a) : a;
							b = getStdChildItem ? getStdChildItem(b) : b;
							return a.id != b.id;
						});
						if(setChildren) {
							setChildren(item, stdItem.children);
						}
						if(!stdItem.children.length) {
							list.splice(i, 1);
						}
					} else {
						list.splice(i, 1);
					}
					return false;
				}
			});
			return removedItem;
		},

		getSelectedDataList: function(getItem) {
			var res = [];
			if(typeof getItem == 'function') {
				this._each(this._selectedDataList, function(i, item, stdItem) {
					res.push(getItem(item, stdItem));
				});
			} else {
				res = this._selectedDataList.concat();
			}
			return res;
		},

		getSelectedItemById: function(id) {
			var res;
			var self = this;
			this._each(this._selectedDataList, function(i, item, stdItem) {
				if(item.id == id) {
					res = item;
					return false;
				}
				return true;
			});
			return res;
		},

		addAll: function() {
			var self = this;
			var getStdItem = this._opt.getStdItem;
			for(var i = this._availableDataList.length - 1; i >= 0; i--) {
				var item = this._availableDataList[i];
				var stdItem = getStdItem ? getStdItem(item) : item;
				self._add(stdItem.id);
			}
			this._render();
		},

		removeAll: function() {
			var self = this;
			var getStdItem = this._opt.getStdItem;
			for(var i = this._selectedDataList.length - 1; i >= 0; i--) {
				var item = this._selectedDataList[i];
				var stdItem = getStdItem ? getStdItem(item) : item;
				self._remove(stdItem.id);
			}
			this._render();
		},

		render: function() {
			this._render();
		},

		destroy: function() {
			this._removeEvent();
			this._availableBox = null;
			this._selectedBox = null;
		}
	});
	
	return PairBox;
});
