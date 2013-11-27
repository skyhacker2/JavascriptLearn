define(function(require){
	var $ = require('jquery'),
		tplPool = require('mod/template/tpl-pool');

	/**
	 * trigger
	 * 触发器，在ckeditor执行时触发
	 * @params {CKEDITOR.editor} editor 触发事件的eidtor
	 */
	function trigger(editor){
		var target = $(editor.container.$),
			setter = target.attr("data-setter"),
			block = tplPool.get().getBlock(+target.closest('[data-tpl-type="block"]').attr("data-block-uid"));

		block[setter](target.html());
	}

	return {
		trigger: trigger
	};
});