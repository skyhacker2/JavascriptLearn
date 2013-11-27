define(function(require) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		dropSelector = '.dropImage',
		editSelector = '.edit',
		context,
		common = require('mod/template/common'),
		editLock = require('mod/template/edit-lock'),
		tplPool = require('mod/template/tpl-pool'),
		linkTpl = require('./link.tpl.html'),
		formUtil = require('form-util'),
		dropFileSupported = 'File' in window && 'FormData' in window;

	// @private 绑定所有拖动事件监听
	function _addDropListener(dropSelector, context){

		$(context).on("dragenter", dropSelector, function(event){
			event.stopPropagation();
			event.preventDefault();
		}).on("dragover", dropSelector, function(event){
			var target = $(event.currentTarget);
			clearTimeout(target.data("timeout"));
			$(event.currentTarget).css("opacity", 0.6);

			event.stopPropagation();
			event.preventDefault();
		}).on("dragleave", dropSelector, function(event){
			var target = $(event.currentTarget);
			target.data("timeout", setTimeout(function(){
					target.css("opacity", 1);
				}, 20)
			);
			event.stopPropagation();
			event.preventDefault();
		}).on("drop", dropSelector, _handleDrop);
	}

	// @privatge 管理拖动的监听函数
	function _handleDrop(event){
		event.stopPropagation();
		event.preventDefault();

		var file, target = $(event.currentTarget),
			dataTransfer = event.originalEvent.dataTransfer;

		if((file = dataTransfer.getData("URL")) !== ""){
			if(file.indexOf("blob:") > -1){
				rfl.alerts.show('This File have not been uploaded.', {type: 'error', container: '#design-alert'});
			}else{
				uploaded(target, file);
			}
		}else{
			if(dataTransfer.files.length){
			
				file = dataTransfer.files[0],

				new DropUpload(target, file);
			}
		}

		target.css("opacity", 1);

	}

	/**
	 * showImage
	 * 显示图片
	 * @param {Element} imgContainer 图片包含器
	 * @param {String} url 图片地址
	 **/
	function showImage(imgContainer, url){
		var img = $("img", imgContainer),
			width = imgContainer.width();

		if(!img.length){
			img = document.createElement("img");

			img.onload = function(){
				//imgContainer.height(img.offsetHeight);

				common.fixHeight();

				img.onload = function(){
					imgContainer.height(img.offsetHeight);
					common.fixHeight();
				}
			}

			imgContainer.empty();
			imgContainer.append(img);
			imgContainer.append([
				'<p class="fix-btn" style="bottom:0px;width:',
				width,
				'px"><a class="btn btn-primary" href="javascript:void(0);"><i class="icon-cloud-upload"></i> Upload</a>&nbsp;&nbsp;<a href="javascript:void(0)" onclick="return false" class="edit">link</a></p><div class="progress progress-striped active" style="display:none;position:absolute;bottom:50px;height:20px;width:',
				width,
				'px"><div class="bar" style="width: 0%;"></div></div>'
			].join(""));
		}else{
			img = img[0];
		}

		img.onerror = _dealError;

		img.src = url;
		img.width = width;
	}

	// @private 处理图片错误，并生成对应的样子
	function _dealError(event){
		var target = $(event.target).closest('.dropImage');
		target.html('<div class="image"><i class="icon-frown icon-larger"></i><p>This url is not a picture. <br />Please check and upload again!</p><a class="btn btn-primary" href="javascript:void(0);"><i class="icon-cloud-upload"></i> Upload</a></div>');
		common.fixHeight();

		_set(target);
	}

	/**
	 * uploaded
	 * 更新的，并显示图片
	 * @param {Element} imgContainer 图片包含器
	 * @param {String} url 图片地址
	 */
	function uploaded(imgContainer, url){
		showImage(imgContainer, url);

		_set(imgContainer, url);
	}

	// @private 设置图片相关信息
	function _set(imgContainer, url, href){
		var setter = imgContainer.attr("data-setter"),
			width = imgContainer.width(),
			block = tplPool.get().getBlock(+imgContainer.closest('[data-tpl-type="block"]').attr("data-block-uid"));

		if(!href){
			block[setter]({src: url, width: width});
		}else{
			block[setter]({src: url, width: width, href: href});
		}
	}

	/**
	 * @class DropUpload
	 * 管理拖动及上传的类
	 */
	function DropUpload(target, file){
		if(!this.preFilter(target, file)){
			return;
		}

		this.target = target;
		this.file = file;
		this.blob = window.URL.createObjectURL(file);

		this.showImage && this.showImage(target, this.blob);
		this.bar = $('.bar', target);
		this.progress = $('.progress', target);
		this.progress.show();
		this.uploadImage(rfl.ajax.getDataTypeUrl(common.imgUploadAPI(), 'json'));
	}
	/**
	 * DropUpload.extend
	 * 扩展原型链
	 * @param {Object} opt 要扩展的方法包
	 */
	DropUpload.extend = function(opt){
		$.extend(DropUpload.prototype, opt);
	}
	DropUpload.prototype = {
		constructor: DropUpload,

		/**
		 * uploadImage
		 * 更新图片
		 * @param {String} 
		 */
		uploadImage: function(url){
			var form = new FormData(),
				xhr = new XMLHttpRequest(),
				that = this;

			form.append("imgFile", this.file);
			xhr.onload = function(){
				var res;
				if('JSON' in window){
					res = JSON.parse(xhr.responseText);
				}else{
					res = eval('(' + xhr.responseText + ')');
				}
				that.onLoad(res);
				
			};
			xhr.onerror = function(){
				that.onError();
			};
			xhr.loadend = function(){
				that.onStop();
			};
			if(xhr.upload){
				xhr.upload.onprogress = function(evt) {
					that.onProgress(Math.min(parseInt(evt.loaded / evt.total * 100), 100));
				};
			}
			xhr.open('post', url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.withCredentials = true;
			xhr.send(form);
		},

		onLoad: function(res){
		},

		onError: function(){
		},

		onStop: function(){
		},

		onProgress: function(progress){
		},

		destroy: function(){

		}
	}
	DropUpload.extend({
		/**
		 * preFilter
		 * 前过滤
		 * @param {Element} target 触发元素
		 * @param {String} file 文件路径
		 */
		preFilter: function(target, file){
			var fileName = file.name,
				fileExtName = fileName.split('.').pop();
			if(fileExtName == fileName){
				fileExtName = '';
			}else{
				fileExtName = '.' + fileExtName;
			}
			fileExtName = fileExtName.toLowerCase();
			if(!({'.png': 1, '.gif': 1, '.jpg': 1, '.jpeg': 1})[fileExtName]){
				rfl.alerts.show('You can only upload png, gif and jpg file.', {type: 'error', container: '#design-alert'});
				return false;
			}

			return true;
		},
		showImage: showImage,
		onLoad: function(res){
			if(res.code === 0){
				uploaded(this.target, res.data.url);
			}else{
				rfl.alerts.show(res.message, {type: 'error', container: '#design-alert'});
			}
			var that = this;
			setTimeout(function(){
				that.bar.css('width', '0%');
				that.progress.hide();
			}, 500);
		},
		onProgress: function(progress){
			this.bar.css('width', progress + '%');
		}
	});

	// @private 绑定按键事件
	function _bindClick(){
		$(context).on('click', dropSelector, function(event){
			if(editLock.isLock()){
				return;
			}
			require(['./picture-main'], function(mod) {
				var target = $(event.target).closest(dropSelector);
				mod.show(target, uploaded);
			});
		}).on('mouseover', dropSelector, function(event){
			if(editLock.isLock()){
				return;
			}
			var target = $(event.target).closest(dropSelector),
				width = target.width(),
				offset = target.offset(),
				frameOffset = $(common.getFrame()).offset();

			$('#width-tip').html(width + "px wide × any height").css("top", offset.top + frameOffset.top).css("left", offset.left + frameOffset.left + width - 180).show();
			
		}).on('click', editSelector, function(event){
			if(editLock.isLock()){
				return;
			}
			event.stopPropagation();
			event.preventDefault();

			var target = $(event.target),
				imgContainer = target.closest('.dropImage'),
				url = $("img", imgContainer).attr('src');

			if(!target.data('popover')){
				target.popover({
					animation: true,
					placement: "top",
					html: true,
					content: linkTpl.render()
				}).popover('show');

				var tip = target.data('popover').$tip,
					linkInput = $("#link-href", tip),
					value;

				linkInput.focus();

				function _setHref(){
					var valid = formUtil.validateOne(linkInput);
					if(valid.passed){
						var href = linkInput.val();
						imgContainer.attr('data-href', href);
						_set(imgContainer, url, href);
						target.popover('hide').popover('destroy');
					}else{
						formUtil.focus('#link-href');
						rfl.alerts.show('This is not a url.', {container: '#design-alert', type: 'error'});
					}
				}

				if(value = imgContainer.attr('data-href')){
					linkInput.val(value);
				}

				tip.on('click', function(event){
					event.stopPropagation();
					event.preventDefault();
				}).on('click', '#link-submit', function(event){
					_setHref();
				}).on('click', '.icon-remove', function(event){
					target.popover('hide').popover('destroy');
				});

				linkInput.on('keydown', function(event){
					if(event.which === 13){
						_setHref();
					}
				})
			}else{
				target.popover('hide').popover('destroy');
			}
		});
		/*.on('click', editSelector, function(event){
			if(editLock.isLock()){
				return;
			}
			event.stopPropagation();
			event.preventDefault();

			require(['./edit-picture-main'], function(mod){
				var target = $(event.target).closest(dropSelector);
				mod.show(target, common.fixHeight);
			});
		});*/
		
	}

	/**
	 * init
	 * 初始化
	 * @param {Element} 需要初始化的Document
	 */
	function init(_context){
		_context = _context || common.getContext();

		if($(_context).data("pic-mod-has-init")){
			return;
		}

		$(_context).data("pic-mod-has-init", true);	// 防止已被init的context再次被init

		context = _context || document;

		if(dropFileSupported){
			_addDropListener(dropSelector, context);
		}
		_bindClick();

	}

	return {
		init: init
	};

});