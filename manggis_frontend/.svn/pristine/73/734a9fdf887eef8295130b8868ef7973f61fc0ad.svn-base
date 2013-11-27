define(function(require) {
	var $ = require('jquery') || jQuery;

	var _nativeSupport = false && $('<input type="time" />')[0].type == 'time';
	
	var TimePicker = function(holder, opt) {
		var self = this;
		opt = opt || {};
		this._opt = opt;
		this._holder = $(holder);
		this._picker = null;
		this._init();
	};
	
	$.extend(TimePicker.prototype, {
		_init: function() {
			var initValue = this._opt.initValue;
			var h, m;
			if(initValue && typeof initValue == 'number') {
				initValue = new Date(initValue);
				h = initValue.getHours();
				m = initValue.getMinutes();
				h = h < 10 ? '0' + h : '' + h;
				m = m < 10 ? '0' + m : '' + m;
				initValue = h + ':' + m;
			}
			if(_nativeSupport) {
				this._picker = $('<input class="form-control" type="time" style="width: 96px;" />').appendTo(this._holder);
				if(initValue) {
					this._picker.val(initValue);
				}
			} else {
				this._picker = $([
					'<select class="form-control" data-type="H" style="width: 80px; display: inline-block;">',
						'<option value="">--</option>',
						(function() {
							var res = [];
							var i, num;
							for(i = 0; i < 24; i++) {
								num = (i < 10 ? '0' : '') + i;
								res.push('<option value="' + num + '">' + num + '</option>');
							}
							return res.join('');
						})(),
					'</select> : ',
					'<select class="form-control" data-type="M" style="width: 80px; display: inline-block;">',
						'<option value="">--</option>',
						(function() {
							var res = [];
							var i, num;
							for(i = 0; i < 60; i++) {
								num = (i < 10 ? '0' : '') + i;
								res.push('<option value="' + num + '">' + num + '</option>');
							}
							return res.join('');
						})(),
					'</select>'
				].join('')).appendTo(this._holder);
				if(initValue) {
					initValue = initValue.split(':');
					$('[data-type="H"]', this._picker.parent()).val(initValue[0]);
					$('[data-type="M"]', this._picker.parent()).val(initValue[1]);
				}
			}
			if(this._opt.id) {
				this._picker[0].id = this._opt.id;
			}
		},

		getValue: function() {
			var h, m;
			if(_nativeSupport) {
				return this._picker.val();
			} else {
				h = $('[data-type="H"]', this._picker.parent()).val();
				m = $('[data-type="M"]', this._picker.parent()).val();
				if(h && m) {
					return h + ':' + m;
				} else {
					return '';
				}
			}
		},

		getMs: function() {
			var ms = -1;
			var val = this.getValue();
			if(val) {
				val = val.split(':');
				ms = parseInt(val[0]) * 3600000 + parseInt(val[1]) * 60000;
			}
			return ms;
		},

		destroy: function() {
			this._picker.remove();
			this._picker = null;
			this._holder = null;
		}
	});
	
	return TimePicker;
});
