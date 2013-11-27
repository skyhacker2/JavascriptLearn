define(function(require) {
	var $ = require('jquery');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	
	var _container;
	var _alertObj;
	
	var alerts = {};
	
	alerts.show = function(content, opt, timeout) {
		var type;
		if(_alertObj) {
			_alertObj.alert('close');
		}
		if(typeof opt == 'string') {
			type = opt;
			opt = {};
		} else {
			opt = opt || {};
			type = opt.type;
		}
		timeout = timeout || opt.timeout;
		type = ({
			info: 'info',
			success: 'success',
			error: 'danger'
		})[type];
		var block = opt.block;
		var btns = opt.btns;
		var btnsHtml = [];
		if(btns && btns.length) {
			block = true;
			$.each(btns, function(i, btn) {
				btnsHtml.push([
					'<button class="btn ', btn.className || 'btn-default', '" ',
					btn.dismiss ? 'data-dismiss="alert">' : '>',
					btn.text,
					'</button>'
				].join(''));
			});
		}
		content = [
			'<div class="alert' + (type ? ' alert-' + type : ' alert-warning') + (block ? ' alert-block' : '') + '" style="display: none;">',
				opt.noCloseBtn ? '' : '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>',
				content,
				btnsHtml.length ? '<p class="btns-container" data-type="btns-container">' + btnsHtml.join(' ') + '</p>' : '',
			'</div>'
		].join('');
		var alertObj;
		if(opt.container) {
			alertObj = $(content).appendTo($(opt.container)).fadeIn();
		} else {
			if(!_container) {
				_container = $('.alerts-container');
				if(!_container.length) {
					_container = $('<div class="alerts-container"></div>').appendTo(document.body);
				}
			}
			alertObj = $(content).appendTo(_container).fadeIn();
		}
		if(btns && btns.length) {
			alertObj.find('[data-type="btns-container"] button').each(function(i, btnEl) {
				if(i === 0) {
					btnEl.focus();
				}
				if(btns[i] && btns[i].click) {
					$(btnEl).on('click', btns[i].click);
				}
			});
		}
		alertObj.on('closed.bs.alert', function() {
			if(btns && btns.length) {
				alertObj.find('[data-type="btns-container"] button').each(function(i, btnEl) {
					if(btns[i] && btns[i].click) {
						$(btnEl).off('click', btns[i].click);
					}
				});
			}
			alertObj.remove();
		});
		if(timeout !== 0) {
			setTimeout(function() {
				alertObj.alert('close');
			}, timeout || 10000);
		}
		_alertObj = alertObj;
		return alertObj;
	};
	
	alerts.confirm = function(content, callback, opt) {
		opt = opt || {};
		if(opt.makeSure) {
			content = content + '<div class="section-sm"><label class="mockup-checkbox-label"><label class="mockup-checkbox"><input type="checkbox" data-rfl-type="confirm-make-sure" /><span><i class="icon-ok"></i></span></label><span>' + langResourceCommon.label.iAmSure + '</span></label></div>';
		}
		var btnClassName = ({
			info: 'info',
			success: 'success',
			error: 'danger'
		})[opt.type] || 'warning';
		var alertObj = alerts.show(content, $.extend(opt, {
			type: opt.type,
			noCloseBtn: true,
			btns: [
				{
					text: langResourceCommon.label.ok,
					className: 'btn-' + btnClassName,
					click: function() {
						var makeSure = $('[data-rfl-type="confirm-make-sure"]', alertObj)[0];
						if(!makeSure || makeSure.checked) {
							alertObj.alert('close');
							callback();
						} else if(makeSure) {
							$(makeSure).closest('.mockup-checkbox-label').animate({opacity: '0.5'}, 100).animate({opacity: '1'}, 100).animate({opacity: '0.5'}, 100).animate({opacity: '1'}, 100);
						}
					}
				},
				{
					text: langResourceCommon.label.cancel,
					dismiss: true,
					click: function() {
						opt.cancelCallback && opt.cancelCallback();
					}
				}
			],
			timeout: 0
		}));
	};
	
	return alerts;
});