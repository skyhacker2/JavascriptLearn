define(function(require) {
	var $ = require('jquery');
	var dialogTpl = require('./dialog.tpl.html');
	
	var dialog = {};
	
	dialog.create = function(opt) {
		opt = opt || {};
		var hidden = false;
		var btnsHtml = [];
		var btns = opt.btns;
		opt.backdrop = typeof opt.backdrop != 'undefined' ? opt.backdrop : 'static';
		opt.fade = typeof opt.fade != 'undefined' ? opt.fade : true;
		if(btns && btns.length) {
			$.each(btns, function(i, btn) {
				btnsHtml.push([
					'<button class="btn ', btn.className || 'btn-default', '" ',
					btn.dismiss ? 'data-dismiss="modal">' : '>',
					btn.text,
					'</button>'
				].join(''));
			});
		}
		var dialogObj = $(dialogTpl.render({
			fade: opt.fade,
			title: opt.title,
			content: opt.content,
			btns: btnsHtml.join('')
		})).on('hide.bs.modal', function() {
			hidden = true;
		}).on('hidden.bs.modal', function(evt) {
			$(document.body).removeClass('modal-shown');
			if(btns && btns.length) {
				dialogObj.find('.modal-footer button').each(function(i, btnEl) {
					if(btns[i] && btns[i].click) {
						$(btnEl).off('click', btns[i].click);
					}
				});
			}
			dialogObj.remove();
		}).on('show.bs.modal', function() {
			$(document.body).addClass('modal-shown');
		}).on('shown.bs.modal', function() {
			var focusEl = dialogObj.find(opt.focus || 'input:visible, textarea:visible')[0];
			try {
				focusEl && focusEl.focus();
			} catch(e) {}
		});
		dialogObj.modal(opt);
		if(!hidden && btns && btns.length) {
			dialogObj.find('.modal-footer button').each(function(i, btnEl) {
				if(btns[i] && btns[i].click) {
					$(btnEl).on('click', btns[i].click);
				}
			});
		}
		return dialogObj;
	};
	
	return dialog;
});