define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './edit.tpl.html'

	_marks = null

	_bindEvent = () ->
		rfl.Delegator.getPageDelegator().delegate 'click', 'selectCampaignType',
			(evt, type) ->
				rfl.ajax.history.dispatch (mark, action = 'create', base64Info = '', step, sid) ->
					rfl.pageStorage.set sid: ''
					location.hash = '!' + [action, base64Info, 'campaign', '', type].join '/'
			, 2
		.delegate 'click', 'gotoStep',
			(evt, targetStep) ->
				gotoStep targetStep
			, 2
		.delegate 'click', 'viewSpamRating',
			(evt) ->
				require ['./edit'], (mod) ->
					mod.showSpamRating()
			, 1
		$(document).on 'keydown', (evt) ->
			if evt.ctrlKey and evt.which is 83
				evt.preventDefault()
				false
		_bindEvent = rfl.empty

	_render = (mark, action = 'create', base64Info, step, sid) ->
		pageData = rfl.pageStorage.get() or {}
		if not pageData.urlParams or base64Info and base64Info isnt _marks[1]
			_marks = [action, base64Info, step, sid]
			if base64Info
				rfl.util.fromBase64 base64Info,
					(res) ->
						if res
							pageData.urlParams = res
							rfl.pageStorage.set pageData
							G.listId = res.listId;
							_render mark, action, base64Info, step, sid
						else
							rfl.ui.renderInvalidUrl '#main-div'
					, true
			else
				rfl.ui.renderInvalidUrl '#main-div'
			return
		_marks = [action, base64Info, step, sid]
		if step
			require ["./edit-#{step}-main"], (mod) ->
				mod.render()
			, () ->
				rfl.ui.renderPageLoadError '#main-div'
		else
			$('#main-div').html mainTpl.render
				marks: [action, base64Info, step, sid]
				urlParams: pageData.urlParams
				lang:
					common: langResourceCommon
					campaign: langResourceCampaign
		_bindEvent()

	getContentData = (callback) ->
		pageData = rfl.pageStorage.get() or {}
		contentData = pageData.contentData
		if contentData
			rfl.pageStorage.set contentData: null
			callback {code: 0, message: 'ok', data: contentData}
			return
		rfl.ajax.get
			url: "lists/campaigns/#{_marks[3]}/content"
			success: (res) ->
				callback res
			error: () ->
				callback {code: -1, message: langResourceCommon.msg.serverBusy, data: null}

	gotoStep = (targetStep) ->
		if targetStep is 'content'
			gotoEditContent()
		else
			rfl.ajax.history.dispatch (mark, action, base64Info, step, sid) ->
				location.hash = '!' + [action, base64Info, targetStep, sid].join '/'

	gotoEditContent = () ->
		getContentData (res) ->
			if res.code is 0
				rfl.pageStorage.set contentData: res.data
				step = 'content-select-type'
				if res.data.contentEditor is rfl.config.CAMPAIGN_CONTENT_EDITOR.DESIGNER
					step = 'content-design'
				else if res.data.contentEditor is rfl.config.CAMPAIGN_CONTENT_EDITOR.CKEDITOR
					step = 'content-upload-edit'
				gotoStep step
			else
				rfl.alerts.show res.message, 'error'

	showSpamRating = (content) ->
		pageData = rfl.pageStorage.get()
		rfl.ajax.get
			url: "lists/campaigns/#{_marks[3]}/spamRating"
			success: (res) ->
				if res.code is 0
					require ['just-gage', './spam-rating-main.tpl.html'], (JustGage, spamRatingTpl) ->
						rfl.dialog.create
							show: false
							title: 'Spam Rating'
							content: spamRatingTpl.render
								data: res.data
								lang:
									common: langResourceCommon
									campaign: langResourceCampaign
							btns: [{
								dismiss: true
								text: langResourceCommon.label.close
							}]
						.on 'shown.bs.modal', () ->
							new JustGage 
								id: 'gauge'
								value: res.data.score
								min: 0
								max: res.data.thresholdScore
								title: 'Spam Rating'
						.modal 'show'
				else
					rfl.alerts.show res.message, 'error'
			error: () ->
				rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'

	render = (args...) ->
		if args.length
			_render.apply null, args
		else 
			rfl.ajax.history.dispatch (args...) ->
				_render.apply null, args

	init = (listId, listRes) ->
		return if not rfl.auth.checkAndWarn 'PERM_USER_ADMIN'
		rfl.ajax.history.init 6, render

	getContentData: getContentData
	gotoStep: gotoStep
	gotoEditContent: gotoEditContent
	showSpamRating: showSpamRating
	render: render
	init: init