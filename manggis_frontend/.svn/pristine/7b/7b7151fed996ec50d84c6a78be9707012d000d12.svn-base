define(function(require) {
	var currentTpl,
		tplList = {};
	
	/**
	 * get
	 * 得到指定ID的tpl，如果没有传参则获取当前tpl
	 * @param {Number} tplID tpl的ID
	 */
	function get(tplID){
		if(!tplID){
			return currentTpl;
		}
		return tplList[tplID];
	}

	/**
	 * set
	 * 设置指定ID对应的tpl
	 * @param {String | Number} tplID tpl的ID
	 * @param {Tpl} Tpl 指定的tpl
	 */
	function set(tplID, Tpl){
		return currentTpl = tplList[tplID] = Tpl;
	}

	function getAll(){
		var i, list = [];
		for(i in tplList){
			list.push(tplList[i])
		}

		if(list.length === 0){
			list = null;
		}
		
		return list;
	}

	return {
		set: set,
		get: get,
		getAll: getAll
	};
});