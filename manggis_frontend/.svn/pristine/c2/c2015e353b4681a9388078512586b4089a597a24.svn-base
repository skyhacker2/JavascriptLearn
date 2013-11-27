define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var mainTpl = require('./forward-email.tpl.html');
	var AutoComplete = require('auto-complete');
	var formUtil = require('form-util');
	var langResourceCommon = require("../../lang/" + G.LANG + "/common");
	var domains = require("./domains/" + G.LANG);

	var dataSource = [];
	var _autoComplete;

	function _getInfo(params) {
		if (!(params.messageId)) {
			rfl.ui.renderInvalidUrl('#main-div');
			return;
		}


		rfl.ajax.get({
			url: 'forward/' + params.messageId + "?original=" + params.original,
			success: function (res) {
				if (res.code === 0) {
					$('#fromEmail').html(res.data.email);
					$('#subject').html("FW: " + res.data.subject);
				} else {
					rfl.ui.renderInvalidUrl('#main-div');
				}
			},
			error: function (res) {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, {type: "error", container: "#myalert"});
			}	
		});
	}

	function _bindEvent(params) {

		_autoComplete = new AutoComplete('#toEmail', {
			freeInput: true,
			dataSource: dataSource,
			onKeyup: function (evt) {
				if (evt.keyCode === 40 && !_autoComplete.isListShown()) {
					return _autoComplete.showFullList(true);
				}
				var value = this.value.split(';'),
					length = value.length;
				value = $.trim(value[length - 1]);
				if (value !== "") {
					length = value.length;
					(value.indexOf('@') === length - 1) && (value = value.substring(0, length - 1));
					if (value.indexOf('@') == -1) {
						dataSource.length = 0;
						for (var i = domains.length; i--;) {
							dataSource.push({
								id: i,
								name: value + "@" + domains[i]
							});
						}
					}
				}
			},
			onSelect: function (evt) {
				dataSource.length = 0;
			}
		});

		rfl.Delegator.getPageDelegator().delegate('click', 'send', function(){
			var valid = formUtil.validate('.form-horizontal');
			if (valid.passed) {

				var data = formUtil.getData('.form-horizontal');

				var emails = data.toEmail.split(";");
				for (var i = emails.length; i--;) {
					emails[i] = $.trim(emails[i]);
				}

				rfl.ajax.post({
					url: 'forward/' + params.messageId + "?original=" + params.original,
					data: {
						emails: emails,
						remark: data.remark,
					},
					success: function (res) {
						if (res.code === 0) {
							rfl.alerts.show("Success!", {type: "success", container: "#myalert"});
						} else {
							rfl.alerts.show("Fail!", {type: "error", container: "#myalert"});
						}
					},
					error: function (res) {
						rfl.alerts.show(langResourceCommon.msg.serverBusy, {type: "error", container: "#myalert"});
					}
				});

			} else {
				return formUtil.focus(valid.failList[0].item);
			}
		});
			
	}

	
	function init() {
		$('#main-div').html(mainTpl.render());

		var params = rfl.util.getUrlParams();

		_getInfo(params);

		_bindEvent(params);

		formUtil.setCommonMsg(langResourceCommon.msg.validator);
	}

	return {
		init: init
	};

});