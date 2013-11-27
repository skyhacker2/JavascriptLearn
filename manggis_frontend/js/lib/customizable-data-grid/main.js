define(function(require) {
	var $ = require('jquery') || jQuery;
	var DataGrid = require('../data-grid/main');
	var mainTpl = require('./main.tpl.html');
	
	var CustomizableDataGrid = function(holder, columns, opt) {
		var self = this;
		opt = opt || {};
		opt.sequence = opt.sequence || true;
		this._settingTempHeight = opt.height;
		this._settingTempColumnData = {};
		this._settingTempColumnOrders = [];
		this._settingContainer = $('<div class="data-grid-setting-wrapper" style="display: none;"></div>').appendTo(holder);
		this._settingBtn = $('<a class="data-grid-setting-btn-show" href="javascript:void(0);" onclick="return false;"><i class="icon-cog"></i></a>').appendTo(holder);
		this._settingBind = {
			settingBtnClick: function(evt) {return self._showSettingPanel(evt);}
		}
		DataGrid.call(this, holder, columns, opt);
		$(holder).css('position') == 'static' && $(holder).css('position', 'relative');
	};
	
	$.extend(CustomizableDataGrid.prototype, DataGrid.prototype, {
		_langResourceSetting: {
			label: {
				lockedColumns: 'Locked Columns',
				unlockedColumns: 'Unlocked Columns',
				width: 'Width',
				height: 'Height',
				applySetting: 'Apply this setting',
				cancel: 'Cancel'
			},
			msg: {
				noLockedColumns: 'No locked columns',
				noUnlockedColumns: 'No unlocked columns'
			}
		},
		
		_renderSettingPanel: function() {
			this._settingContainer.html(mainTpl.render({
				MAX_LOCKED_COLUMNS: this._MAX_LOCKED_COLUMNS,
				langResource: this._opt.langResource || this._langResourceSetting,
				tempHeight: this._settingTempHeight,
				settingTempColumnData: this._settingTempColumnData, 
				columns: this._settingTempColumnOrders
			}));
		},

		_showSettingPanel: function(evt) {
			this._settingTempColumnOrders = this.getAllColumns();
			this._settingBtn.hide();
			this._renderSettingPanel();
			this._settingContainer.fadeIn();
			if(this._opt.onSettingShow) {
				this._opt.onSettingShow();
			}
		},

		_hideSettingPanel: function(evt) {
			this._settingTempColumnData = {};
			this._settingTempColumnOrders = [];
			this._settingContainer.slideUp();
			this._settingBtn.show();
			if(this._opt.onSettingHide) {
				this._opt.onSettingHide();
			}
		},

		_getColumnProperty: function(column, propName) {
			var tempData;
			if(typeof column == 'number') {
				column = this._settingTempColumnOrders[column];
			}
			tempData = this._settingTempColumnData[column.id] || {};
			if(typeof tempData[propName] != 'undefined') {
				return tempData[propName];
			} else {
				return column[propName];
			}
		},

		_sortSettingTempColumnOrders: function() {
			var self = this;
			var lockedColumns = [];
			var scrollColumns = [];
			$.each(this._settingTempColumnOrders, function(i, column) {
				if(self._getColumnProperty(column, 'locked')) {
					lockedColumns.push(column);
				} else {
					scrollColumns.push(column);
				}
			});
			this._settingTempColumnOrders = lockedColumns.concat(scrollColumns);
		},

		_bindEvent: function() {
			var self = this;
			DataGrid.prototype._bindEvent.call(this);
			this._settingBtn.on('click', this._settingBind.settingBtnClick);
			this._settingContainer.delegate('.data-grid-setting-btn-cancel', 'click', function(evt) {
				self._hideSettingPanel();
			}).delegate('.data-grid-setting-btn-apply', 'click', function(evt) {
				$.each(self._settingTempColumnOrders, function(i, column) {
					var tempData = self._settingTempColumnData[column.id] || {};
					if(typeof tempData.locked != 'undefined') {
						column.locked = tempData.locked;
					}
					if(typeof tempData.hidden != 'undefined') {
						column.hidden = tempData.hidden;
					}
					if(typeof tempData.width != 'undefined') {
						column.width = tempData.width;
					}
				});
				self._height = self._settingTempHeight;
				self.setColumns(self._settingTempColumnOrders);
				self.render();
				self._hideSettingPanel();
				if(self._opt.onSettingApply) {
					self._opt.onSettingApply({height: self._height, columns: self.getAllColumns()});
				}
			}).delegate('[data-setting-show]', 'click', function(evt) {
				var i = $(this).data('setting-show');
				var column = self._settingTempColumnOrders[i];
				var tempData = self._settingTempColumnData[column.id] = self._settingTempColumnData[column.id] || {};
				tempData.hidden = false;
				self._renderSettingPanel();
			}).delegate('[data-setting-hide]', 'click', function(evt) {
				var i = $(this).data('setting-hide');
				var column = self._settingTempColumnOrders[i];
				var tempData = self._settingTempColumnData[column.id] = self._settingTempColumnData[column.id] || {};
				tempData.hidden = true;
				self._renderSettingPanel();
			}).delegate('[data-setting-lock]', 'click', function(evt) {
				var i = $(this).data('setting-lock');
				var column = self._settingTempColumnOrders[i];
				var tempData = self._settingTempColumnData[column.id] = self._settingTempColumnData[column.id] || {};
				tempData.locked = true;
				self._sortSettingTempColumnOrders();
				self._renderSettingPanel();
			}).delegate('[data-setting-unlock]', 'click', function(evt) {
				var i = $(this).data('setting-unlock');
				var column = self._settingTempColumnOrders[i];
				var tempData = self._settingTempColumnData[column.id] = self._settingTempColumnData[column.id] || {};
				tempData.locked = false;
				self._sortSettingTempColumnOrders();
				self._renderSettingPanel();
			}).delegate('[data-setting-up]', 'click', function(evt) {
				var i = $(this).data('setting-up');
				var column, exchangedColumn;
				if(i === 0) {
					return;
				}
				column = self._settingTempColumnOrders[i];
				exchangedColumn = self._settingTempColumnOrders[i - 1];
				if(!!self._getColumnProperty(column, 'locked') == !!self._getColumnProperty(exchangedColumn, 'locked')) {
					self._settingTempColumnOrders[i] = exchangedColumn;
					self._settingTempColumnOrders[i - 1] = column;
					self._renderSettingPanel();
				}
			}).delegate('[data-setting-down]', 'click', function(evt) {
				var i = $(this).data('setting-down');
				var column, exchangedColumn;
				if(i >= self._settingTempColumnOrders.length - 1) {
					return;
				}
				column = self._settingTempColumnOrders[i];
				exchangedColumn = self._settingTempColumnOrders[i + 1];
				if(!!self._getColumnProperty(column, 'locked') == !!self._getColumnProperty(exchangedColumn, 'locked')) {
					self._settingTempColumnOrders[i] = exchangedColumn;
					self._settingTempColumnOrders[i + 1] = column;
					self._renderSettingPanel();
				}
			}).delegate('[data-setting-width]', 'click', function(evt) {
				if($(this).hasClass('data-grid-setting-width-on')) {
					return;
				}
				var i = $(this).closest('[data-setting-row]').data('setting-row');
				var width = $(this).data('setting-width');
				var column = self._settingTempColumnOrders[i];
				var tempData = self._settingTempColumnData[column.id] = self._settingTempColumnData[column.id] || {};
				tempData.width = width;
				self._renderSettingPanel();
			}).delegate('.data-setting-width-input', 'blur', function(evt) {
				var i = $(this).closest('[data-setting-row]').data('setting-row');
				var width = parseInt(this.value);
				var column = self._settingTempColumnOrders[i];
				var tempData = self._settingTempColumnData[column.id] = self._settingTempColumnData[column.id] || {};
				var locked = self._getColumnProperty(column, 'locked');
				var oldWidth = self._getColumnProperty(column, 'width');
				if(width != oldWidth) {
					if(!width) {
						width = oldWidth;
					} else if(width > self._MAX_COLUMN_WIDTH) {
						width = self._MAX_COLUMN_WIDTH;
					} else if(width < self._MIN_COLUMN_WIDTH) {
						width = self._MIN_COLUMN_WIDTH;
					}
					if(locked && width > self._MAX_LOCKED_COLUMN_WIDTH) {
						width = self._MAX_LOCKED_COLUMN_WIDTH;
					}
					tempData.width = width;
					self._renderSettingPanel();
				}
			}).delegate('[data-setting-height]', 'click', function(evt) {
				if($(this).hasClass('data-grid-setting-height-on')) {
					return;
				}
				var height = $(this).data('setting-height');
				self._settingTempHeight = height;
				self._renderSettingPanel();
			}).delegate('.data-setting-height-input', 'blur', function(evt) {
				var height = parseInt(this.value);
				if(!(height > self._MIN_HEIGHT)) {
					if(height > 0) {
						this.value = self._MIN_HEIGHT;
					} else if(self._settingTempHeight > 0) {
						this.value = self._settingTempHeight;
					} else {
						this.value = '';
					}
					return;
				}
				if(height != self._settingTempHeight) {
					self._settingTempHeight = height;
					self._renderSettingPanel();
				}
			});
		},

		_unbindEvent: function() {
			DataGrid.prototype._unbindEvent.call(this);
			this._settingBtn.off('click', this._settingBind.settingBtnClick);
			this._settingContainer.undelegate();
		},

		destroy: function() {
			DataGrid.prototype.destroy.call(this);
			this._settingContainer.remove();
			this._settingBtn.remove();
			this._settingContainer = null;
			this._settingContainer = null;
		}
	});
	
	return CustomizableDataGrid;
});
