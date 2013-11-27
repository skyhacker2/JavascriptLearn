define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	FileUploader = require 'file-uploader'
	fullScreenPage = require 'mod/nav-bar/full-screen-page'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './edit-content-select-type.tpl.html'

	_marks = null

	_bindEvent = () ->
		rfl.Delegator.getPageDelegator().delegate 'click', 'selectContentType',
			(evt, type) ->
				rfl.ajax.history.dispatch (mark, action = 'create', base64Info = '', step, sid) ->
					if type is 'builder'
						step = 'content-select-tpl'
					else
						step = 'content-upload'
					location.hash = '!' + [action, base64Info, step, sid].join '/'
			, 2
		_bindEvent = rfl.empty

	_initUploader = () ->
		pageData = rfl.pageStorage.get()
		new FileUploader '#file-drop-area',
			enableDropFile: true
			enableMultipleSelection: false
			fileParamName: 'campaignFile'
			onBeforeUpload: (uploading, callback) ->
				fileExtName = uploading.fileExtName.toLowerCase()
				if fileExtName not in ['.html', '.htm', '.zip']
					rfl.alerts.show 'You can only upload HTML or ZIP file.', 'error'
					callback false
					return
				rfl.ajax.getUploadOpt 'lists/campaigns/' + _marks[3] + '/upload', (if uploading.from is 'DROP' then 'json' else 'xhtml'), (opt) ->
					$('.campaign-type-btn, .section-divider').hide()
					$('#progress-bar').show()
					callback $.extend opt, data: contentEditor: rfl.config.CAMPAIGN_CONTENT_EDITOR.CKEDITOR
					rfl.ajax.showLoading()
			onDragenter: () ->
				$('#file-drop').addClass 'drop-enter'
			onDragleave: () ->
				$('#file-drop').removeClass 'drop-enter'
			onDrop: () ->
				$('#file-drop').removeClass 'drop-enter'
			onProgress: (uploading, progress) ->
				$('#progress-bar .progress-text').html progress + '%'
				$('#progress-bar .progress-bar').css 'width', progress + '%'
			onLoad: (uploading, res) ->
				if not rfl.ajax.dealCommonCode res.code
					if res.code is 0
						$('#progress-bar .progress-text').html '100%'
						$('#progress-bar .progress-bar').css 'width', '100%'
						rfl.ajax.history.dispatch (mark, action = 'create', base64Info = '', step, sid) ->
							location.hash = '!' + [action, base64Info, 'content-upload-edit', sid].join '/'
					else
						$('#progress-bar').hide()
						$('.campaign-type-btn, .section-divider').show()
						$('#progress-bar .progress-text').html '0%'
						$('#progress-bar .progress-bar').css 'width', '0%'
						rfl.alerts.show res.message, 'error'
				else
					$('#progress-bar').hide()
					$('.campaign-type-btn, .section-divider').show()
					$('#progress-bar .progress-text').html '0%'
					$('#progress-bar .progress-bar').css 'width', '0%'
			onError: (uploading) ->
				$('#progress-bar').hide()
				$('.campaign-type-btn, .section-divider').show()
				rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'
			onComplete: (uploading) ->
				rfl.ajax.hideLoading()

	_render = (mark, action = 'create', base64Info, step, sid) ->
		if not sid
			rfl.ui.renderInvalidUrl '#main-div'
			return
		_marks = [action, base64Info, step, sid]
		pageData = rfl.pageStorage.get() or {}
		_bindEvent()
		rfl.ajax.get
			url: "lists/campaigns/#{_marks[3]}/overview"
			success: (res) ->
				if res.code is 0
					$('#main-div').html mainTpl.render
						CAMPAIGN_CONTENT_EDITOR: rfl.config.CAMPAIGN_CONTENT_EDITOR
						listId: pageData.urlParams.listId
						campaignName: res.data.name
						contentEditor: res.data.campaign.contentEditor
						marks: _marks
						urlParams: pageData.urlParams
						lang:
							common: langResourceCommon
							campaign: langResourceCampaign
					fullScreenPage.checkScroll '.app-content-wrapper'
					_initUploader()
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