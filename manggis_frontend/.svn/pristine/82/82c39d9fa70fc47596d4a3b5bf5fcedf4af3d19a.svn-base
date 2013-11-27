define (require) ->
	$ = require 'jquery'
	bootstrap = require 'bootstrap'
	rfl = require 'rfl'
	fullScreenPage = require 'mod/nav-bar/full-screen-page'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './edit-content-upload-edit.tpl.html'
	shortcutSave = require 'mod/campaign/save'

	_HTML_BODY_MARK = '{{__HTML_BODY_MARK__}}'

	_marks = null
	_codemirror = null
	_ckeditor = null
	_code = null

	_getCurrentCode = () ->
		if $('.header-tabs li:first').hasClass 'on'
			code =  _ckeditor?.getData()
			if code isnt undefined
				return if _code.body then _code.wrapper.replace(_HTML_BODY_MARK, code) else code
		else
			return _codemirror?.getValue()

	_saveUploaded = (step) ->
		pageData = rfl.pageStorage.get()
		rfl.ajax.put
			url: "lists/campaigns/#{_marks[3]}/content"
			data:
				html: _getCurrentCode()
				contentEditor: rfl.config.CAMPAIGN_CONTENT_EDITOR.CKEDITOR
				config: ''
			success: (res) ->
				if res.code is 0
					# 这里需要设置
					if ~G.CDN_ORIGIN.indexOf('http://cdn.manggis.internal')
						$.ajax
							type: 'GET'
							url: 'http://snapshot.manggis.internal/campaign/snapshot'
							data: 
								campaignId: _marks[3]
								url: "http://controller.manggis.internal/controller/lists/campaigns/#{_marks[3]}/snapshot.xhtml"
							success: () ->
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
			_saveUploaded()

		rfl.Delegator.getPageDelegator().delegate 'click', 'switchCampaignContentTab',
			(evt, tab) ->
				_switchTab tab
			, 1
		.delegate 'click', 'saveUploadedCode',
			(evt, step) ->
				_saveUploaded step
			, 1
		.delegate 'click', 'uploadSendSample',
			(evt) ->
				require ['./sample-sender-main'], (sender) ->
					code = _getCurrentCode()
					if code isnt undefined
						pageData = rfl.pageStorage.get()
						sender.show(pageData.urlParams.listId, _marks[3], code)
			, 1
		.delegate 'click', 'previewUploadedContent',
			(evt) ->
				require ['./preview-main'], (mod) ->
					code = _getCurrentCode()
					if code isnt undefined
						pageData = rfl.pageStorage.get()
						mod.init pageData.urlParams.listId, _marks[3], content: code
			, 1
		.delegate 'click', 'codeInsertCustomerProperty',
			(evt) ->
				require ['lib/ckeditor-4.2.1/plugins/ripersonalizer/dialog-main'], (dialog) ->
					dialog.show {
						insertHtml: (content) ->
							if _codemirror
								cursor = _codemirror.getCursor()
								_codemirror.replaceRange content, cursor, cursor
					}, {
						placement: 'right'
					}
			, 1
		.delegate 'click', 'codeInsertLinkage',
			(evt) ->
				require ['lib/ckeditor-4.2.1/plugins/rilink/dialog-main'], (dialog) ->
					dialog.show {
						insertHtml: (content) ->
							if _codemirror
								cursor = _codemirror.getCursor()
								_codemirror.replaceRange content, cursor, cursor
					}, {
						placement: 'right'
					}
			, 1
		_bindEvent = rfl.empty

	_switchTab = (tab) ->
		if tab is '2'
			$('.header-tabs li:first').removeClass 'on'
			$('.ckeditor-wrapper').addClass 'display-none'
			$('.header-tabs li:last').addClass 'on'
			$('.codemirror-wrapper').removeClass 'display-none'
			if _codemirror
				_codemirror.setValue if _code.body then _code.wrapper.replace(_HTML_BODY_MARK, _ckeditor.getData()) else _ckeditor.getData()
			else
				_initCodeMirror()
			rfl.localStorage.set 'PREFER_CONTENT_EDITOR', 'CODE'
		else
			$('.header-tabs li:last').removeClass 'on'
			$('.codemirror-wrapper').addClass 'display-none'
			$('.header-tabs li:first').addClass 'on'
			$('.ckeditor-wrapper').removeClass 'display-none'
			_setCode _codemirror.getValue() if _codemirror
			_initCkeditor()
			rfl.localStorage.set 'PREFER_CONTENT_EDITOR', 'DESIGN'

	_initCodeMirror = () ->
		rfl.css.load 'js/lib/codemirror/codemirror.css'
		val = if _ckeditor then _ckeditor.getData() else $('[name="ckeditor"]').val()
		require ['codemirror'], (CodeMirror) ->
			$('.codemirror-container .ajax-loading-s').remove()
			_codemirror = new CodeMirror $('.codemirror-container')[0],
				value: if not val then _code.origin else if _code.body then _code.wrapper.replace(_HTML_BODY_MARK, val) else val
				mode: 'text/html'
				autoCloseTags: true
				lineNumbers: true

	_initCkeditor = () ->
		$('[name="ckeditor"]').val _code.body || _code.origin
		require ['ckeditor'], (CKEDITOR) ->
			_ckeditor.destroy() if _ckeditor
			_ckeditor = CKEDITOR.replace 'ckeditor',
				allowedContent: true
				customConfig: ''
				height: '307',
				enterMode: CKEDITOR.ENTER_BR
				shiftEnterMode: CKEDITOR.ENTER_P
				extraPlugins: 'ripersonalizer,rilink,tableresize'
				toolbarGroups: [
					{name: 'clipboard', groups: ['clipboard', 'undo']},
					{name: 'editing', groups: ['find']},
					'/',
					{name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
					{name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align']},
					{name: 'links'},
					{name: 'insert'},
					'/',
					{name: 'styles'},
					{name: 'colors'},
					{name: 'tools'},
					{name: 'others'},
					{name: 'ri', groups: ['ripersonalizer', 'rilink']}
				]

	_setCode = (code) ->
		_code = {
			origin: code,
			wrapper: '',
			body: ''
		}
		_code.wrapper = code.replace /\s*(<body>|<body [^>]+>)([\s\S]*)<\/body>/i, ($0, $1, $2) ->
			_code.body = $2
			return "\n#{$1}\n#{_HTML_BODY_MARK}\n</body>"

	_render = (mark, action = 'create', base64Info, step, sid) ->
		if not sid
			rfl.ui.renderInvalidUrl '#main-div'
			return
		_marks = [action, base64Info, step, sid]
		_bindEvent()
		require ['./edit'], (mod) ->
			mod.getContentData (res) ->
				if res.code is 0
					pageData = rfl.pageStorage.get() or {}
					$('#main-div').html mainTpl.render
						listId: pageData.urlParams.listId
						marks: _marks
						urlParams: pageData.urlParams
						url:
							uploadNew: "html/campaign/edit-#{G.LANG}.html#!" + [action, base64Info, 'content-upload', sid].join '/'
						data: res.data
						lang:
							common: langResourceCommon
							campaign: langResourceCampaign
					_setCode res.data.html
					if 'CODE' is rfl.localStorage.get 'PREFER_CONTENT_EDITOR'
						_switchTab '2'
					else
						_switchTab '1'
				else if res.code is rfl.config.RES_CODE.RESOURCE_NOT_EXIST
					rfl.ui.renderInvalidUrl '#main-div'
				else
					rfl.ui.renderPageLoadError '#main-div', content: res.message

	render = () ->
		_codemirror = null
		_ckeditor = null
		_code = null
		rfl.ajax.history.dispatch (args...) ->
			_render.apply null, args

	render: render