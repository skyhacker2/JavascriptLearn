define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	formUtil = require 'form-util'
	fullScreenPage = require 'mod/nav-bar/full-screen-page'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './edit-content-plain-text.tpl.html'
	shortcutSave = require 'mod/campaign/save'

	_marks = null
	_autoChange = false

	_savePlainText = (step) ->
		pageData = rfl.pageStorage.get()
		rfl.ajax.put
			url: "lists/campaigns/#{_marks[3]}/plainText"
			data:
				plainText: $('#plain-textarea').val()
				plainTextAutoChange: _autoChange
			success: (res) ->
				if res.code is 0
					if step
						require ['./edit'], (mod) ->
							mod.gotoStep step
					else
						rfl.alerts.show res.message, 'success'
				else
					rfl.alerts.show res.message, 'error'
			error: () ->
				rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'

	_bindEvent = () ->
		shortcutSave.bind ->
			_savePlainText()
		rfl.Delegator.getPageDelegator().delegate 'click', 'savePlainText',
			(evt, step) ->
				_savePlainText step
			, 1
		.delegate 'click', 'plainTextInsertCustomerProperty',
			(evt) ->
				require ['lib/ckeditor-4.2.1/plugins/ripersonalizer/dialog-main'], (dialog) ->
					range = formUtil.getInputRange G.id('plain-textarea')
					dialog.show {
						insertHtml: (content) ->
							formUtil.addText2Input G.id('plain-textarea'), content, range
					}, {
						placement: 'right'
					}
			, 1
		.delegate 'click', 'plainTextInsertLinkage',
			(evt) ->
				require ['lib/ckeditor-4.2.1/plugins/rilink/dialog-main'], (dialog) ->
					range = formUtil.getInputRange G.id('plain-textarea')
					dialog.show {
						insertHtml: (content, mode, extra) ->
							formUtil.addText2Input G.id('plain-textarea'), extra.tag, range
					}, {
						noNeedText: true
						placement: 'right'
					}
			, 1
		.delegate 'click', 'retrievePlainText',
			(evt) ->
				pageData = rfl.pageStorage.get()
				rfl.ajax.get
					url: "lists/campaigns/#{_marks[3]}/generatePlainText"
					success: (res) ->
						if res.code is 0
							$('#plain-textarea').val res.data.plainText
							rfl.alerts.show res.message, 'success'
						else
							rfl.alerts.show res.message, 'error'
					error: () ->
						rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'
		.delegate 'click', 'autoChange',
			(evt) ->
				_autoChange = !_autoChange
		_bindEvent = rfl.empty

	_render = (mark, action = 'create', base64Info, step, sid) ->
		if not sid
			rfl.ui.renderInvalidUrl '#main-div'
			return
		_marks = [action, base64Info, step, sid]
		pageData = rfl.pageStorage.get() or {}
		_bindEvent()
		rfl.ajax.get
			url: "lists/campaigns/#{_marks[3]}/plainText"
			success: (res) ->
				if res.code is 0
					_autoChange = !!res.data.plainTextAutoChange
					$('#main-div').html mainTpl.render
						listId: pageData.urlParams.listId
						marks: _marks
						urlParams: pageData.urlParams
						data: res.data
						autoChange: _autoChange
						lang:
							common: langResourceCommon
							campaign: langResourceCampaign
					fullScreenPage.checkScroll '.app-content-wrapper'
					formUtil.moveInputEnd '#plain-textarea'
					setTimeout () ->
						$('.off-screen').removeClass 'off-left off-top'
					, 0
				else if res.code is rfl.config.RES_CODE.RESOURCE_NOT_EXIST
					rfl.ui.renderInvalidUrl '#main-div'
				else
					rfl.ui.renderPageLoadError '#main-div', content: res.message
			error: () ->
				rfl.ui.renderPageLoadError '#main-div'

	render = () ->
		rfl.ajax.history.dispatch (args...) ->
			_render.apply null, args

	render: render