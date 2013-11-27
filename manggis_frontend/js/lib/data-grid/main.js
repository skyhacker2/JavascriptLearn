define(function(require) {
	var $ = require('jquery') || jQuery;
	var mainTpl = require('./main.tpl.html');
	
	var DataGrid = function(holder, columns, opt) {
		var self = this;
		opt = opt || {};
		this._opt = opt;
		this._name = opt.name || 'x';
		this._width = opt.width;
		this._height = opt.height;
		this._holder = $(holder);
		this._container = $('<div></div>').appendTo(holder);
		this._allColumns = [];
		this._defaultLockedColumns = [];
		this._lockedColumns = [];
		this._scrollColumns = [];
		this._data = [];
		this._lockedBody = null;
		this._scrollHeader = null;
		this._scrollBody = null;
		this._toRefResize = null;
		this._sortColumnId = opt.sortColumnId || '';
		this._sortOrder = opt.sortOrder || '';
		this._bind = {
			scroll: function(evt) {return self._onScroll(evt);},
			resize: function(evt) {return self._onResize(evt);}
		};
		this.setColumns(columns);
		this._bindEvent();
	};
	
	$.extend(DataGrid.prototype, {
		_MAX_LOCKED_COLUMNS: 3,
		_MIN_COLUMN_WIDTH: 34,
		_MAX_COLUMN_WIDTH: 999,
		_MAX_LOCKED_COLUMN_WIDTH: 300,
		_DEFAULT_COLUMN_WIDTH: 200,
		_MIN_HEIGHT: 100,

		_onScroll: function(evt) {
			var target = evt.target;
			if(this._lockedBody) {
				this._lockedBody.scrollTop = target.scrollTop;
			}
			if(this._scrollHeader) {
				this._scrollHeader.scrollLeft = target.scrollLeft;
			}
		},

		_onResize: function(evt) {
			var self = this;
			clearTimeout(this._toRefResize);
			this._toRefResize = setTimeout(function() {
				self.resize();
			}, 200);
		},

		_clientSort: function(columnId, sortOrder) {
			var dataProperty = this._opt.dataProperty;
			this._data.sort(function(a, b) {
				if(dataProperty) {
					a = a[dataProperty];
					b = b[dataProperty];
				}
				if(sortOrder == 'asc') {
					return a[columnId] > b[columnId] ? 1 : -1;
				} else {
					return b[columnId] > a[columnId] ? 1 : -1;
				}
			});
			this._sortOrder = sortOrder;
			this._sortColumnId = columnId;
			this.render();
		},

		_bindEvent: function() {
			var self = this;
			this._container.delegate('a.data-grid-sortable', 'click', function(evt) {
				var columnId = $(this).data('column-id');
				var sortOrder = $('.data-grid-sort-arrow-down', this).length ? 'asc' : 'desc';
				if(self._opt.onSort) {
					self._opt.onSort(columnId, sortOrder, function(data) {
						if(data) {
							self._sortOrder = sortOrder;
							self._sortColumnId = columnId;
							self.render(data);
						}
					});
				} else {
					self._clientSort(columnId, sortOrder);
				}
			}).delegate('[data-grid-row]', 'mouseenter', function(evt) {
				$('[data-grid-row]', self._container).removeClass('data-grid-row-hl');
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).addClass('data-grid-row-hl');
			}).delegate('[data-grid-row]', 'mouseleave', function(evt) {
				$('[data-grid-row="' + $(this).data('grid-row') + '"]', self._container).removeClass('data-grid-row-hl');
			}).delegate('.data-grid-check-box, .data-grid-check-box-all', 'click', function(evt) {
				var rowIndex = $(this).data('row-index');
				var allChecked = true;
				if(!(rowIndex >= 0)) {//all
					if(this.checked) {
						$('.data-grid-check-box', self._container).each(function(i, item) {
							item.checked = true;
							$(item).closest('.mockup-checkbox').addClass('on');
						});
					} else {
						$('.data-grid-check-box', self._container).each(function(i, item) {
							item.checked = false;
							$(item).closest('.mockup-checkbox').removeClass('on');
						});
					}
				} else {
					if(this.checked) {
						$('.data-grid-check-box[data-row-index]', self._container).each(function(i, item) {
							if(!item.checked) {
								allChecked = false;
								return false;
							}
						});
						if(allChecked) {
							$('.data-grid-check-box-all', self._container)[0].checked = true;
							$('.data-grid-check-box-all', self._container).closest('.mockup-checkbox').addClass('on');
						}
					} else {
						$('.data-grid-check-box-all', self._container)[0].checked = false;
						$('.data-grid-check-box-all', self._container).closest('.mockup-checkbox').removeClass('on');
					}
				}
				if(self._opt.onSelect) {
					self._opt.onSelect(rowIndex, this.checked, rowIndex >= 0 && self._data[rowIndex] || undefined);
				}
			});
			if(this._width == 'auto') {
				$(window).on('resize', this._bind.resize);
			}
		},

		_unbindEvent: function() {
			this._container.undelegate();
			if(this._width == 'auto') {
				$(window).off('resize', this._bind.resize);
			}
		},

		setColumns: function(columns) {
			var self = this;
			var checkbox = this._opt.checkbox;
			var sequence = this._opt.sequence;
			var lockedCount = 0;
			this._allColumns = columns || [];
			this._defaultLockedColumns = [];
			this._lockedColumns = [];
			this._scrollColumns = [];
			if(checkbox) {
				this._defaultLockedColumns.unshift({
					type: 'checkbox',
					width: checkbox.width || this._MIN_COLUMN_WIDTH,
					textAlign: 'center',
					locked: true
				});
			}
			if(sequence) {
				this._defaultLockedColumns.unshift({
					name: sequence.name || '',
					type: 'sequence',
					width: sequence.width || this._MIN_COLUMN_WIDTH,
					textAlign: 'center',
					locked: true
				});
			}
			$.each(this._allColumns, function(i, column) {
				column.width = parseInt(column.width) || 0;
				if(column.width > 0) {
					column.width = Math.min(Math.max(column.width, self._MIN_COLUMN_WIDTH), self._MAX_COLUMN_WIDTH);
				}
				if(column.locked && lockedCount < self._MAX_LOCKED_COLUMNS) {
					column.width = column.width || self._DEFAULT_COLUMN_WIDTH;
					column.width = Math.min(column.width, self._MAX_LOCKED_COLUMN_WIDTH);
					self._lockedColumns.push(column);
					lockedCount++;
				} else {
					column.locked = false;
					self._scrollColumns.push(column);
				}
			});
		},

		getAllColumns: function() {
			return this._lockedColumns.concat(this._scrollColumns);
		},

		getLockedColumns: function() {
			return this._lockedColumns.concat();
		},

		getScrollColumns: function() {
			return this._scrollColumns.concat();
		},

		getSelectedData: function(dataProperty, columnId) {
			var self = this;
			var res = [];
			$('.data-grid-check-box', this._container).each(function(i, item) {
				var index = $(this).data('row-index');
				if(item.checked) {
					if(dataProperty) {
						res.push(columnId ? self._data[index][dataProperty][columnId] : self._data[index][dataProperty]);
					} else {
						res.push(columnId ? self._data[index][columnId] : self._data[index]);
					}
				}
			});
			return res;
		},

		getDataByRowIndex: function(rowIndex, dataProperty, columnId) {
			var res = this._data[rowIndex];
			if(!res) {
				return null;
			}
			if(dataProperty) {
				res = columnId ? res[dataProperty][columnId] : res[dataProperty];
			} else {
				res = columnId ? res[columnId] : res;
			}
			return res;
		},

		hightLightRow: function(index, className) {
			$('[data-grid-row="' + index + '"]', this._container).addClass(className || 'data-grid-row-error');
		},

		dehightLightRows: function(className) {
			$('[data-grid-row]', this._container).removeClass(className || 'data-grid-row-error');
		},

		resize: function(width, height) {
			if(width == 'auto' && this._width != 'auto') {
				$(window).on('resize', this._bind.resize);
			} else if(width && width != 'auto' && this._width == 'auto') {
				$(window).off('resize', this._bind.resize);
			}
			this._width = width || this._width;
			this._height = height || this._height;
			this.render();
		},

		render: function(data) {
			this._data = data || this._data;
			if(!this._data.length) {
				return;
			}
			if(this._opt.onBeforeRender) {
				this._opt.onBeforeRender();
			}
			if(this._scrollBody) {
				this._scrollBody.off('scroll', this._bind.scroll);
			}
			this._lockedBody = null;
			this._scrollHeader = null;
			this._scrollBody = null;
			this._container.html(mainTpl.render({
				MIN_HEIGHT: this._MIN_HEIGHT,
				DEFAULT_COLUMN_WIDTH: this._DEFAULT_COLUMN_WIDTH,
				name: this._name,
				width: this._width == 'auto' ? this._holder.width() : this._width,
				height: this._height,
				lockedColumns: this._defaultLockedColumns.concat(this._lockedColumns),
				scrollColumns: this._scrollColumns,
				bordered: this._opt.bordered,
				striped: this._opt.striped,
				sortColumnId: this._sortColumnId,
				sortOrder: this._sortOrder,
				checkbox: this._opt.checkbox,
				data: this._data,
				dataProperty: this._opt.dataProperty
			}));
			this._lockedBody = $('.data-grid-locked-columns .data-grid-body', this._container)[0];
			this._scrollHeader = $('.data-grid-columns .data-grid-header', this._container)[0];
			this._scrollBody = $('.data-grid-columns .data-grid-body', this._container);
			this._scrollBody.on('scroll', this._bind.scroll);
		},

		destroy: function() {
			if(this._scrollBody) {
				this._scrollBody.off('scroll', this._bind.scroll);
			}
			this._unbindEvent();
			this._container.remove();
			this._container = null;
			this._lockedBody = null;
			this._scrollHeader = null;
			this._scrollBody = null;
		}
	});
	
	return DataGrid;
});
