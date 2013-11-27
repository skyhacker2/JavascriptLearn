// 对外包，用于初始化
define(function(require) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		tplMan = require("./tpl-man"),
		common = require('./common'),
		editLock = require('./edit-lock'),
		toolMod = require('./tool'),
		tplPool = require('mod/template/tpl-pool'),
		colorPicker = require('lib/color-picker/color-picker-main'), // 现在依赖这一东东
		frame;

	// 作为一个临时方案，将backgroundColorMan暂时放在这里
	var backgroundColorMan = {
		tpl: undefined,
		backgroundColor: undefined,
		bgDefault: undefined,
		target: undefined,
		init: function(dialog, tpl){
			var colorInput,
				that = this,
				backgroundColor = $("#tpl-backgroundColor2");

			backgroundColor.simpleColorPicker({
				onChangeColor: function(){
					var ele = this[0];
					that.keydownListener.call(ele);
				},
				onShow: function(){
					require('mod/template/tool').hide();
				}
			}, dialog);
			dialog.on("change", "#tpl-backgroundColor2", this.keydownListener);

			this.tpl = tpl;
			
			this.bgDefault = tpl.background || (tpl.background = "#ffffff");
			$('#tpl-backgroundColor2').val(this.bgDefault);
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

	rfl.css.load('js/lib/color-picker/color-picker-main.css');

	function _PrepareChecker(checkList, callback){
		var checkCache = {};
		for(var i = checkList.length; i--;){
			checkCache[checkList[i]] = false;
		}
		this.checkList = checkCache;
		this.callback = callback;
		this.args = [];
		this.allDone = false;
	}
	_PrepareChecker.prototype.hasDone = function(something, args){
		if(args){
			this.args = args;
		}
		if(this.allDone){
			this.callback.apply(window, this.args);
			return;
		}
		var checkList = this.checkList,
			i;
		if(!checkList[something]){
			checkList[something] = true;
		}
		for(i in checkList){
			if(!checkList[i]){
				return;
			}
		}
		this.allDone = true;
		this.callback.apply(window, this.args);
	};

	function _inlineAll(){
		setTimeout(function(){
			if(frame.contentWindow.CKEDITOR){
				frame.contentWindow.CKEDITOR.inlineAll();
			}else{
				_inlineAll();
			}
		}, 100);
	}

	/**
	 *	init all mod
	 */
	function _initFrame(tplID, fail, isRegain){

		var prepareChecker = new _PrepareChecker(["frame", "tplMan"], function(tpl){
			$("#container", frame.contentDocument).html(tpl.make());
			tpl.background && ($("#design-div", frame.contentDocument.body).css("background", tpl.background));
			tpl.padding && ($("#container", frame.contentDocument.body).css("padding", tpl.padding));
			tpl.border && ($("#container", frame.contentDocument.body).css("border", tpl.border));

			frame.contentWindow.fixHeight();
			_inlineAll();
			toolMod.init(frame);
			backgroundColorMan.init($(document), tpl);
			prepareChecker = null;
		});

		frame = G.id("containFrame");

		frame.onload = function(){
			prepareChecker.hasDone("frame");
			frame.onload = function(){};
		}

		frame.src = "html/template/loader-" + G.LANG + ".html";

		return tplMan.get(tplID, function(tpl){
			prepareChecker.hasDone("tplMan", [tpl]);
		}, fail, isRegain);
		
	}

	function _initPreview(){

		rfl.Delegator.getPageDelegator().delegate('click', 'preview', function(){
			rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid){
				var urlParams = rfl.pageStorage.get().urlParams;
				require(['../campaign/preview-main'], function(previewMod){
					previewMod.init(urlParams.listId, sid, {
						content: tplMan.html(),
						errorCallback: function(string){
							rfl.alerts.show(string, {type: 'error', container: '#design-alert'});
						}
					});
				});
			});
		}).delegate('click', 'send-sample', function(){	// 未来需要对这里解耦
			rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid){
				require(['../campaign/sample-sender-main'], function(sender) {
					var code = tplMan.html(), 
						pageData;
					if(code){
						pageData = rfl.pageStorage.get();
						return sender.show(pageData.urlParams.listId, sid, code);
					}
				});
			});
		});
	}

	function _initSet(){
		rfl.Delegator.getPageDelegator().delegate('click', 'setTpl', function(){
			require(['./set-tpl-main'], function(setTpl){
				toolMod.hide();
				setTpl.show();
			});
		});
	}

	/**
	 *	public manner
	 */
	function init(tplID, fail, isRegain){
		if(_initFrame(tplID, fail, isRegain)){
			_initPreview();
			_initSet();
		}
	}

	/**
	 *	reset
	 */
	function reset(){
		common.reset();
	}

	return {
		// 初始化
		init: init,
		reset: reset,
		update: tplMan.update,
		getAllTpl: tplMan.getAll,
		html: tplMan.html,
		set: tplMan.set,
		initAPI: common.imgUploadAPI
	};

});