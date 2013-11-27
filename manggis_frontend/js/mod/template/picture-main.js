define(function(require, exports) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var mainTpl = require('./picture.tpl.html');
	var FileUploader = require('file-uploader');
	var formUtil = require('form-util');
	var common = require('mod/template/common');

	var dropFileSupported = 'File' in window && 'FormData' in window;

	var _dialog,
		_target,
		_uploaded,
		_url;

	function _update(){
		var value = $('#url-input', _dialog).val();
		if(value !== ""){
			var valid = formUtil.validateOne('#url-input');
			if(valid.passed){
				_uploaded(_target, value);
				_hide();
			}else{
				formUtil.focus('#url-input');
				rfl.alerts.show('This is not a url.', {container: '#myalert', type: 'error'});
			}
		}else if(_url){
			_uploaded(_target, _url);
			_url = undefined;
			_hide();
		}else{
			rfl.alerts.show('Please input a url.', {container: '#myalert', type: 'error'});
		}
	}

	function _hide() {
		if(_dialog) {
			_dialog.modal('hide');
			_dialog = null;
			rfl.ajax.history.off('change', _hide);
		}
	}

	exports.show = function(target, uploaded) {
		_target = target;
		_uploaded = uploaded;

		rfl.ajax.history.on('change', _hide);

		require(['lang/' + G.LANG + '/common', 'lang/' + G.LANG + '/login'], function(langResourceCommon, langResourceLogin) {
			_hide();
			_dialog = rfl.dialog.create({
				title: "Upload Picture",//langResourceLogin.label.changePwd,
				content: mainTpl.render(),
				btns: [
					{
						text: langResourceCommon.label.update,
						className: 'btn-primary',
						click: _update
					},
					{
						text: langResourceCommon.label.cancel,
						dismiss: true
					}
				]
			});	

			new FileUploader($("#upload-file-button", _dialog), {
				enableDropFile: true,
				fileParamName: "imgFile",
				onBeforeUpload: function(uploading, callback) {
					var fileExtName = uploading.fileExtName.toLowerCase();
					if(fileExtName != '.png' && fileExtName != '.jpg' && fileExtName != '.jpeg' && fileExtName != '.gif') {
						rfl.alerts.show('You should upload a Image.', {type: 'error', container: '#myalert'});
						callback(false);
						return;
					}

					$('#progress-bar').show();
					callback({
						url: rfl.ajax.getDataTypeUrl(common.imgUploadAPI(), uploading.from == 'DROP' ? 'json' : 'xhtml'),
						data: {
							extraParam1: 1,
							extraParam2: 2
						}
					});
					rfl.ajax.showLoading();
				},
				onProgress: function(uploading, progress) {
					$('#progress-bar .progress-text').html(progress + '%');
					$('#progress-bar .bar').css('width', progress + '%');
				},
				onLoad: function(uploading, res) {
					if(!rfl.ajax.dealCommonCode(res.code)) {
						if(res.code === 0) {
							$('#progress-bar .progress-text').html('100%');
							$('#progress-bar .bar').css('width', '100%');
							_url = res.data.url;
							$('#previewImg', _dialog).html('<img src="' + res.data.url + '" />');
						} else {
							$('#progress-bar').hide();
							rfl.alerts.show(res.message, {type: 'error', container: '#myalert'});
						}
					} else {
						$('#progress-bar').hide();
					}
				},
				onError: function(uploading) {
					$('#progress-bar').hide();
					rfl.alerts.show(langResourceCommon.msg.serverBusy, {type: 'error', container: '#myalert'});
				},
				onComplete: function(uploading) {
					rfl.ajax.hideLoading();
					$('#progress-bar').hide();
				}
			});

		});
	};
});