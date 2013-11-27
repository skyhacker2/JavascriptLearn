define(function(require) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		context,
		frame,
		timeout,
		_target,
		editLock = require('./edit-lock'),
		common = require('./common'),
		tplPool = require('./tpl-pool'),
		hasInit = false;


	/**
	 *	private manner
	 */
	function _firstInit(){
		// fix the bug of Firefox
		$(document).on('mouseover', '#mask, #mask-bottom, #mask-left, #mask-right', function(event){
			clearTimeout(timeout);
		});

		rfl.Delegator.getPageDelegator().delegate('click', 'add', function(event){
			var target = $(_target),
				block = tplPool.get().getBlock(+target.attr("data-block-uid")),
				section = block.section;

			require(['./add-block-main'], function(addBlock){
				addBlock.show(section, block);
			});
		}).delegate('click', 'copy', function(){
			if(editLock.isLock()){
				rfl.alerts.show("You should not do that.", {type: 'error', container: '#design-alert'});
				return;
			}
			var target = $(_target);

			target = tplPool.get().getBlock(+target.attr("data-block-uid")).copy().target;
			common.scrollTop(target.offset().top, target);
			common.fixHeight();

		}).delegate('click', 'copyCol', function(){
			rfl.alerts.show("Coming soon……", {type: 'error', container: '#design-alert'});
		}).delegate('click', 'remove', function(){
			if(editLock.isLock()){
				rfl.alerts.show("You should not do that.", {type: 'error', container: '#design-alert'});
				return;
			}

			// 阻止权限更低的钥匙解锁
			editLock.lock({
				level: 10
			});

			rfl.alerts.confirm(
				"Are you sure to remove this block?",
				function() {

					var target = $(_target)

					target.slideUp({
						duration: 800,
						done: function(){
							tplPool.get().getBlock(+target.attr("data-block-uid")).remove().isEmpty(common.createHolder);

							common.fixHeight();
							editLock.unlock({
								level: 10
							});

							hide();

						}
					});
				},
				{
					cancelCallback:function(){
						editLock.unlock({
							level: 10
						});
					},
					container: '#design-alert'
				}
			);
		}).delegate('click', 'up', function(){
			if(editLock.isLock()){
				rfl.alerts.show("You should not do that.", {type: 'error', container: '#design-alert'});
				return;
			}

			var target = $(_target),
				prev = target.prev();

			if(prev.length){
				target.slideUp({
					duration: 400,
					done: function(){
						tplPool.get().getBlock(+target.attr("data-block-uid")).up();
						target.slideDown({
							duration: 400,
							done: function(){
								common.fixHeight();
							}
						});
					}
				});
				common.scrollTop(target.offset().top - target.height(), target);
			}else{
				rfl.alerts.show("There is no block on the top of this block.", {type: 'error', container: '#design-alert'});
			}

			$("#mask, #mask-bottom, #mask-right, #mask-left").hide();
		}).delegate('click', 'down', function(){
			if(editLock.isLock()){
				rfl.alerts.show("You should not do that.", {type: 'error', container: '#design-alert'});
				return;
			}

			var target = $(_target),
				next = target.next();

			if(next.length){
				target.slideUp({
					duration: 400,
					done: function(){
						tplPool.get().getBlock(+target.attr("data-block-uid")).down();
						target.slideDown({
							duration: 400,
							done: function(){
								common.fixHeight();
							}
						});
					}
				});
				common.scrollTop(target.offset().top + target.height(), target);
			}else{
				rfl.alerts.show("There is no block on the bottom of this block.", {type: 'error', container: '#design-alert'});
			}

			$("#mask, #mask-bottom, #mask-right, #mask-left").hide();
		}).delegate('click', 'left', function(){
			if(editLock.isLock()){
				rfl.alerts.show("You should not do that.", {type: 'error', container: '#design-alert'});
				return;
			}

			var target = $(_target);

			tplPool.get().getBlock(+target.attr("data-block-uid")).left().isEmpty(common.createHolder);
			common.scrollTop(target.offset().top, target);
			common.fixHeight();

		}).delegate('click', 'right', function(){
			if(editLock.isLock()){
				rfl.alerts.show("You should not do that.", {type: 'error', container: '#design-alert'});
				return;
			}

			var target = $(_target);

			tplPool.get().getBlock(+target.attr("data-block-uid")).right().isEmpty(common.createHolder);
			common.scrollTop(target.offset().top, target);
			common.fixHeight();
		}).delegate('click', 'edit', function(){
			var target = $(_target),
				block = tplPool.get().getBlock(+target.attr("data-block-uid"));

			require(['./edit-block-main'], function(editBlock){
				editBlock.show(block);
			});
		});

	}

	/**
	 *	public manner
	 */	
	function show(event){
		event = event || {currentTarget: _target}; // fix the currentTarget

		if(editLock.isLock()){
			return;
		}
		clearTimeout(timeout);
		timeout = setTimeout(function(){
			var target = event.currentTarget;

			$(_target).removeClass("blockFocus");
			_target = target;
			$(target).addClass("blockFocus");

			var frameOffset = $(frame).offset(),
				fixTop = frameOffset.top - 30,
				fixLeft = frameOffset.left,
				offset = $(target).offset(),
				left = offset.left + fixLeft,
				top = offset.top + fixTop;

			$("#mask").css("width", target.offsetWidth)
					  .css("left", left)
					  .css("top", top + 10)
					  .show();
			$("#mask-bottom").css("width", target.offsetWidth)
					  		 .css("left", left)
					  		 .css("top", top + target.offsetHeight + 10)
					  		 .show();
			$("#mask-left").css("height", target.offsetHeight)
					  	   .css("left", left - 30)
					  	   .css("top", top)
					  	   .show();
			$("#mask-left-fix").css("margin-top", target.offsetHeight / 2);
			$("#mask-right").css("height", target.offsetHeight)
					  		.css("left", left + target.offsetWidth - 20)
					  		.css("top", top)
					  		.show();
			$("#mask-right-fix").css("margin-top", target.offsetHeight / 2)
		}, 20);
	}

	function hide(event){
		event = event || {};

		if((event.relatedTarget && $(event.relatedTarget).closest("#mask").length > 0) || editLock.isLock()){
			return;
		}
		clearTimeout(timeout);
		timeout = setTimeout(function(){
			$(_target).removeClass("blockFocus");
			$("#mask, #mask-bottom, #mask-right, #mask-left").hide();
		}, 200);
	}

	/**
	 * init
	 * 在指定的frame初始化tool
	 * @param {iFrame} frame 指定的iframe
	 */
	function init(_frame){

		if(!hasInit){
			_firstInit();
			hasInit = true;
		}

		frame = _frame;
		context = frame.contentDocument;

		rfl.Delegator.getDelegator(context).delegate('click', 'add', function(event){
			var target = $(event.target).closest('[data-section-uid]'),
				section = tplPool.get().getSection(+target.attr("data-section-uid"));

			require(['./add-block-main'], function(addBlock){
				addBlock.show(section);
			});
		});

		if(!$(context).data("tool-mod-has-init")){
			$(context).on('mouseover', '[data-tpl-type="block"]', function(event){
				show(event);
			}).on("mouseleave", '[data-tpl-type="block"]', function(event){
				hide(event);
			});

			$(context).data("tool-mod-has-init", true);
		}
	}

	return {
		init: init,
		show: show,
		hide: hide
	};
});