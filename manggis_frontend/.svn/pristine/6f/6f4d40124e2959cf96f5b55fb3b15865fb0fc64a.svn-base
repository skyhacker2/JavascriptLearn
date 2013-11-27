define(function(require) {
	var _isLock = false,
		lockLevel = 0;

	/**
	 * lock
	 * 锁住编辑器
	 * @param {Object} opt 参数
	 * @param {Boolean} opt.hide 是否对编辑器进行隐藏
	 * @param {Number} opt.level 优先权级
	 */
	function lock(opt){
		opt = opt || {};

		var hide = opt.hide,
			level = opt.level || 0;

		if(level >= lockLevel){
			lockLevel = level;

			if(hide){
				require(['./tool'], function(tool){
					tool.hide();
				});
			}

			_isLock = true;
		}
	}

	/**
	 * unlock
	 * 解锁编辑器
	 * @param {Object} opt 参数
	 * @param {Boolean} opt.show 是否对编辑器进行显示
	 * @param {Number} opt.level 优先权级
	 */
	function unlock(opt){
		opt = opt || {};

		var show = opt.show,
			level = opt.level || 0;

		if(level >= lockLevel){
			if(show){
				require(['./tool'], function(tool){
					tool.show();
				});
			}

			lockLevel = 0;
			_isLock = false;
		}
	}

	/**
	 * isLock
	 * 是否加锁
	 * @returns {Boolean} isLock
	 */
	function isLock(){
		return _isLock;
	}

	return {
		lock: lock,
		unlock: unlock,
		isLock: isLock
	};

});