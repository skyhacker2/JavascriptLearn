// Block的公用部分
define(function(require, exports){

	var defaultOpt = {
			margin: ["0", "0", "0", "0"],
			borderRadius: ["0", "0", "0", "0"],
			background: "transparent"
		},
		makeTpl = require('./make.tpl.html'),
		viewTpl = require('./view.tpl.html'),
		$ = require('jquery');

	// @private 用于组装参数对象
	function _extend(target, object){
		if(!object){
			return target;
		}
		var p, pp, i, tmp;
		for(p in object) {
			if(Object.prototype.hasOwnProperty.call(object, p) && !target[p]) {
				pp = object[p];
				if(typeof pp === "object"){
					if(Object.prototype.toString.call(pp) === "[object Array]"){
						tmp = [];
						for(i = 0; i < pp.length; i++){
							tmp.push(pp[i]);
						}
						target[p] = tmp;
					}else{
						target[p] = _extend({}, pp);
					}
				}else{
					target[p] = pp;
				}
			}
		}
		return target;
	}

	/**
	 * @class Blockprint
	 * @param {Object} blockOpt block的相关的默认参数
	 * @param {MicroTpl} makeTpl 生成make函数的MicroTpl
	 * @param {MicroTpl} viewTpl 生成view函数的MicroTpl
	 * @param {Object} makeOpt 对于make模板的附加参数
	 */
	function Blockprint(_blockOpt, _makeTpl, _viewTpl, _makeOpt){

		/**
		 * make
		 * 生成编辑器相关html
		 * @param {Object} blockData 要生成得到block参数
		 */
		this.make = function(blockData){
			_extend(blockData, _blockOpt);
			_extend(blockData, defaultOpt);
			return makeTpl.render({html: _makeTpl.render($.extend(true, {}, blockData, _makeOpt)), blockData: blockData});
		};

		/**
		 * view
		 * 生成预览相关html
		 * @param {Object} blockData 要生成得到block参数
		 */
		this.view = function(blockData){
			_extend(blockData, _blockOpt);
			_extend(blockData, defaultOpt);
			return viewTpl.render({html: _viewTpl.render(blockData), blockData: blockData});
		};
		
	}

	return Blockprint;

});