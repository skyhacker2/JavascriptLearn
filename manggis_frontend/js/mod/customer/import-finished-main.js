define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require('lang/{{G.LANG}}/common');
	var langResourceCustomer = require('lang/{{G.LANG}}/customer');
	var langResourceCustomerImport = require('lang/{{G.LANG}}/customer-import');
	var mainTpl = require('./import-finished.tpl.html');
	var progressTpl = require('./import-finished-progress.tpl.html');
	var notifyEmailTpl = require('./import-finished-notify-email.tpl.html');

	var _INIT_UPDATE_INTERVAL = 3000;
	var _UP_INTERVAL = 5000;

	var _updateInterval = _INIT_UPDATE_INTERVAL;
	var _latestProgress = -1;

	var _startTime = null;
	var _listId = '';
	var _jobId = '';
	var _emailAc = null;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'importMoreCustomer', function(evt) {
			rfl.ajax.history.dispatch(function(mark, listId, step, jobId, from) {
				rfl.util.gotoUrl('customer/import#!' + listId);
			});
		}, 1).delegate('click', 'confirmNotifyEmails', function(evt) {
			require(['form-util'], function(formUtil) {
				formUtil.setCommonMsg(langResourceCommon.msg.validator);
				var valid = formUtil.validateOne('#send-notification-emails');
				if(valid.passed) {
					rfl.ajax.post({
						url: 'lists/jobs/' + _jobId + '/notifyEmails',
						data: {
							emails: valid.data
						},
						success: function(res) {
							if(res.code === 0) {
								$('#import-email-notify').html(notifyEmailTpl.render({notifyEmails: valid.data}));
								$.each(valid.data, function(i, email) {
									rfl.util.unshiftLocalStoredList('NOTIFY_EMAIL_LIST', email);
								});
							} else {
								rfl.alerts.show(res.message, 'error');
							}
						},
						error: function() {
							rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
						}
					});
				}
			});
		}, 1);
		_bindEvent = rfl.empty;
	};

	function _showEmailNotification() {
		rfl.ajax.get({
			url: 'lists/jobs/' + _jobId + '/notifyEmails',
			success: function(res) {
				if(res.code === 0) {
					if(res.data.emails.length) {
						$('#import-email-notify').html(notifyEmailTpl.render({notifyEmails: res.data.emails}));
					} else {
						var emailList = rfl.util.getLocalStoredList('NOTIFY_EMAIL_LIST');
						var emailBox = $('#send-notification-emails')
						if(emailList.length) {
							emailBox.val(emailList[0] && emailList[0] + '; ' || '');
							if(emailList.length > 1) {
								require(['auto-complete'], function(AutoComplete) {
									_emailAc = new AutoComplete(emailBox, {
										freeInput: true,
										dataSource: emailList,
										listStyle: {width: 340},
										onBeforeSelect: function(item) {
											if(new RegExp('(^|;|,)\\s*' + item.replace(/\./g, '\\.') + '\\s*(;|,|$)').test(emailBox.val())) {
												_emailAc.hideList();
												return false;
											}
										},
										getStdItem: function(item) {
											return {id: item, name: item};
										}
									});
								});
							}
						}
					}
					$('#import-email-notify').slideDown();
					_showEmailNotification = rfl.empty;
				}
			},
			error: function() {
			}
		});
	};
	
	function _render(data) {
		$('#main-div').html(mainTpl.render({
			listId: _listId,
			leftTime: 0,
			notifyEmails: [],
			data: data
		}));
	};

	function _renderInprogress() {
		_render({
			status: 'inprogress',
			progress: '0'
		});
		_renderInprogress = rfl.empty;
	};

	function _updateProgress() {
		rfl.ajax.get({
			url: 'lists/jobs/' + _jobId,
			data: {},
			success: function(res) {
				var now = new Date();
				if(res.code === 0) {
					if(res.data.status == 'inprogress') {
						_renderInprogress();
						if(_latestProgress == res.data.progress) {
							_updateInterval += _UP_INTERVAL;
						} else {
							_updateInterval = _INIT_UPDATE_INTERVAL;
						}
						_latestProgress = res.data.progress;
						setTimeout(function() {
							_updateProgress();
						}, _updateInterval);
						$('#import-progress').html(progressTpl.render({
							leftTime: res.data.progress > 0 ? (now - _startTime) * (100 - res.data.progress) / res.data.progress : 0,
							data: res.data
						}));
						if(now - _startTime - 2000 >= _INIT_UPDATE_INTERVAL && res.data.progress < 90) {
							_showEmailNotification();
						}
					} else {
						_render(res.data);
						require(['./import-choose-to-merge-main'], function(mod) {
							mod.init(res.data.info.issues);
						});
					}
				} else {
					if(res.code === rfl.config.RES_CODE.RESOURCE_NOT_EXIST) {
						rfl.ui.renderInvalidUrl('#main-div');
					} else {
						rfl.ui.renderPageLoadError('#main-div');
					}
				}
			},
			error: function() {
				rfl.ui.renderPageLoadError('#main-div');
			}
		});
	};
	
	function render() {
		rfl.ajax.history.dispatch(function(mark, listId, step, jobId) {
			if(step != 'finished') {
				return;
			}
			_startTime = new Date() - 2000;
			_listId = listId;
			_jobId = jobId;
			_bindEvent();
			_updateProgress();
		});
	};
	
	return {
		render: render
	};
});