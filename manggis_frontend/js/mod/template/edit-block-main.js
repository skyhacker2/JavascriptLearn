define(function(require, exports){
	var $ = require('jquery'),
		rfl = require('rfl'),
		mainTpl = require('./edit-block.tpl.html'),
		common = require('mod/template/common'),
		dialogMod = require('mod/template/dialog-main'),
		colorPicker = require('lib/color-picker/color-picker-main');

	rfl.css.load('js/lib/color-picker/color-picker-main.css');

	var _block;

	/**
	 * @private 更新配置
	 */
	function _update() {
		borderRadiusMan.update();
		marginMan.update();
		backgroundColorMan.update();
		dialogMod.clearHideCallback().hide();
		common.fixHeight();
	}

	/**
	 * @private 隐藏dialog
	 */
	function _hide() {
		dialogMod.hide();
	}


	// http://www.cnblogs.com/rubylouvre/archive/2011/12/24/2299860.html
	var DONT_ENUM =  "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(","),
		hasOwn = ({}).hasOwnProperty;
		
	for (var i in {
		toString: 1
	}){
		DONT_ENUM = false;
	}

	Object.keys = Object.keys || function(obj){ // ecma262v5 15.2.3.14
		var result = [];
		for(var key in obj ) if(hasOwn.call(obj,key)){
			result.push(key)
		}
		if(DONT_ENUM && obj){
			for(var i = 0 ;key = DONT_ENUM[i++]; ){
				if(hasOwn.call(obj,key)){
					result.push(key);
				}
			}
		}
		return result;
	};

	var rnum = /\d+/g;

	/**
	 * @class MultiValue
	 * @param {Object} map 对应的map Object
	 * @param {String} multiInput 需要进行该操作的css名
	 */
	function MultiValue(map, multiInput){
		this.defaultValue = undefined,
		this.target = undefined,
		this.cache = undefined,
		this.map = map,
		this.arrMap = Object.keys(map);
		this.multiInput = multiInput;
	}
	MultiValue.prototype = {
		constructor: MultiValue,

		/**
		 * init
		 * 初始化
		 * @param {jQuery DOM} dialog 指定的dialog
		 * @param {Block} block 指定的block  
		 */
		init: function(dialog, block){
			var i,
				map = this.arrMap,
				that = this;

			for(i = map.length; i--;){
				dialog.on("keydown", "#" + map[i], function(e){that.keydownListener.call(that, e)})
					  .on("blur", "#" + map[i], this.checkEmpty);
			}
			dialog.on("keydown", "#" + this.multiInput, function(e){that.keydownListeners.call(that, e)})
				  .on("blur", "#" + this.multiInput, this.checkEmpty);
			this.defaultValue = block.data[this.multiInput];
			this.target = block.target;
			this.cache = [];
			var defaultValue = this.defaultValue;
			for(var i = map.length; i--;){
				this.map[map[i]] = defaultValue[i].replace("px", "");
			}
		},

		/**
		 * checkEmpty
		 * 查看input框是否为空
		 */
		checkEmpty: function(event){
			if(this.value === ""){
				this.value = 0;
			}
		},

		/**
		 * keydownListener
		 * 按键过滤及监听
		 * @param {Event} event 事件
		 */
		keydownListener: function(event){
			var id = event.currentTarget.id,
				value = event.which - 48,
				that = this;

			if((value >= 0 && value <= 9) || (value === -40) || (value === -39) || (value >=48 && value <= 57)){
				setTimeout(function(){
					var value = event.currentTarget.value;
					(value === "") && (value = "0");
					that.input(id, value);
				}, 50);
				return;
			}

			event.preventDefault();
		},

		/**
		 * keydownListeners
		 * 按键过滤及监听
		 * @param {Event} event 事件
		 */
		keydownListeners: function(event){
			var that = this;

			setTimeout(function(){
				var value = event.currentTarget.value;
				(value === "") && (value = "0");
				that.inputMulti(value);
			}, 50);
		},

		/**
		 * input
		 * 输入值
		 * @param {String} id 改变对应的id
		 * @param {String} value 得到的值
		 */
		input: function(id, value){
			this.map[id] = value;
			this.setMulti();
			this.setCss();
		},

		/**
		 * inputMulti
		 * 联合输入值
		 * @param {String} value 得到的值
		 */
		inputMulti: function(value){
			var split = value.match(rnum),
				map = this.map,
				i = 0,
				p,
				value;

			if(!split){
				return;
			}else if(+split[0] + "" === value){
				value = split[0];
				for(p in map){
					map[p] = value;
					$("#" + p).val(value);
				}

				this.setMulti(true);
				this.setCss();
			}else if(split.length === 4){
				for(p in map){
					value = split[i++]
					map[p] = value;
					$("#" + p).val(value);
				}
				this.cache = split;

				$("#" + this.multiInput).val(split.join(" "));
				this.setCss();
			}
		},

		/**
		 * check
		 * 检查数组值是否一致，并否会对应值
		 * @param {Array} array 需要检测的数组
		 */
		check: _check,

		/**
		 * setMulti
		 * 设置multi input的内容
		 * @param {Boolean} prevent 是否阻止设置input框内容
		 */
		setMulti: function(prevent){
			var i,
				tmp = this.arrMap,
				len = tmp.length,
				cache = this.cache,
				map = this.map;
			for(i = 0; i < len; i++){
				cache[i] = map[tmp[i]];
			}

			prevent || $("#" + this.multiInput).val(this.check(cache));
		},

		/**
		 * setCss
		 * 设置css属性
		 */
		setCss: function(){
			var cache = this.cache,
				result = [];

			for(var i = cache.length; i--;){
				result[i] = cache[i] + "px";
			}

			this.target.css(this.multiInput, result.join(" "));
		},

		/**
		 * update
		 * 更新
		 */
		update: function(){
			for(var i = this.cache.length; i--;){
				this.defaultValue[i] = this.cache[i] + "px";
			}
		},

		/**
		 * reset
		 * 重置
		 */
		reset: function(){
			this.target.css(this.multiInput, this.defaultValue.join(" "));
		}

	};

	var borderRadiusMan = new MultiValue({
		borderRadius0: "",
		borderRadius1: "",
		borderRadius2: "",
		borderRadius3: ""
	}, "borderRadius");

	var marginMan = new MultiValue({
		margin0: "",
		margin1: "",
		margin2: "",
		margin3: ""
	}, "margin");

	/**
	 * @Object backgroundColorMan
	 * 背景颜色管理器
	 */
	var backgroundColorMan = {
		blockData: undefined,
		backgroundColor: undefined,
		bgDefault: undefined,
		target: undefined,
		/**
		 * init
		 * 初始化
		 * @param {jQuery DOM} dialog 绑定的dialog
		 * @param {Block} block 指定的block
		 */
		init: function(dialog, block){
			var colorInput,
				that = this,
				backgroundColor = $("#backgroundColor");

			$('#backgroundColor').simpleColorPicker({onChangeColor: function(){
				var ele = this[0];
				that.keydownListener.call(ele);
			}}, dialog);
			dialog.on("change", "#backgroundColor", this.keydownListener);

			this.blockData = block.data;
			this.bgDefault = block.data.background;
			this.backgroundColor = this.bgDefault;
			this.target = block.target;

		},

		/**
		 * checkSupport
		 * 查看input color支持情况，目前无用
		 */
		checkSupport: function(){
			var colorInput = document.createElement("input");
			colorInput.setAttribute("type", "color");
			if(colorInput === "text"){
				colorInput = null;
				return false;
			}else{
				return colorInput;
			}
		},

		/**
		 * keydownListener
		 * 绑定按键
		 * @param {Event} event 事件
		 */
		keydownListener: function(event){
			backgroundColorMan.input(this.value);
		},
		/**
		 * input
		 * 输入值
		 * @param {String} value 值 
		 */
		input: function(value){
			this.backgroundColor = value;
			$("#backgroundColorShow").css("background", value);

			this.setbackgroundColor();
		},
		/**
		 * setbackgroundColor
		 * 设置背景颜色
		 */
		setbackgroundColor: function(){
			if(this.backgroundColor.length === 1){
				this.target.css("background", this.bgDefault);
			}else{

				this.target.css("background", this.backgroundColor);
			}
		},
		/**
		 * update
		 * 更新
		 */
		update: function(){
			this.blockData.background = this.backgroundColor;
		},
		/**
		 * reset
		 * 重置
		 */
		reset: function(){
			this.target.css("background", this.blockData.background);
		}
	};

	/**
	 * @private 绑定事件
	 */
	function _bind(dialog){
		borderRadiusMan.init(dialog, _block);
		marginMan.init(dialog, _block);
		backgroundColorMan.init(dialog, _block);
	}

	/**
	 * @private 检查数组
	 */
	function _check(array){
		var i = array.length,
			value = array[i - 1];
		for(; i--;){
			if(array[i] !== value){
				return array.join(" ").replace(/px/g, "");
			}
		}

		return value.replace("px", "");
	}

	/**
	 * show
	 * 显示dialog
	 * @param {Block} block 指定的block
	 */
	exports.show = function(block) {
		_block = block;

		dialogMod.create({
			title: "Edit Block", 
			content: mainTpl.render({blockData: block.data, check: _check}),
			btns: [
					{
						text: "OK",
						className: 'btn-primary',
						click: _update
					},
					{
						text: "Cancel",
						click: _hide
					}
				]
		}, "editBlock", function(){
			borderRadiusMan.reset();
			marginMan.reset();
			backgroundColorMan.reset();
		}).done(function(dialog){
			_bind(dialog);
		});

	};
});