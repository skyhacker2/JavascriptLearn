define(function(require) {
	var $ = require('jquery') || jQuery;

	var _msg = {};
	var _commonMsg = {};

	function _getMsg(key, type) {
		return _msg[key] && _msg[key][type] || _commonMsg[type];
	};

	function _getGroup(item) {
		var group = $(item).closest('.form-group');
		if(group.length) {
			return group;
		}
		return null;
	};

	function _getHelper(item, group) {
		var helper;
		group = group || _getGroup(item);
		if(group) {
			helper = $('.help-error', group);
			if(helper.length) {
				return helper;
			}
		}
		return null;
	};

	function _formatMsg(msg, data) {
		msg = msg + '';
		if(data) {
			$.each(data, function(key, val) {
				msg = msg.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), val);
			});
		}
		return msg;
	};

	var _validators = {
		mandatory: require('./validator-mandatory'),
		email: require('./validator-email'),
		emailList: require('./validator-email-list'),
		name: require('./validator-name'),
		password: require('./validator-password'),
		maxLength: require('./validator-max-length'),
		maxByteLength: require('./validator-max-byte-length'),
		url: require('./validator-url'),
		set: require('./validator-set'),
		number: require('./validator-number'),
		integer: require('./validator-integer'),
		datetime: require('./validator-datetime'),
		wordUpperCase: require('./validator-word-upper-case'),
		domain: require('./validator-domain'),
		domainList: require('./validator-domain-list')
	};
	
	var form = {};

	form.highLight = function(item, msg, type) {
		var helper;
		var group = _getGroup(item);
		if(group) {
			helper = _getHelper(item, group);
			group.removeClass('has-error has-warning has-info has-success');
			if(type === '') {
				helper && helper.hide();
			} else {
				group.addClass('has-' + (type || 'error'));
				if(helper) {
					if(msg) {
						helper.html(msg).css('display', helper.closest('.form-inline, .form-horizontal').length ? 'inline-block' : 'block');
						return true;
					} else {
						helper.hide();
					}
				}
			}
		}
		return false;
	};

	form.dehighLight = function(item, msg, type) {
		form.highLight(item, '', '');
	};

	form.validateOne = function(item) {
		var res = {
			passed: true
		};
		var request = $(item).data('validator');
		var tmp, key, list, fieldData;
		if(!request) {
			return res;
		}
		tmp = request.split(/\s*:\s*/);
		key = tmp[0];
		list= tmp[1];
		if(!list) {
			list = key;
			key = '';
		}
		if(!list) {
			return res;
		}
		list = list.split(/\s+/);
		$.each(list, function(i, type) {
			var passed = true;
			var tmp, msg, msgData, validator, validatorParam;
			if(!type) {
				return;
			}
			if(type.indexOf('@') > 0) {
				tmp = type.split('@');
				validatorParam = tmp[0];
				type = tmp[1];
			}
			validator = _validators[type];
			if(validator) {
				passed = validator(item, validatorParam);
				if(typeof passed == 'object') {
					fieldData = passed.data;
					msgData = passed.msgData;
					passed = passed.passed;
				}
			}
			if(!passed) {
				msg = _getMsg(key, type);
				if(msgData) {
					msg = _formatMsg(msg, msgData);
				}
				res = {
					passed: false,
					helped: form.highLight(item, msg),
					failType: type
				};
				return false;
			}
		});
		if(res.passed) {
			if(fieldData) {
				res.data = fieldData;
			}
			form.highLight(item, '', '');
		}
		return res;
	};
	
	form.validate = function(container, opt) {
		var res = {
			passed: true,
			data: {},
			failList: [],
			helpList: []
		};
		$('[data-validator]', container).each(function(i, item) {
			if($(item).closest('.display-none, .hidden, .none').length) {
				return;
			}
			var oneRes = form.validateOne(item);
			var failItem
			if(!oneRes.passed) {
				res.passed = false;
				failItem = {item: item, failType: oneRes.failType};
				res.failList.push(failItem);
				if(!oneRes.helped) {
					res.helpList.push(failItem);
				}
			} else if(oneRes.data) {
				res.data[this.name] = oneRes.data;
			}
		});
		res.data = $.extend(form.getData(container, opt), res.data);
		return res;
	};

	form.getData = function(container, opt) {
		opt = opt || {};
		var returnArray = opt.returnArray;
		var res = returnArray ? [] : {};
		var inputType;
		$('input, select, textarea', container).each(function(i, item) {
			if(!item.name) {
				return;
			}
			switch(item.tagName) {
				case 'INPUT':
					inputType = item.type.toUpperCase()
					if(inputType == 'CHECKBOX') {
						if(returnArray) {
							res.push(item.checked ? 'on' : 'off');
						} else {
							if(item.checked) {
								res[item.name] = 'on';
							}
						}
					} else if(inputType == 'RADIO') {
						if(returnArray) {
							res.push(item.checked ? item.value : null);
						} else {
							if(item.checked) {
								res[item.name] = item.value;
							}
						}
					} else {
						if(returnArray) {
							res.push(item.value);
						} else {
							res[item.name] = item.value;
						}
					}
					break;
				case 'SELECT':
				case 'TEXTAREA':
					if(returnArray) {
						res.push(item.value);
					} else {
						res[item.name] = item.value;
					}
					break;
				default:
			}
		});
		return res;
	};

	form.focus = function(item) {
		try {
			$(item)[0].focus();
		} catch(e) {}
	};

	form.setMsg = function(msg) {
		if(msg) {
			_msg = $.extend(_msg, msg);
		}
	};

	form.setCommonMsg = function(commonMsg) {
		if(commonMsg) {
			_commonMsg = $.extend(_commonMsg, commonMsg);
		}
	};

	form.initPlaceHolder = function(field, opt) {
		opt = opt || {};
		$(field).each(function(i, field) {
			field = $(field);
			var placeHolder = field.prev('.place-holder-text');
			if(!field.val()) {
				placeHolder.show();
			}
			placeHolder.on('click', function() {
				try {
					field[0].focus();
				} catch(e) {}
			});
			field.on('keyup', function() {
				if(this.value) {
					placeHolder.hide();
				} else {
					placeHolder.show();
				}
			}).on('focus', function() {
				placeHolder.addClass('focus');
				if(opt.onFocus) {
					opt.onFocus.call(field[0]);
				}
			}).on('blur', function() {
				if(this.value) {
					placeHolder.hide();
				} else {
					placeHolder.show();
				}
				placeHolder.removeClass('focus');
				if(opt.onBlur) {
					opt.onBlur.call(field[0]);
				}
			});
		});
	};

	form.checkPlaceHolder = function(field, opt) {
		opt = opt || {};
		$(field).each(function(i, field) {
			field = $(field);
			var placeHolder = field.prev('.place-holder-text');
			if(!field.val()) {
				placeHolder.show();
			} else {
				placeHolder.hide();
			}
		});
	};

	form.initInputHint = function() {
		$(document.body).delegate('.input-hint-wrapper .form-control', 'focus', function(evt) {
			var hintWrapper = $(this).closest('.input-hint-wrapper');
			var hintBox = $('.input-hint-box', hintWrapper);
			var hintContent = hintBox.html();
			if(hintContent) {
				if(!hintBox.data('default-hint-content')) {
					hintBox.data('default-hint-content', hintContent);
				}
				hintWrapper.addClass('input-hint-on');
			}
		}).delegate('.input-hint-wrapper .form-control', 'blur', function(evt) {
			var hintWrapper = $(evt.target).closest('.input-hint-wrapper');
			var hintBox = $('.input-hint-box', hintWrapper);
			var toRef = setTimeout(function() {
				hintWrapper.removeClass('input-hint-on');
			}, 200);
			hintBox.on('click', function boxClick(evt) {
				clearTimeout(toRef);
				hintBox.off('click', boxClick);
				$(document).on('click', function bodyClick(evt) {
					if($(evt.target).closest('.input-hint-wrapper')[0] == hintWrapper[0]) {
						return;
					}
					hintWrapper.removeClass('input-hint-on');
					$(document).off('click', bodyClick);
				});
			});
		});
		form.initInputHint = function() {};
	};

	form.showInputHint = function(inputBox, hint, type) {
		var hintWrapper = $(inputBox).closest('.input-hint-wrapper');
		var hintBox = $('.input-hint-box', hintWrapper);
		hintWrapper.removeClass('input-hint-error input-hint-success input-hint-warning input-hint-info');
		if(type) {
			hintWrapper.addClass('input-hint-' + type);
		}
		hintBox.html(hint);
		hintWrapper.addClass('input-hint-on');
	};

	form.hideInputHint = function(inputBox, clear) {
		var hintWrapper = $(inputBox).closest('.input-hint-wrapper');
		var hintBox = $('.input-hint-box', hintWrapper);
		hintWrapper.removeClass('input-hint-on input-hint-error input-hint-success input-hint-warning input-hint-info');
		if(clear) {
			hintWrapper.removeClass('input-hint-error, input-hint-success, input-hint-warning, input-hint-info');
			hintBox.html(hintBox.data('default-hint-content') || '');
		}
	};

	form.moveInputEnd = function(boxEl) {
		var textRange;
		boxEl = $(boxEl)[0];
		form.focus(boxEl);
		if(boxEl.createTextRange) {
			textRange = boxEl.createTextRange();
			textRange.moveStart('character', boxEl.value.length);
			textRange.collapse(true);
			textRange.select();
		} else {
			boxEl.setSelectionRange(boxEl.value.length, boxEl.value.length);
		}
	};

	/**
	 * getInputRange
	 * 获取Input或者Textarea选中的文字的Range
	 * @param {Element | jQuery DOM} textarea textarea元素或者input元素
	 * @return {Range} 一个包含range信息的对象（如果要对IE7、IE8兼容，Range是无法伪造的）
	 */
	form.getInputRange = function(textarea) {
		(textarea instanceof $) && (textarea = textarea[0]); 

		textarea.focus();
		var rangeData = {text: '', start: 0, end: 0 };
		if (textarea.setSelectionRange) { // W3C
			rangeData.start= textarea.selectionStart;
			rangeData.end = textarea.selectionEnd;
			rangeData.text = (rangeData.start != rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end): "";
		} else if (document.selection) { // IE
			var i,
				initRange = document.selection.createRange(),
				oS = document.selection.createRange(),
				oR = document.body.createTextRange();
			
			oR.moveToElementText(textarea);
			rangeData.text = oS.text;
			rangeData.bookmark = oS.getBookmark();
			textarea.select();
			oS.setEndPoint('StartToStart', document.selection.createRange());
			rangeData.end = oS.text.length;
			rangeData.start = rangeData.end - rangeData.text.length;
			initRange.select();
		}

		return rangeData;
	}

	/**
	 * setInputRange
	 * 按照Range设置input或者textarea的位置
	 * @param {ELement | jQuery DOM} textarea textarea或input对象
	 * @param {Range} 包含Range数据的对象，如果为空则与moveInputEnd一样
	 */
	function _setInputRange(textarea, rangeData) {
		var oR, start, end;

		textarea.focus();
		if (textarea.setSelectionRange) { // W3C
			textarea.setSelectionRange(rangeData.start, rangeData.end);
		} else if (textarea.createTextRange) { // IE
			oR = textarea.createTextRange();
			
			// Fixbug : ues moveToBookmark()
			// In IE, if cursor position at the end of textarea, the set function don't work
			if(textarea.value.length === rangeData.start) {
				oR.collapse(false);
				oR.select();
			} else {
				oR.moveToBookmark(rangeData.bookmark);
				oR.select();
			}
		}
	}

	/**
	 * addText2Input
	 * 向Input或Textarea添加文字
	 * @param {ELement | jQuery DOM} textarea textarea或input对象
	 * @param {String} text 添加的文字
	 * @param {Range} rangeData 可选的range数据
	 */
	form.addText2Input = function (textarea, text, rangeData) {
		(textarea instanceof $) && (textarea = textarea[0]);
		(rangeData) || (rangeData = this.getInputRange(textarea));

		var oValue, nValue, oR, sR, nStart, nEnd, st;
		
		if (textarea.setSelectionRange) { // W3C
			oValue = textarea.value;
			nValue = oValue.substring(0, rangeData.start) + text + oValue.substring(rangeData.end);
			nStart = nEnd = rangeData.start + text.length;
			st = textarea.scrollTop;
			textarea.value = nValue;
			// Fixbug:
			// After textarea.values = nValue, scrollTop value to 0
			if(textarea.scrollTop != st) {
				textarea.scrollTop = st;
			}
			setTimeout(function () {
				textarea.setSelectionRange(nStart, nEnd);
			}, 0);
		} else if (textarea.createTextRange) { // IE
			_setInputRange(textarea, rangeData); // in IE7 & IE8, we need set the range first.
			sR = document.selection.createRange();
			sR.text = text;
			sR.setEndPoint('StartToEnd', sR);
			sR.select();
			var _rangeData = this.getInputRange(textarea);
			rangeData.text = _rangeData;
			rangeData.start = _rangeData.start;
			rangeData.bookmark = _rangeData.bookmark;
			rangeData.end = _rangeData.end;
		}
	};
	
	return form;
});
