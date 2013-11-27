define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	fullScreenPage = require 'mod/nav-bar/full-screen-page'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './edit-overview.tpl.html'

	_marks = null
	_data = null

	_bindEvent = () ->
		rfl.Delegator.getPageDelegator().delegate 'click', 'returnToManageCampaigns',
			(evt) ->
				pageData = rfl.pageStorage.get()
				if _marks[4] is 'list'
					history.back()
					setTimeout ->
						rfl.util.gotoUrl "campaign/list#!#{pageData.urlParams.listId}"
					, 1000
				else
					rfl.util.gotoUrl "campaign/list#!#{pageData.urlParams.listId}"
			, 1
		.delegate 'click', 'overviewPreviewHtml',
			(evt) ->
				require ['./preview-main'], (mod) ->
					pageData = rfl.pageStorage.get()
					mod.init pageData.urlParams.listId, _marks[3]
		.delegate 'click', 'overviewUploadSendSample',
			(evt) ->
				require ['./sample-sender-main'], (sender) ->
					pageData = rfl.pageStorage.get()
					sender.show(pageData.urlParams.listId, _marks[3])
			, 1
		.delegate 'click', 'overviewPreviewPlainText',
			(evt) ->
				if $('.popover:visible', $(this).parent()).length
					$(this).popover 'hide'
					return
				self = this
				pageData = rfl.pageStorage.get()
				rfl.ajax.post
					url: "lists/campaigns/#{_marks[3]}/previewPlainText"
					success: (res) ->
						if res.code is 0
							$(self).popover
								html: true
								animation: false
								trigger: 'mannual'
								content: res.data.plainText.replace /\n/g, '<br />'
							$(self).popover 'show'
							$('.popover', $(self).parent()).css
								width: '600px'
								maxWidth: '600px'
							$('.popover-content', $(self).parent()).css
								maxHeight: '400px'
								overflowY: 'auto'
							$(self).popover 'show'
							$(document).on 'click', hidePopover = (evt) ->
								if $(evt.target).hasClass('popover') or $(evt.target).closest('.popover').length
									return
								$(self).popover 'hide'
								$(document).off 'click', hidePopover 
						else
							rfl.alerts.show res.message, 'error'
					error: () ->
						rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'
		_bindEvent = rfl.empty

	_render = (mark, action = 'view', base64Info, step, sid, from) ->
		if not sid
			rfl.ui.renderInvalidUrl '#main-div'
			return
		_marks = [action, base64Info, step, sid, from]
		pageData = rfl.pageStorage.get() or {}
		_bindEvent()
		editable = 
		rfl.ajax.get
			url: "lists/campaigns/#{_marks[3]}/overview"
			success: (res) ->
				if res.code is 0
					_data = res.data
					readyToDeliver = _data.campaign.subject && (_data.campaign.fromName && _data.campaign.fromEmail) && (_data.campaign.replyToName && _data.campaign.replyToEmail) && _data.htmlDefined
					editable = _data.status in ['DRAFT', 'PENDING']
					$('#main-div').html mainTpl.render
						listId: pageData.urlParams.listId
						marks: _marks
						urlParams: pageData.urlParams
						data: _data
						readyToDeliver: readyToDeliver,
						editable: editable
						lang:
							common: langResourceCommon
							campaign: langResourceCampaign
					, util: rfl.util
					fullScreenPage.checkScroll '.app-content-wrapper'
					if editable
						if readyToDeliver
							require ['./edit-delivery-main'], (mod) ->
								mod.render '.delivery-rule', $.extend({listId: pageData.urlParams.listId, campaignId: sid}, _data.delivery)
					else
						#TODO
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