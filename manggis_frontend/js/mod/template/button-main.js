define(function(require) {
	var $ = require('jquery'),
		common = require('mod/template/common'),
		tplPool = require('mod/template/tpl-pool');

	/**
	 * init
	 * 初始化Button编辑控件绑定
	 */
	function init(){
		$(common.getContext()).on("click", ".buttonContainer", function(event){
			require(['./edit-button-main'], function(buttonMod){
				buttonMod.show(tplPool.get().getBlock(+($(event.target).closest('[data-block-type="button"]')).attr("data-block-uid")));
			});
		});
	}

	return {
		init: init
	}

});