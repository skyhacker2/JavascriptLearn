define(function(require, exports) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		config = require('../../../template/block/config'),
		mainTpl = require('./add-block.tpl.html'),
		common = require('mod/template/common'),
		tplPool = require('mod/template/tpl-pool'),
		Block = require('mod/template/Block'),
		dialogMod = require('mod/template/dialog-main'),
		content = mainTpl.render({blocks: config}),
		title = 'Please choose a block.',
		block,
		section;

	/**
	 * @private 初始化dialog
	 */
	function init(){
		dialogMod.create({title: title, content: content}, "addBlock").done(function(dialog){

			rfl.Delegator.getDelegator(dialog).delegate('click', 'changeBlock', function(event, blockType){

				if(block){
					block.add(blockType).done(function(target, blockMod){
						common.scrollTop(target.offset().top, target);
						common.fixHeight();	

						if(blockMod.callback){
							blockMod.callback(block.tpl.getBlock(+target.attr("data-block-uid"))); // 添加一种回调方法
						}else{
							hide();
						}
					});
				}else{
					require(['../../../template/block/' + blockType + '/init-main'], function(blockMod){
						var UID = tplPool.get().newBlockUID(),
							data = {UID: UID, sectionUID: section.UID},
							block,
							target = $(blockMod.make(data));

						blockMod.init && blockMod.init();
						block = new Block(data, {target: target});
						block.tpl.addBlock(block);
						section.removeHolder();
						section.append(block);
						common.bindAllEditor(target);
						common.scrollTop(target.offset().top, target);
						common.fixHeight();	

						if(blockMod.callback){
							blockMod.callback(block); // 添加一种回调方法
						}else{
							hide();
						}

					});

				}

			});
		});
	}

	/**
	 * show
	 * 显示dialog
	 * @param {Section} section 添加操作对应的section
	 * @param {Block} block 添加操作对应的block
	 */
	function show(_section, _block){
		init();
		section = _section;
		block = _block;
	}

	/**
	 * hide
	 * 隐藏dialog
	 */
	function hide(){
		dialogMod.hide();
	}
	
	exports.show = show;
	exports.hide = hide;
});