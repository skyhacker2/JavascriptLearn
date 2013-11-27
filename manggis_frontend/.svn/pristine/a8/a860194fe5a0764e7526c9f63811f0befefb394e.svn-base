define(function(require) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		_Block = require('./Block'),
		_Section = require('./Section'),
		tplView = require('./tpl-view.tpl.html');

	var requires;

	/**
	 * @class Tpl
	 * @param data tpl的数据
	 */
	function Tpl(data){
		this.tplID = data.tplID;
		this.describe = data.describe;
		this.structure = data.structure;
		this.structs = [];	
		this.blocks = [];	// block list
		this.sections = [];	// section list
		this.blockUID = 0;
		this.blockCache = {};
		this.sectionCache = {};
		this.background = data.background;
		this.padding = data.padding;
		this.border = data.border;
	}
	Tpl.prototype = {
		constructor: Tpl,

		/**
		 * make
		 * 构建Template Editor的DOM
		 */
		make: function(){
			var i,
				j,
				k,
				cData,
				cLen,
				bData,
				bLen,
				data = this.structure,
				len = data.length,
				html = "",
				sectionUID = -1;
			// 构建row
			for(i = 0; i < len; i++){
				html += [
							'<table width="100%" border="0" cellspacing="0">',
							'<tr width="100%">'
						].join("");
				// 构建col
				cData = data[i];
				cLen = cData.length;
				for(j = 0; j < cLen; j++){
					html += [
								'<td width="',
								cData[j].width,
								'" align="center" valign="top" data-tpl-type="section" data-section-uid="',
								++sectionUID,
								'" style="padding:0px;">'
							].join("");
					// 构建block
					bData = cData[j].blocks;
					bLen = bData.length;
					for(k = 0; k < bLen; k++){
						bData[k].sectionUID = sectionUID;
						html += require("../../../template/block/" + bData[k].blockType + "/init-main").make(bData[k]);
					}
					html += '</td>';
				}
				html += '</tr></table>';
			}

			/**
			 * 对blcokMod依赖的模块初始化，认为make只有页面生成时候使用
			 * 所以实际上blockMod的init并不是预先初始的，而是等到页面完成后才初始的
			 */
			if(require && requires.length && requires.length > 0){
				for(i = requires.length; i--;){
					requires[i].init && requires[i].init();
				}
				requires = undefined;
			}
			return html;
		},

		/**
		 * view
		 * 构建Template Viewer的DOM
		 */
		view: function(){
			var data = this.structure;

			return tplView.render({data: data, background: this.background, padding: this.padding || "0px", border: this.border || ""});
		},

		/**
		 * init
		 * 初始化，只运行一次，会将所有需要的block数据加载进来
		 * @param {Function} callback 初始化后的回调
		 */
		init: function(callback){
			var i,
				j,
				k,
				cData,
				cLen,
				bData,
				bLen,
				data = this.structure,
				len = data.length,
				cache = {},
				list = [],
				that = this;

			for(i = 0; i < len; i++){
				cData = data[i];
				cLen = cData.length;
				for(j = 0; j < cLen; j++){
					this.sections.push(cData[j]);
					bData = cData[j].blocks;
					bLen = bData.length;
					for(k = 0; k < bLen; k++){
						if(!cache[bData[k].blockType]){
							cache[bData[k].blockType] = true;
						}
						bData[k].UID = this.blockUID++;
						this.blocks.push(bData[k]);
					}
				}
				this.structs.push(j);
			}

			for(i in cache){
				list.push("../../../template/block/" + i + "/init-main");
			}

			require(list, function(){
				requires = Array.prototype.slice.call(arguments, 0);
				callback(that);
			});

		},

		/**
		 * getBlock
		 * 得到指定UID的block
		 * @param {Number} UID
		 */
		getBlock: function(UID){
			return this.blockCache[UID] || (this.blockCache[UID] = new _Block(this.blocks[UID]));
		},

		/**
		 * getSection
		 * 得到指定UID和偏移的section
		 * @param {Number} UID
		 * @param {Number} offset
		 */
		getSection: function(UID, offset){
			if(offset){
				var lastRow = -1,
					currRow = -1,
					colCount = 0,
					structs = this.structs,
					len = structs.length;
					
				for(var i = 0; i < len; i++){
					currRow += structs[i];
					if(currRow >= UID){
						colCount = structs[i]
						break;
					}
					lastRow = currRow;
				}

				UID = UID + offset;

				if(lastRow >= UID){
					UID += colCount;
				}else if(UID > currRow){
					UID -= colCount;
				}

			}

			return this.sectionCache[UID] || (this.sectionCache[UID] = new _Section(this.sections[UID], this, UID));
		},

		/**
		 * newBlockUID
		 * 得到一个新的block UID
		 */
		newBlockUID: function(){
			return this.blockUID++;
		},

		/**
		 * addBlock
		 * 添加一个新的block
		 * @param {Block} block 添加的blcok
		 */
		addBlock: function(block){
			this.blockCache[block.data.UID] = block;
		},

		/**
		 * removeBlock
		 * 删除block
		 * @param {Block} block 删除的block 
		 */
		removeBlock: function(block){
			delete this.blockCache[block.data.UID];
		},

		/**
		 * destroy
		 * 销毁tpl
		 */
		destroy: function(){
			this.tplID = undefined;
			this.describe = undefined;
			this.structure = null;
			this.structs = null;	
			this.blocks = null;
			this.sections = null;
			this.blockUID = undefined;
			this.blockCache = null;
			this.sectionCache = null;
			this.background = undefined;
		}

	}
	
	return Tpl;
});