// 通用函数包
define(function(require) {
	var frame,
		imgUploadURL;

	/**
	 * getFrame
	 * 得到编辑器的frame
	 */
	function getFrame(){
		if(frame){
			return frame;
		}else{
			return frame = document.getElementById("containFrame");
		}
	}

	/**
	 * getContext
	 * 得到编辑器的context
	 */
	function getContext(){
		return getFrame().contentDocument;
	}

	/**
	 * fixHeight
	 * 修复编辑器高度
	 */
	function fixHeight(){
		return getFrame().contentWindow.fixHeight();
	}

	/**
	 * createHolder
	 * 为section生成placeholder
	 * @param {Section} section 可以传N个Section，如createHolder(seciton1, section2, section3....)
	 */
	function createHolder(){
		var i = arguments.length;
		for(; i--;){
			arguments[i].addHolder($('<div class="nothing"><a href="javascript:void(0)" data-rfl-click="add">Click here to add blocks</a></div>'));
		}
	}

	/**
	 * bindAllEditor
	 * 对指定context的所有子元素绑定CKEditor
	 * @param {Element} context
	 */
	function bindAllEditor(context){
		var ele = $('[contenteditable="true"]', context);
		getFrame().contentWindow.require(["ckeditor"], function(ckeditor){
			for(var i = ele.length; i--;){
				ckeditor.inline(ele[i]);
			}
			if(context.attr("contenteditable")){
				ckeditor.inline(context[0]);
			}
		});
	}

	/**
	 * scrollTop
	 * 滚动条滚动到制定位置
	 * @param {Number} value 滚动到的高度
	 * @param {Element} target 对应元素，用于判断是否应该滚动到那里
	 */
	function scrollTop(value, target){
		var height = $(window).height(),
			context = (navigator.userAgent.indexOf('Firefox') >= 0 || navigator.userAgent.indexOf('MSIE') >= 0) ? 
				$(document.documentElement) : $(document.body),
			scrollTop = context.scrollTop(),
			difference = value - scrollTop;
			
		if(difference > 0 && difference < target.height()){
			return;
		}

		if(navigator.userAgent.indexOf('Firefox') >= 0 || navigator.userAgent.indexOf('MSIE') >= 0){
			context.animate({scrollTop: value}, 800);
		}else{
			context.animate({scrollTop: value}, 800);
		}
	}

	function reset(){
		frame = null;
	}

	function imgUploadAPI(url){
		if(url){
			imgUploadURL = url;
		}else{
			return imgUploadURL || "image/upload";
		}
	}

	return {
		getContext: getContext,
		getFrame: getFrame,
		fixHeight: fixHeight,
		createHolder: createHolder,
		bindAllEditor: bindAllEditor,
		scrollTop: scrollTop,
		debug: console,
		reset: reset,
		imgUploadAPI: imgUploadAPI
	};

});