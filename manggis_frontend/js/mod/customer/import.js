define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var FileUploader = require('file-uploader');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var mainTpl = require('./import.tpl.html');

	var _listId = '';
	var _groupIds = '';
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'xxx', function(evt) {
		}, 1);
		_bindEvent = rfl.empty;
	};

	function _initUploader(type) {
		var container = $('#file-drop-area-' + type);
		new FileUploader(container, {
			enableDropFile: true,
			enableMultipleSelection: false,
			fileParamName: 'dataFile',
			onBeforeUpload: function(uploading, callback) {
				var fileExtName = uploading.fileExtName.toLowerCase();
				if(type == 'csv') {
					if(fileExtName != '.csv') {
						rfl.alerts.show('Please select a CSV file.', 'error');
						callback(false);
						return;
					}
					if(uploading.fileSize > 1024 * 1024 * 50) {
						rfl.alerts.show('The max size of CSV file supported is 50MB.', 'error');
						callback(false);
						return;
					}
				} else {
					if(fileExtName != '.xls' && fileExtName != '.xlsx') {
						rfl.alerts.show('Please select an Excel file.', 'error');
						callback(false);
						return;
					}
					if(uploading.fileSize > 1024 * 1024 * 10) {
						rfl.alerts.show('The max size of Excel file supported is 10MB.', 'error');
						callback(false);
						return;
					}
				}
				rfl.ajax.getUploadOpt('lists/' + _listId + '/import/customers', uploading.from == 'DROP' ? 'json' : 'xhtml', function(opt) {
					$('#file-drop').hide();
					$('#progress-bar').show();
					callback(opt);
					rfl.ajax.showLoading();
				});
			},
			onDragenter: function() {
				container.addClass('drop-enter theme-background');
			},
			onDragleave: function() {
				container.removeClass('drop-enter theme-background');
			},
			onDrop: function() {
				container.removeClass('drop-enter theme-background');
			},
			onProgress: function(uploading, progress) {
				progress = Math.min(progress, 99);
				$('#progress-bar .progress-text').html(progress + '%');
				$('#progress-bar .progress-bar').css('width', progress + '%');
			},
			onLoad: function(uploading, res) {
				if(!rfl.ajax.dealCommonCode(res.code)) {
					if(res.code === 0) {
						$('#progress-bar .progress-text').html('100%');
						$('#progress-bar .progress-bar').css('width', '100%');
						location.hash = '!' + _listId + '/match-column/' + res.data.sid + '/' + (_groupIds || '');
					} else {
						$('#progress-bar').hide();
						$('#file-drop').show();
						$('#progress-bar .progress-text').html('0%');
						$('#progress-bar .progress-bar').css('width', '0%');
						rfl.alerts.show(res.message, 'error');
					}
				} else {
					$('#progress-bar').hide();
					$('#file-drop').show();
					$('#progress-bar .progress-text').html('0%');
					$('#progress-bar .progress-bar').css('width', '0%');
				}
			},
			onError: function(uploading) {
				$('#progress-bar').hide();
				$('#file-drop').show();
				rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
			},
			onComplete: function(uploading) {
				rfl.ajax.hideLoading();
			}
		});
	};
	
	function _render(mark, listId, step, sid, groupIds) {
		if(!listId) {
			rfl.ui.renderInvalidUrl('#main-div');
			return;
		}
		_listId = G.listId = listId;
		_groupIds = groupIds;
		if(step) {
			require(['./import-' + step + '-main'], function(mod) {
				mod.render();
			}, function() {
				rfl.ui.renderPageLoadError('#main-div');
			});
		} else {
			$('#main-div').html(mainTpl.render({
				listId: listId,
				lang: {common: langResourceCommon, customer: langResourceCustomer},
				dropFileSupported: FileUploader.dropFileSupported
			}));
			formUtil.initPlaceHolder('#customers-input');
			_initUploader('csv');
			_initUploader('excel');
		}
	};
	
	function render() {
		if(arguments.length) {
			_render.apply(null, rfl.array.getArray(arguments));
		} else {
			//a refresh call, get current status from mark
			rfl.ajax.history.dispatch(function() {
				_render.apply(null, rfl.array.getArray(arguments));
			});
		}
	};
	
	function init() {
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		_bindEvent();
		rfl.ajax.history.init(5, render);
	};
	
	return {
		render: render,
		init: init
	};
});