define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var mainTpl = require('./edit-content-design.tpl.html');
	var tplInit = require('mod/template/init-main');
	var langResourceCommon = require("../../lang/" + G.LANG + "/common");
	var langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
	var save = require('mod/campaign/save');

	var _listId;
	var _masks;


	function _render() {
		var pageData = rfl.pageStorage.get();
		$('#main-div').html(mainTpl.render({
			listId: pageData.urlParams.listId,
			marks: _marks,
			urlParams: pageData.urlParams,
			lang: {
				common: langResourceCommon,
				campaign: langResourceCampaign
			}
		}));

		return setTimeout(function () {
			return $('.off-screen').removeClass('off-left off-top');
		}, 0);
	}

	function _next(evt, goto) {
		rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid){

			var urlParams = rfl.pageStorage.get().urlParams;

			// 组装出来的data
			rfl.ajax.put({
				url: "lists/campaigns/" + sid + "/content",
				data: {
					html: tplInit.html(),
					contentEditor: rfl.config.CAMPAIGN_CONTENT_EDITOR.DESIGNER,//Editor used to edit the content
					config: tplInit.update()
				},
				success: function (res) {
					if (res.code === 0) {
						return location.hash = '!' + [action, base64Info, goto, sid].join('/');
					} else {
						return rfl.alerts.show(res.message, {type: 'error', container: '#design-alert'});
					}
				},
				error: function () {
					return rfl.alerts.show(langResourceCommon.msg.serverBusy, {type: 'error', container: '#design-alert'});
				}
			});
		});	
	}

	function _bindEvent() {
		save.bind(_next);

		rfl.Delegator.getPageDelegator().delegate('click', 'next', _next)
		.delegate('click', 'define-campaign', function(){
			rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid){
				return location.hash = '!' + [action, base64Info, 'content-select-type', sid].join('/');
			});
		});

		_bindEvent = rfl.empty;
	}

	function _loadCSS() {
		rfl.css.load('./css/mod/template/template-main.css');
	}

	function _uploadCSS() {
		rfl.css.unload('./css/mod/template/template-main.css');
	}

	function render() {

		tplInit.reset();

		_loadCSS();

		rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid, tplID, regain) {
			if(step !== 'content-design') {
				return;
			}

			_marks = [action, base64Info, step, sid];

			_render();
			_bindEvent();

			var urlParams = rfl.pageStorage.get().urlParams;
			
			//顺便初始化一下图片API
			tplInit.initAPI('lists/campaigns/' + sid + '/image/upload');

			require(['./edit'], function(mod) {
				mod.getContentData(function(res) {
					if(res.code === 0) {
						if(!!res.data.config) {
							var config = rfl.json.parse(res.data.config);
							// please check out
							tplInit.set(config.tplID, config);
							if(!tplID || +tplID === +config.tplID) {	
								regain = 1; // 此时才是数据恢复
							}
						}
					} else {
						return rfl.alerts.show(res.message, {type: 'error', container: '#design-alert'});
					}
					tplInit.init(tplID, function() {
						rfl.ui.renderInvalidUrl('#main-div');
					}, regain);	
				});
			});
		});
		
	}

	return {
		render: render,
		save: _next
	};

});