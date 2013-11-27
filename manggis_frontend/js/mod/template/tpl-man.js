// 对外包，用于管理tpl
define(function(require) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		_Tpl = require('./Tpl'),
		tplPool = require('./tpl-pool');

	// @private 将tpl转成data
	function _tpl2Data(tpl){
		var p, obj = {};
		for(p in {tplID: true, describe: true, structure: true, background: true}){
			obj[p] = tpl[p]
		}
		return obj;
	}
	
	function _getAsny(tplID, callback ,fail){

		require(['../../../template/' + tplID + '.tpl'], function(data){
			// 预先深复制避免污染
			data = $.extend(true, {}, data);
			currentTpl = new _Tpl(data);
			currentTpl.init(callback);

			tplPool.set(tplID, currentTpl);
		}, fail);
		return true;
	}

	/**
	 * get
	 * 对外的获取tpl接口
	 * @param {String | Number} tplID tpl的ID
	 * @param {Function} callback 成功回调函数
	 * @param {Function} fail 失败回调函数
	 * @param {Boolean | 1} isRegain 是否是恢复操作
	 */
	function get(tplID, callback, fail, isRegain){
		var currentTpl, data;
		if(isRegain){
			if(currentTpl = tplPool.get(tplID)){
				data = _tpl2Data(currentTpl);
			}else{
				return _getAsny(tplID, callback, fail);
			}	
		}else{
			// 得到已有的tpl并删除
			if(currentTpl = tplPool.get(tplID)){
				data = $.extend(true, {}, require('../../../template/' + tplID + '.tpl'));
			// 没有原来的tpl数据则读取后生成
			}else{
				return _getAsny(tplID, callback, fail);
			}
		}

		// 如果是恢复或者是已有该tplID的数据
		currentTpl.destroy(); // 清空原来的tpl
		currentTpl = new _Tpl(data);
		tplPool.set(tplID, currentTpl);

		currentTpl.init(callback);

		return currentTpl;
	}

	function set(tplID, data){
		return tplPool.set(tplID, new _Tpl(data));
	}

	/**
	 * update
	 * 得到当前的数据包
	 * @param {Tpl} (Tpl) 需要获取的模板，不存在则换取当前模板
	 */
	function update(Tpl){
		Tpl = Tpl || tplPool.get();

		var obj = _tpl2Data(Tpl);

		return (rfl.json.stringify(obj, true, 5)); // result
	}

	function html(Tpl){
		Tpl = Tpl || tplPool.get();

		return Tpl.view();
	}

	return {
		get: get,
		set: set,
		getAll: tplPool.getAll,
		update: update,
		html: html
	};
});