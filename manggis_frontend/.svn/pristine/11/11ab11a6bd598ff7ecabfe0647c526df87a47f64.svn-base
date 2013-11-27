define(function(require){
	var $ = require('jquery');
	var rfl = require('rfl');
	var mainTpl = require('./edit-content-select-tpl.tpl.html');
	var config = require('../../../template/config');
	var langResourceCommon = require("../../lang/" + G.LANG + "/common");
	var langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
	var tplInit = require('mod/template/init-main');

	function _render(mask, action, base64Info, step, sid){
		var pageData, tplList;
		pageData = rfl.pageStorage.get() || {};
		if (action == null) {
			action = 'create';
		}

		tplList = tplInit.getAllTpl();

		rfl.ajax.get({
			url: 'lists/campaigns/' + sid + '/overview',
			success: function(res){
				if(res.code === 0){
					$('#main-div').html(mainTpl.render({
						listId: pageData.urlParams.listId,
						marks: [action, base64Info, step, sid],
						campaignName: res.data.name,
						config: config,
						urlParams: pageData.urlParams,
						tplList: tplList,
						lang: {
							common: langResourceCommon,
							campaign: langResourceCampaign
						}
					}));

					return setTimeout(function(){
						$('.off-screen').removeClass('off-left off-top');
					}, 0);
				}else{
					rfl.ui.renderPageLoadError('#main-div', {content: res.message});
				}
			},
			error: function(res){

			}
		});
	}

	function _bindEvent(){
		rfl.Delegator.getPageDelegator().delegate('click', 'selectTpl', function(evt, id) {
			rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid) {
				return location.hash = '!' + [action, base64Info, 'content-design', sid, id].join('/');
			});
		}, 1).delegate('click', 'regainTpl', function(evt, id) {
			hasDone = true;
			rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid) {
				return location.hash = '!' + [action, base64Info, 'content-design', sid, id, 1].join('/');
			});
		}, 1).delegate('click', 'gotoStep', function(evt, step) {
			require(['./edit'], function(mod) {
				mod.gotoStep(step);
			});
		});

		_bindEvent = rfl.empty;
	}

	function render(){
		rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid) {
			if(step !== 'content-select-tpl') {
				return;
			}

			_render(mark, action, base64Info, step, sid);
			_bindEvent();
		});
	}

	return {
		render: render
	};
});