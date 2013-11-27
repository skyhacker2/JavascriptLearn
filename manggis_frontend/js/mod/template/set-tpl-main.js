define(function(require, exports){
	var $ = require('jquery'),
		rfl = require('rfl'),
		//mainTpl = require('./set-tpl.tpl.html'),
		common = require('mod/template/common'),
		//dialogMod = require('mod/template/dialog-main'),
		tplPool = require('mod/template/tpl-pool'),
		colorPicker = require('lib/color-picker/color-picker-main');

	rfl.css.load('js/lib/color-picker/color-picker-main.css');

	function _update() {
		backgroundColorMan.update();

		dialogMod.clearHideCallback().hide();
	}

	function _hide(){
		dialogMod.hide();
	}

	function _init(){
		$('#showBackgroundColor').hide();
		$('#tpl-backgroundColor').show();
		backgroundColorMan.init($(document), tplPool.get());
	}

	var backgroundColorMan = {
		tpl: undefined,
		backgroundColor: undefined,
		bgDefault: undefined,
		target: undefined,
		init: function(dialog, tpl){
			var colorInput,
				that = this,
				backgroundColor = $("#tpl-backgroundColor");

			backgroundColor.simpleColorPicker({
				onChangeColor: function(){
					var ele = this[0];
					that.keydownListener.call(ele);
				},
				onShow: function(){
					require('mod/template/tool').hide();
				}
			}, dialog);
			dialog.on("change", "#backgroundColor", this.keydownListener);

			this.tpl = tpl;
			this.bgDefault = tpl.background || (tpl.background = "#ffffff");
			this.backgroundColor = this.bgDefault;
			this.target = $("#design-div", common.getFrame().contentDocument.body);
		},
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
		keydownListener: function(event){
			backgroundColorMan.input(this.value);
		},
		input: function(value){
			this.backgroundColor = value;

			this.update();	//直接update

			this.setbackgroundColor();
		},
		setbackgroundColor: function(){
			if(this.backgroundColor.length === 0){
				this.target.css("background", this.bgDefault);
			}else{
				this.target.css("background", this.backgroundColor);
			}
		},
		update: function(){
			this.tpl.background = this.backgroundColor;
		},
		reset: function(){
			this.target.css("background", this.bgDefault);
		}
	};	

	exports.show = function(){
		_init();
	};
});