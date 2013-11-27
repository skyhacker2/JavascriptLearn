define(function(require){
	var $ = require('jquery'),
		rfl = require('rfl'),
		dialogTpl = require('./dialog.tpl.html'),
		editLock = require('mod/template/edit-lock'),
		isShow = false,
		isCreate = false,
		dialog,
		_id,
		_hideCallback;

	/**
	 * create(opt, id, hideCallback)
	 * 创建并显示dialog
	 * @param {Object} opt 参数
	 * @param {String} opt.content dialog内容
	 * @param {Array} opt.btns 按钮定义
	 * @param {String | Number} id dialog的id
	 * @param {Function} hideCallback 隐藏时的回调函数
	 */
	function create(opt, id, hideCallback){
		var _callback,
			_isDone = false;

		if(isCreate){
			if(id === _id){
				return {
					done: function(){}
				};
			}else{
				hide(true).done(function(){
					setTimeout(function(){
						_init(opt, id);
						_callback && _callback(dialog);
					}, 100);
				});
			}
		}else{
			_init(opt, id);
			_isDone = true;
		}

		_hideCallback = hideCallback;

		return {
			done: function(callback){
				if(_isDone){
					callback(dialog);
				}else{
					_callback = callback;
				}
			}
		};
	}

	// @private 初始化dialog
	function _init(opt, id){
		_id = id;
		isCreate = true;

		var btns = opt.btns,
			btnsHtml = [];

		if(btns && btns.length) {
			$.each(btns, function(i, btn) {
				btnsHtml.push([
					'<button class="btn ', btn.className || '', '" ',
					'>',
					btn.text,
					'</button>'
				].join(''));
			});

			opt.btns = btnsHtml.join("");
		}else{
			opt.btns = undefined;
		}

		dialog = $(dialogTpl.render(opt));

		if(btns && btns.length) {
			dialog.find('.modal-footer button').each(function(i, btnEl) {
				if(btns[i] && btns[i].click) {
					$(btnEl).on('click', btns[i].click);
				}
			});
		}

		$(top.document.body).append(dialog);
		dialog.on('click', '.close', function(){
			hide();
		});
		rfl.ajax.history.on('change', hide);
		rfl.css.load('js/mod/template/dialog-main.css');
		_show();
	}

	// @private 显示dialog
	function _show(){
		if(!isShow){
			$("#container").addClass("showTplDialog");
			$("#mask").addClass("showTplDialog");
			$("#mask-left").addClass("showTplDialog");
			$("#mask-right").addClass("showTplDialog");
			$("#mask-bottom").addClass("showTplDialog");

			dialog.show(100, function(){
				dialog.addClass("in");
			});
			isShow = true;
			editLock.lock({
				level: 10
			});
		}
	}

	/**
	 * hide(transition)
	 * 隐藏dialog
	 * param {Boolean} transition 参数用于内部，可无视
	 */
	function hide(transition){
		var _callback;

		if(isShow){
			if(transition !== true){	// 防止在过度时候出现解锁，或者页面跳动
				editLock.unlock({
					level: 10
				});
				$("#container").removeClass("showTplDialog");
				$("#mask").removeClass("showTplDialog");
				$("#mask-left").removeClass("showTplDialog");
				$("#mask-right").removeClass("showTplDialog");
				$("#mask-bottom").removeClass("showTplDialog");
			}

			dialog.removeClass("in");
			setTimeout(function(){
				dialog.remove();
				_callback && _callback();
			}, 300);

			isShow = false;
			isCreate = false;
			rfl.ajax.history.off('change', hide);

			_hideCallback && _hideCallback();
			clearHideCallback();
		}

		return {
			done: function(callback){
				_callback = callback;
			}
		}
	}

	/**
	 * clearHideCallback
	 * 清除隐藏的回调函数
	 */
	function clearHideCallback(){
		_hideCallback = undefined;
		return this;
	}

	return {
		create: create,
		hide: hide,
		clearHideCallback: clearHideCallback
	};
	
});