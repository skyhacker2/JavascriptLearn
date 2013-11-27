define(function(require) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		common = require('./common');

	// @private 检查是否是数组
	function _isArray(value){
		return (Object.prototype.toString.apply(value) === '[object Array]');
	}

	/**
	 * @class Blcok()
	 * @param {Object} data block的数组对象
	 * @param {Object} opt 生成Block的可选参数
	 * @param {Element} opt.target block对象的元素
	 */
	function Block(data, opt){
		this.data = data;
		this.tpl = require('./tpl-pool').get();
		this.section = this.tpl.getSection(data.sectionUID);
		this.target = (opt && opt.target) || $('[data-block-uid="' + data.UID + '"]', common.getContext());
		var setter = require("../../../template/block/" + data.blockType + "/init-main").setter,
			i;
		for(i in setter){
			this[i] = setter[i];
		}

		if(common.debug && this.data === undefined || this.data.UID === undefined || this.data.sectionUID === undefined || this.section === undefined || this.target === undefined || this.tpl === undefined){
			common.debug.error("This block created in a wrong way.");
			!this.data && common.debug.log("this.data == undefined");
			this.data && !this.data.UID && common.debug.log("this.data.UID == undefined");
			this.data && !this.data.sectionUID && common.debug.log("this.data.sectionUID == undefined");
			!this.section && common.debug.log("this.section == undefined");
			!this.target && common.debug.log("this.target == undefined");
			!this.tpl && common.debug.log("this.tpl == undefined");
		}

	}
	Block.prototype = {
		constructor: Block,

		// @private 用于生成类似promise对象
		_feedback: function(){
			var sections = arguments;

			return {
				isEmpty: function(callback){
					var i,
						list = [];
					for(i = sections.length; i--;){
						if(sections[i].check()){
							list.push(sections[i]);
						}
					}
					if(list.length){
						callback.apply(window, list);
					}
				}
			};
		},

		/**
		 * add(blockType)
		 * 添加一个制定类型的block
		 * @param {String} blockType block类型
		 */
		add: function(blockType){
			var that = this,
				isDone = false,
				callback = undefined,
				target,
				mod,
				res = {
					done: function(_callback){
						if(isDone){
							_callback.call(window, target, mod);
						}else{
							callback = _callback;
						}
					}
				};
			require(['../../../template/block/' + blockType + '/init-main'], function(blockMod){
				var UID = that.tpl.newBlockUID(),
					data = {UID: UID, sectionUID: that.section.UID},
					block;

				blockMod.init && blockMod.init();
				mod = blockMod;
				target = $(blockMod.make(data));
				block = new Block(data, {target: target});
				block.section = that.section;
				that.tpl.addBlock(block);
				that.section.append(block, that);
				common.bindAllEditor(target);
				callback && callback.call(window, target, mod);
				isDone = true;

			});

			return res;
		},

		/**
		 * copy
		 * 对当前block进行复制，并添加在当前block后面
		 */
		copy: function(){
			var target = this.target,
				newUID = this.tpl.newBlockUID(),
				data = {},
				block;
			target = target.clone(true);
			target.attr("data-block-uid", newUID);
			$.extend(true, data, this.data);
			data.UID = newUID;
			block = new Block(data, {target: target});
			this.tpl.addBlock(block);
			this.section.append(block, this);
			common.bindAllEditor(target);

			return {
				target: target
			};
		},

		/**
		 * remove
		 * 删除当前block
		 */
		remove: function(){
			var target = this.target,
				that = this,
				section = this.section;

			target.remove();
			this.section.remove(this);
			this.tpl.removeBlock(this);
			this.target = null;
			this.data = null;
			this.tpl = null;
			this.section = null;

			return this._feedback(section);
		},

		/**
		 * left
		 * 将当前block向左移
		 */
		left: function(){
			var target = this.target,
				left = this.tpl.getSection(this.section.UID, -1),
				section = this.section;

			if(left === section){
				rfl.alerts.show('There is nothing on the left.', {type: 'error', container: '#design-alert'});
				return this._feedback(section, left);
			}

			this.setSection(left);
			section.remove(this);
			left.append(this);

			return this._feedback(section, left);

		},

		/**
		 * right
		 * 将当前block向右移
		 */
		right: function(){
			var target = this.target,
				right = this.tpl.getSection(this.section.UID, 1),
				section = this.section;

			if(right === section){
				rfl.alerts.show('There is nothing on the right.', {type: 'error', container: '#design-alert'});
				return this._feedback(section, right);
			}

			this.setSection(right);
			section.remove(this);
			right.append(this);

			return this._feedback(section, right);

		},

		/**
		 * up
		 * 将当前block向上移
		 */
		up: function(){
			var target = this.target,
				section = this.section,
				up = section.offsetBlock(this, -1);

			section.remove(this);
			section.insertBefore(this, up);

		},

		/**
		 * down
		 * 将当前block向下移
		 */
		down: function(){
			var target = this.target,
				section = this.section,
				down = section.offsetBlock(this, 1);

			section.remove(this);
			section.append(this, down);

		},

		setSection: function(section){
			this.section = section;
			this.data.sectionUID = section.UID;
		}

	};

	return Block;
});