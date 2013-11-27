define(function (require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var mainTpl = require('./unsubscribe.tpl.html');
	var langResourceCommon = require("../../lang/" + G.LANG + "/common");

	function _getInfo (params) {
		if (!(params.messageId)) {
			rfl.ui.renderInvalidUrl('#main-div');
			return;
		}

		rfl.ajax.get({
			url: 'unsubscribe/' + params.messageId + "?lang=" + G.LANG_BACKEND_MAP[G.LANG],
			success: function (res) {
				if(res.code === 0){
					$('#main-div').html(mainTpl.render(res.data));
				}else{
					rfl.ui.renderInvalidUrl('#main-div');
				}
			},
			error: function (res) {
				rfl.alerts.show(langResourceCommon.msg.serverBusy, {type: "error", container: "#myalert"});
			}
		})
	}

	function _bindEvent(params) {

		var _delegator = rfl.Delegator.getPageDelegator().delegate('click', 'unsubscribe', function () {
			rfl.ajax.post({
				url: 'unsubscribe/' + params.messageId + "?lang=" + G.LANG_BACKEND_MAP[G.LANG],
				success: function (res) {
					if (res.code === 0) {
						$('#unsubscribe').html('退订成功');
						$('#unsubscribe').addClass('disabled');
						_delegator.destroy();
					} else {
						$('#unsubscribe').html(res.message);
						$('#unsubscribe').addClass('disabled');
						_delegator.destroy();
					}
				},
				error: function (res) {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, {type: "error", container: "#myalert"});
				}
			});
		});

		$(document.body).on('click', '[type="radio"]', function(event){
			if (event.target.id === "change-preference") {
				$('#all-type').show();
			} else {
				$('#all-type').hide();
			}
		});
	}

	
	function init() {
		var params = rfl.util.getUrlParams();

		_getInfo(params);

		_bindEvent(params);
	}

	return {
		init: init
	};

});