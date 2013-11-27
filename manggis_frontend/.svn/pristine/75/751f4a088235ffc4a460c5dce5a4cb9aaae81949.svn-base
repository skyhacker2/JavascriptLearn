define(function(require) {
	var $ = require('jquery'),
		common = require('./common');

	/**
	 * @class Section
	 * @param {Object} data Section的数据
	 * @param {Tpl} tpl 对应的Tpl
	 * @param {Number} UID
	 */
	function Section(data, tpl, UID){
		this.data = data;
		this.tpl = tpl
		this.UID = UID;
		this.target = $('[data-section-uid="' + UID + '"]', common.getContext());
		this.holder = undefined;

		if(common.debug && this.data === undefined || this.tpl === undefined || this.UID === undefined || this.target === undefined){
			common.debug.error("This section created in a wrong way.");
			!this.data && common.debug.log("this.data == undefined");
			!this.tpl && common.debug.log("this.tpl == undefined");
			!this.UID && common.debug.log("this.UID == undefined");
			!this.target && common.debug.log("this.target == undefined");
		}
	}
	Section.prototype = {
		constructor: Section,

		/**
		 * check
		 * 检查当前Section是否为空，如果不为空，则将多余的placeholder删掉
		 */
		check: function(){
			var res = (this.data.blocks.length <= 0);
			if(!res && this.holder){
				this.removeHolder();
			}
			return res;
		},

		/**
		 * addHolder
		 * 添加一个placeholder
		 * @param {String} holder 要添加的placeholder的html代码
		 */
		addHolder: function(holder){
			this.holder = holder;
			this.target.html(holder);
		},

		/**
		 * removeHolder
		 * 删除placeholder
		 */
		removeHolder: function(){
			this.holder.remove();
			this.holder = undefined;
		},

		/**
		 * append
		 * 插入block
		 * @param {Block} block 需要插入的block
		 * @param {Block} before 需要在哪个block后插入
		 */
		append: function(block, before){
			var target = block.target,
				data = this.data.blocks;

			if(before){
				target.insertAfter(before.target);

				before = before.data;
				for(var i = data.length; i--;){
					if(data[i] === before){
						data.splice(i + 1, 0, block.data);
					}
				}
			}else{
				target.appendTo(this.target);
				data.push(block.data);
			}
		},

		/**
		 * insertBefore
		 * 在指定block插入block
		 * @param {Object} block 要插入的block
		 * @param {Block} after 需要在哪个block前插入
		 */
		insertBefore: function(block, after){
			var target = block.target,
				data = this.data.blocks;

			target.insertBefore(after.target);

			after = after.data;

			for(var i = data.length; i--;){
				if(data[i] === after){
					data.splice(i, 0, block.data);
				}
			}
		},

		/**
		 * remove
		 * 删除block
		 * @param {Block} block 指定的block
		 */
		remove: function(block){
			var data = this.data.blocks;

			block = block.data;

			for(var i = data.length; i--;){
				if(data[i] === block){
					data.splice(i, 1);
				}
			}

		},

		/**
		 * offsetBlock
		 * 找到指定偏离量的block
		 * @param {Block} block 基准block
		 * @param {Number} offset 偏移量
		 */
		offsetBlock: function(block, offset){
			var data = this.data.blocks,
				i = data.length,
				len = data.length;

			block = block.data;

			for(; i--;){
				if(data[i] === block){
					break;
				}
			}

			i += offset;
			if(i >= len){
				i -= len;
			}else if(i < 0){
				i += len;
			}

			return this.tpl.getBlock(data[i].UID);
		}

	};

	return Section;
});