define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var mainTpl = require('./preview.tpl.html');
	var langResourceCommon = require("../../lang/" + G.LANG + "/common");
	var AutoComplete = require('auto-complete');

	var _div;
	var _editGroups;
	var _string;
	var _listId;
	var _campaignId;
	var _errorCallback;
	var hasInit = false;

	var _fixHeightTimeout = -1;
	function _fixHeight() {
		clearTimeout(_fixHeightTimeout);
		_fixHeightTimeout = setTimeout(function () {
			var iframe = G.id('preview-iframe');
			if (iframe) {
				$(iframe).height($(iframe.contentDocument).outerHeight());
				
				setTimeout(function(){
					$('#preview-container').mCustomScrollbar('update');
				}, 500);
			}

		}, 100);
	}

	function _CSS3Support(ele, prop) {
		var prefixList = ["ms", "webkit", "moz"];

		if (prop in ele.style) {
			return true;
		}

		prop = prop.charAt(0).toUpperCase() + prop.slice(1);
		for (var i = prefixList.length; i--;) {
			if (prefixList[i] + prop in ele.style) {
				return true;
			}
		}
		return false;
	}

	function _preview(data) {
		document.body.parentNode.style.overflow = "hidden";

		_div = $(mainTpl.render(data));
		_div = _div.appendTo($(document.body));

		setTimeout(function () {
			$('.modal-backdrop').addClass('in');
			$('.off-screen').removeClass('off-top');
			setTimeout(function () {
				$('.off-screen').removeClass('off-left');
			}, 300);
		}, 100);

		require(['lib/jquery/plugins/mCustomScrollbar-main'], function () {
			rfl.css.load('js/lib/jquery/plugins/mCustomScrollbar-main.css');

			$('#preview-container').mCustomScrollbar({
				scrollInertia: 0
			});

			var iframe = G.id('preview-iframe'),
				html = (data.html.replace(/(<head>)/, '$1<base target="_blank" />').replace(/(<body>)/, '$1<div style="margin:auto;width:900px;" id="preview-content">').replace(/(<\/body>)/, '</div>$1'));

			iframe.onload = function () {
				iframe.contentDocument.open();
				iframe.contentDocument.write(html);
				iframe.contentDocument.close();

				iframe.onload = function () {
					_fixHeight();
				}

				iframe.contentDocument.body.style.background = "#ffffff";
				iframe.contentDocument.body.style.margin = "10px";

				_fixHeight();
			}
			iframe.src = 'html/campaign/preview-en.html';

			var mobileIframe = G.id('mobile-iframe');

			mobileIframe.onload = function () {
				mobileIframe.onload = rfl.empty;
				mobileIframe.contentDocument.open();
				var html = data.html;
				html = html.replace(/(<head>)/, '$1<base target="_blank" />');
				mobileIframe.contentDocument.write(data.html);
				mobileIframe.contentDocument.close();

				mobileIframe.contentDocument.body.style.background = "#ffffff";
			}
			mobileIframe.src = 'html/campaign/preview-en.html';

		});

		_bindEvent();
	}

	function _repreview(data) {
		$('#editToItem').html(data.firstName + " " + data.lastName + " &lt;" + data.toEmail +"&gt;");
		$('#editSubject').html(data.subject);

		$('#edit-to').show();
		$('#editToItem').show();
		$('#edit-groups-container').hide();
		_editGroups.destroy();
		_createEditGroups();

		var doc = G.id('preview-iframe').contentDocument;
		$('#preview-content', doc).html(data.html);
	}

	function _render(listId, campaignId, data) {
		var string, errorCallback, customerId, _data = {};

		_listId = listId;
		_campaignId = campaignId;

		if (data) {
			string = _string = data.content;
			errorCallback = _errorCallback = errorCallback;
		} else {
			string = errorCallback = undefined;
		}

		if (!_errorCallback) {
			_errorCallback = function (message) {
				rfl.alerts.show(message, 'error');
			};
		}

		if (customerId = rfl.localStorage.get("PREVIEW_CUSTOMER_ID")) {
			_data.customerId = customerId;
		}
		_data.html = string;

		rfl.ajax.post({
			url: "lists/campaigns/" + _campaignId + "/preview",
			data: _data,
			success: function (res) {
				if (res.code === 0) {
					// 给prototype一个模拟
					var data = res.data;

					(data.html) || (data.html = string);
					(data.firstName) || (data.firstName = "");
					(data.lastName) || (data.lastName = "");
					if (data.lasName === "" && data.firstName === "") {
						data.firstName = "Unknow";
					}

					data.support = _CSS3Support(document.getElementById('main-div'), 'transform');

					return _preview(data);
				} else {
					_errorCallback(res.message);
					hasInit = false;
				}
			},
			error: function () {
				_errorCallback(langResourceCommon.msg.serverBusy);
				hasInit = false;
			}
		});

	}

	function _rerender(item) {

		rfl.localStorage.set("PREVIEW_CUSTOMER_ID", item.id);

		rfl.ajax.post({
			url: "lists/campaigns/" + _campaignId + "/preview",
			data: {
				html: _string,
				customerId: item.id
			},
			success: function(res) {
				if (res.code === 0) {
					// 给prototype一个模拟
					var data = res.data;

					(data.html) || (data.html = _string);
					(data.firstName) || (data.firstName = "");
					(data.lastName) || (data.lastName = "");
					if (data.lasName === "" && data.firstName === "") {
						data.firstName = "Unknow";
					}

					return _repreview(data);
				} else {
					_errorCallback(res.message);
				}
			},
			error: function () {
				_errorCallback(langResourceCommon.msg.serverBusy);
			}
		});
				

	}

	function _close() {
		var iframe1 = G.id('preview-iframe'),
			iframe2 = G.id('mobile-iframe');
		iframe1 && (iframe1.src = "about:blank");
		iframe2 && (iframe2.src = "about:blank");

		$('#preview-container').mCustomScrollbar('destroy');

		document.body.parentNode.style.overflow = "auto";

		_div.remove();

		$(document).off('keydown', _keyEsc);
		rfl.ajax.history.off('change', _close);

		hasInit = false;
	}

	function _keyEsc(evt) {
		if (evt.which === 27) {
			_close();
		}
	}

	function _createEditGroups() {
		_editGroups = new AutoComplete('#edit-groups', {
			maxSelection: 1,
			listStyle: {
				width: "400px"
			},
			getMatchedList: function (input) {
				rfl.ajax.get({
					url: 'lists/' + _listId + '/searchCustomers',
					data: {
						key: input
					},
					success: function (res) {
						if (res.code == 0) {
							_editGroups.renderList(res.data.customers, {matchedInput: input});
						} else {

						}
					},
					error: function () {

					}
				})
			},
			getStdItem: function (item) {
				return {
					id: item.id,
					name: item.firstName + " " + item.lastName + " <" + item.email + ">"
				};
			},
			onKeyup: function (evt) {
				if (evt.keyCode === 40 && !_editGroups.isListShown()) {
					return _editGroups.showFullList(true);
				}
			},
			onSelect: function (box, item, stdItem, index) {
				_rerender(item);
			}
		});
	}

	function _bindEvent() {

		var rotate = false;
		_createEditGroups();

		rfl.Delegator.getDelegator(_div).delegate('click', 'close', function () {
			_close();
		}, 2).delegate('click', 'changeDevice', function (event, type) {
			if (type === "mobile") {
				$('#mobile-button').hide();
				$('#desktop-button').show();
				$('#desktop-view').hide();
				$('#mobile-view').show();
				$('#preview-container').mCustomScrollbar('update');
			} else {
				$('#desktop-button').hide();
				$('#mobile-button').show();
				$('#desktop-view').show();
				$('#mobile-view').hide();
				$('#preview-container').mCustomScrollbar('update');
			}
		}).delegate('click', 'rotate', function(){
			if (!rotate) {
				rotate = true;
				$('#mobile-view').addClass('rotate-mobile');
			} else {
				rotate = false;
				$('#mobile-view').removeClass('rotate-mobile');
			}
			
		}).delegate('click', 'editTo', function(){
			$('#edit-to').hide();
			$('#editToItem').hide();
			$('#edit-groups-container').show();
			$('#edit-groups').focus();
		});

		_div.on('click', function(evt){
			if (evt.target.className.indexOf("mCSB_container") !== -1 || evt.target.className.indexOf("mCustomScrollBox") !== -1 || evt.target.id === "preview-width") {
				_close();
			}
		});

		$(document).on('keydown', _keyEsc);
		rfl.ajax.history.on('change', _close);
	}

	/**
	 * init(listId, campaignId, data)  or
	 * 初始化preview
	 * @param {String} listId list的id
	 * @param {String} campaignId campaign的id
	 * @param {Object} data 传过来的数据 
	 *        @param {String} content html源代码
	 *        @param {Function} errorCallback 异常处理
	 */
	function init(listId, campaignId, data) {
		if (!hasInit) {
			hasInit = true;
			_render(listId, campaignId, data);
		}
	}

	return {
		init: init
	}

});