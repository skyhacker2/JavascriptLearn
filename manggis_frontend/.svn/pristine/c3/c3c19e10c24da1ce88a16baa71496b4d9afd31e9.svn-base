define(function(require, exports) {
	var $ = require('jquery'),
		rfl = require('rfl'),
		formUtil = require('form-util'),
		mainTpl = require('./edit-picture.tpl.html');

	var _dialog,
		_target;

	function _update() {
		_target.attr("data-href", document.getElementById("hyperlink").value);
		_hide();
	}

	function _hide() {
		if(_dialog) {
			_dialog.modal('hide');
			_dialog = null;
		}
	}

	exports.show = function(target) {
		_target = target;

		require(['lang/' + G.LANG + '/common', 'lang/' + G.LANG + '/login'], function(langResourceCommon, langResourceLogin) {
			formUtil.setCommonMsg(langResourceCommon.msg.validator);
			_hide();
			_dialog = rfl.dialog.create({
				title: "Edit Picture",//langResourceLogin.label.changePwd,
				content: mainTpl.render({lang: {login: langResourceLogin}}),
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

			setTimeout(function(){
				var href = target.attr("data-href");
				href && (document.getElementById("hyperlink").value = target.attr("data-href"));
			}, 200);

		});
	};
});