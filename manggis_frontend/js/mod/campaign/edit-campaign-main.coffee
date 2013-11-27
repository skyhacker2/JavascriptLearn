define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	formUtil = require 'form-util'
	AutoComplete = require 'auto-complete'
	shortcutSave = require 'mod/campaign/save'
	fullScreenPage = require 'mod/nav-bar/full-screen-page'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './edit-campaign.tpl.html'
	replyToTpl = require './edit-campaign-reply-to.tpl.html'
	personalizeSubjectTpl = require './edit-campaign-personalize-subject.tpl.html'

	_marks = null
	_data = {}
	_range = null

	_doSave = (callback) ->
		valid = formUtil.validate '.campaign-form'
		data = formUtil.getData '.campaign-form'
		data.replyToName = data.replyToName || data.fromName
		data.replyToEmail = data.replyToEmail || data.fromEmail
		data.useAdRemark = $('#enableAdRemark')[0].checked
		if valid.passed
			if _marks[0] is 'create'
				rfl.util.unshiftLocalStoredList 'FROM_NAME', data.fromName
				rfl.util.unshiftLocalStoredList 'FROM_EMAIL', data.fromEmail
				if data.replyToName isnt data.fromName
					rfl.util.unshiftLocalStoredList 'REPLY_TO_NAME', data.replyToName
				if data.replyToEmail isnt data.fromEmail
					rfl.util.unshiftLocalStoredList 'REPLY_TO_EMAIL', data.replyToEmail
			pageData = rfl.pageStorage.get()
			sid = _marks[3] or pageData.sid
			if _marks[0] is 'duplicate'
				rfl.ajax.put
					url: "lists/campaigns/#{sid}/duplicate"
					data: data
					success: (res) ->
						if res.code is 0
							callback(res)
							rfl.alerts.show res.message, 'success'
						else
							rfl.alerts.show res.message, 'error'
					error: () ->
						rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'
			else
				rfl.ajax[if sid then 'put' else 'post']
					url: if sid then "lists/campaigns/#{sid}" else "lists/#{pageData.urlParams.listId}/campaigns"
					data: data
					success: (res) ->
						if res.code is 0
							rfl.pageStorage.set sid: res.data.id
							callback(res)
							if not sid
								rfl.alerts.show res.message, 'success'
						else
							rfl.alerts.show res.message, 'error'
					error: () ->
						rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'
		else
			formUtil.focus valid.failList[0].item

	_save = (nextStep) ->
		_doSave (res) ->
			if nextStep
				if nextStep is 'content'
					contentEditor = res.data.contentEditor
					if contentEditor is rfl.config.CAMPAIGN_CONTENT_EDITOR.DESIGNER
						nextStep = 'content-design'
					else if contentEditor is rfl.config.CAMPAIGN_CONTENT_EDITOR.CKEDITOR
						nextStep = 'content-upload-edit'
					else
						nextStep = 'content-select-type'
				location.hash = '!' + [(if _marks[0] is 'duplicate' then 'edit' else _marks[0]), _marks[1], nextStep, res.data.id].join '/'
			else
				rfl.alerts.show res.message, 'success'
				$('.header-inner .campaign-name').html rfl.util.encodeHtml $('#campaign-name').val()
				if _marks[0] is 'duplicate'
					location.hash = '!' + ['edit', _marks[1], _marks[2], res.data.id].join '/'

	_showSubjectPersonalizer = (evt) ->
		pageData = rfl.pageStorage.get()
		rfl.service.getFrequencyOrderProperties pageData.urlParams.listId, (propertys) ->
			dataSource = propertys.concat()
			dataSource.sort (a, b) ->
				if a.basic
					if b.basic
						a.propertyType - b.propertyType
					else
						-1
				else
					1
			$('#personalize-subject-div').html personalizeSubjectTpl.render
				lang:
					common: langResourceCommon
					campaign: langResourceCampaign
			new AutoComplete '#subject-property-list',
				maxSelection: 1
				dataSource: dataSource
				onBeforeSelect: (item) ->
					formUtil.addText2Input G.id('campaign-subject'), '${' + item.tag + '}', _range
					rfl.service.unshiftProperty item.id
					return false
			formUtil.initPlaceHolder '#subject-property-list'
			formUtil.focus '#subject-property-list'
			$(evt.target).closest('span').remove()

	_bindEvent = () ->
		subjectLenHintShown = false
		# we use different way for ie8 & ie9 between Modern browsers 
		ieTest = navigator.appVersion.match(/MSIE\s(\d\.\d)/)
		if ieTest and +ieTest[1] < 10
			$(document).on 'click keyup select', '#campaign-subject', (evt) ->
				_range = formUtil.getInputRange G.id('campaign-subject')
		shortcutSave.bind ->
			_save()
		rfl.Delegator.getPageDelegator().delegate 'click', 'saveCampaign',
			(evt, step) ->
				_save step
			, 2
		.delegate 'keyup', 'step1KeyupSubmit',
			(evt, min, max) ->
				if evt.keyCode is 13
					_save 'content'
				else if min and max
					min = +min
					max = +max
					target = evt.target
					len = rfl.util.getByteLength target.value
					if len > 0
						if len < min or len > max
							formUtil.showInputHint target, "For better Open Rate, you should enter #{min}-#{max} characters.", 'warning'
						else
							formUtil.showInputHint target, 'Want to improve your Open Rate? Please click <a href="#" target="_blank">here</a> to get more suggestions!', 'info'
						subjectLenHintShown = true
					else if(subjectLenHintShown)
					 	formUtil.hideInputHint target, true
			, 1
		.delegate 'click', 'showReplySetting',
			(evt) ->
				$(this).closest('.control-group').removeClass 'last'
				$(this).closest('div').remove()
				$('#reply-to-div').html replyToTpl.render
					lang:
						common: langResourceCommon
						campaign: langResourceCampaign
					data: {}
				_initReplyToAutoComplete()
				formUtil.focus '#reply-to-email'
			, 1
		.delegate 'click', 'showPersonalizeSubject',
			(evt) ->
				setTimeout ->
					_showSubjectPersonalizer evt
				, 200
			, 1
		_bindEvent = rfl.empty

	_createAutoComplete = (box, dataSource) ->
		new AutoComplete box,
			freeInput: true
			maxSelection: 1
			dataSource: dataSource
			getStdItem: (item) ->
				return {id: item, name: item}

	_initReplyToAutoComplete = () ->
		nameList = rfl.util.getLocalStoredList 'REPLY_TO_NAME'
		if nameList.length
			if not _data.replyToName
				$('#reply-to-name').val nameList[0] or ''
			if nameList.length > 1
				_createAutoComplete '#reply-to-name', nameList
		emailList = rfl.util.getLocalStoredList 'REPLY_TO_EMAIL'
		if emailList.length
			if not _data.replyToEmail
				$('#reply-to-email').val emailList[0] or ''
			if emailList.length > 1
				_createAutoComplete '#reply-to-email', emailList

	_initFromAutoComplete = () ->
		nameList = rfl.util.getLocalStoredList 'FROM_NAME'
		if nameList.length
			if not _data.fromName
				$('#from-name').val nameList[0] or ''
			if nameList.length > 1
				_createAutoComplete '#from-name', nameList
		emailList = rfl.util.getLocalStoredList 'FROM_EMAIL'
		if emailList.length
			if not _data.fromEmail
				$('#from-email').val emailList[0] or ''
			if emailList.length > 1
				_createAutoComplete '#from-email', emailList

	_render = (mark, action = 'create', base64Info, step, sid) ->
		doRender = (data) ->
			$('#main-div').html mainTpl.render
				listId: pageData.urlParams.listId
				marks: _marks
				urlParams: pageData.urlParams
				data: data
				lang:
					common: langResourceCommon
					campaign: langResourceCampaign
			fullScreenPage.checkScroll '.app-content-wrapper'
			_initFromAutoComplete()
			formUtil.initInputHint()
			formUtil.focus '#campaign-name'

			$('#showPrefixIntr').popover 
				html: true
				content: 'Some ISP likes 163 will treat our letter as spam if we don&apos; add [AD] in the subject. Enable subject suffix, and system will automatic add it in the subject for all this ISP.'
				trigger: 'hover'
				placement: 'top'
			setTimeout () ->
				$('.off-screen').removeClass 'off-left off-top'
			, 0
		pageData = rfl.pageStorage.get() or {}
		sid = sid || pageData.sid
		_marks = [action, base64Info, step, sid]
		_bindEvent()
		formUtil.setCommonMsg langResourceCommon.msg.validator
		if sid
			rfl.ajax.get
				url: "lists/campaigns/#{sid}"
				success: (res) ->
					if res.code is 0
						_data = res.data
						doRender res.data
					else if res.code is rfl.config.RES_CODE.RESOURCE_NOT_EXIST
						rfl.ui.renderInvalidUrl '#main-div'
					else
						rfl.ui.renderPageLoadError '#main-div', content: res.message
				error: () ->
					rfl.ui.renderPageLoadError '#main-div'
		else
			doRender {useAdRemark: true}

	render = () ->
		rfl.ajax.history.dispatch (args...) ->
			_render.apply null, args

	render: render