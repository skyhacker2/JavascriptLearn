define(function(require, exports) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		mainTpl = require('./edit-button.tpl.html'),
		common = require('mod/template/common'),
		dialogMod = require('mod/template/dialog-main'),
		block,
		container,
		setter;

	function _encodeHtml(str) {
		return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/`/g, "&#96;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
	}

	var txtMan = {
		target: undefined,
		defaultValue: undefined,
		block: undefined,
		value: undefined,
		setter: undefined,
		init: function(dialog, block, setter){
			var that = this;
			
			this.block = block;
			this.target = $("button span", block.target);
			this.defaultValue = this.target.html();
			this.setter = setter;
			
			dialog.on('keyup', '#buttonText', function(event){
				var value = _encodeHtml(this.value);
				that.target.html(value);
				that.value =this.value;
			});
		},
		reset: function(){
			this.target.html(this.defaultValue);
		},
		update: function(){
			this.block[this.setter]({txt: this.value});
		}
	};

	var alignMan = {
		target: undefined,
		defaultValue: undefined,
		block: undefined,
		value: undefined,
		setter: undefined,
		init: function(dialog, block, setter){
			var that = this;

			this.block = block;
			this.target = $(".buttonContainer", block.target);
			this.defaultValue = this.target.css("text-align") || "center";
			this.setter = setter;

			rfl.Delegator.getDelegator(dialog).delegate('click', 'align', function(event, type){
				that.target.css("text-align", type);
	
				that.value = type;
			});
		},
		reset: function(){
			this.target.css("text-align", this.defaultValue);
		},
		update: function(){
			this.block[this.setter]({align: this.value});
		}
	};

	function checkLink(){
		var href = $.trim($("#buttonLink").val());

		if((/^https?:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]':+!]*([^<>\"\"])*$/).test(href)){
			return href;
		}else{
			return false;
		}
	}

	function _update(){
		var href;
		if(href = checkLink()){
			block[setter]({href: href});
		}else{
			var buttonLink = $("#buttonLink"),
				controller = buttonLink.closest(".control-group"),
				helper = $(".help-inline", controller);

			controller.addClass("error");
			helper.html("Please input a hyperlink for this button.");

			return;
		}

		txtMan.update();
		alignMan.update();

		dialogMod.clearHideCallback().hide();
		common.fixHeight();
	}

	function _hide(){
		dialogMod.hide();
	}

	function _reset(){
		txtMan.reset();
		alignMan.reset();
	}

	function _bind(dialog){
		container = $(".buttonContainer", block.target);
		setter = container.attr("data-setter");

		txtMan.init(dialog, block, setter);
		alignMan.init(dialog, block, setter);
	}

	function init(){
		dialogMod.create({
			title: "Edit Button", 
			content: mainTpl.render({blockData: block.data}),
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
		}, "editButton", function(){
			if(!checkLink()){
				block.remove().isEmpty(common.createHolder);
				common.fixHeight();
			}
			_reset();
		}).done(function(dialog){
			_bind(dialog);
		});
	}

	function show(_block){
		block = _block;

		init();

	}

	function hide(){

	}

	exports.show = show;

	exports.hide = hide;


});