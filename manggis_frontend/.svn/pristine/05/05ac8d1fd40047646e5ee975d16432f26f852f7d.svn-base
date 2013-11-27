define (require) ->
	$ = require 'jquery'
	bt = require 'bootstrap'
	rfl = require 'rfl'
	AutoComplete = require 'auto-complete'
	datapicker = require 'datepicker'
	formUtil = require 'form-util'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './list.tpl.html'
	categoryTpl = require './list-category.tpl.html'
	campaignsTpl = require './list-campaigns.tpl.html'
	firstGuideTpl = require './list-first-guide.tpl.html'
	filterCriteriaTpl = require './list-filter-criteria.tpl.html'
	deleteTpl = require './delete-campaign.tpl.html'

	_listId = ''
	_data = null
	_sideBarPinned = rfl.localStorage.get 'CAMPAIGNS_SIDE_BAR_PINNED'
	_clearCategoryCache = ''
	_statusAutoComplete = null

	_delCampaign = (i) ->
		rfl.util.typeConfirm 'DELETE', deleteTpl.render(_data.campaigns[i]),
			() ->
				rfl.ajax.del
					queueName: 'delCampaign',
					url: "lists/campaigns/#{_data.campaigns[i].id}",
					success: (res) ->
						if res.code is 0
							_clearCategoryCache = 'true'
							rfl.alerts.show res.message, 'success'
							render()
						else
							rfl.alerts.show res.message,'error'
					error: () ->
						rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'

	_abortCampaign = (i) ->
		rfl.alerts.confirm rfl.util.formatMsg(langResourceCampaign.msg.abortCampaignConfirm, [_data.campaigns[i].name]),
			() ->
				rfl.ajax.put
					queueName: 'abortCampaign',
					url: "lists/campaigns/#{_data.campaigns[i].id}/interrupt",
					success: (res) ->
						if res.code is 0
							_clearCategoryCache = 'true'
							rfl.alerts.show res.message, 'success'
							render()
						else
							rfl.alerts.show res.message,'error'
					error: () ->
						rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'
			makeSure: true

	_getBase64Params = (callback) ->
		rfl.util.toBase64 {listId: _listId, listName: _data.listName}, (res) ->
			callback res

	_doFilter = (evt) ->
		valid = formUtil.validate '#campaign-filter-form'
		if not valid.passed
			return
		creationDateFrom = valid.data.creationDateFrom and valid.data.creationDateFrom.getTime() or ''
		creationDateTo = valid.data.creationDateTo and valid.data.creationDateTo.getTime() or ''
		campaignStatus = _statusAutoComplete.getSelectedPropList('id')[0] or ''
		campaignName = encodeURIComponent $.trim $('#filter-campaign-name').val()
		if creationDateFrom and creationDateTo and creationDateTo < creationDateFrom
			formUtil.highLight '#creation-data-to', 'Must be greater than creation date from.'
			return
		rfl.ajax.history.dispatch (mark, listId, status = '', page = '', sortKey = '', sortOrder = '') ->
			rfl.util.gotoUrl "campaign/list#!#{listId}/#{campaignStatus}/#{page}/#{sortKey}/#{sortOrder}/#{creationDateFrom}/#{creationDateTo}/#{campaignName}"
		$(evt.target).closest('.btn-group').removeClass 'open'

	_bindEvent = () ->
		rfl.Delegator.getPageDelegator().delegate 'click', 'createCampaign', 
			(evt, type) ->
				_getBase64Params (res) ->
					if type
						rfl.util.gotoUrl "campaign/edit#!create/#{res}/campaign//#{type}"
					else
						rfl.util.gotoUrl "campaign/edit#!create/#{res}/campaign//regular"
			, 1
		.delegate 'click', 'delCampaign', 
			(evt, i) ->
				campaign = _data.campaigns[i]
				_delCampaign parseInt i
			, 1
		.delegate 'click', 'abortCampaign', 
			(evt, i) ->
				campaign = _data.campaigns[i]
				_abortCampaign parseInt i
			, 1
		.delegate 'click', 'toggleSideBarPin',
			(evt) ->
				if _sideBarPinned
					_sideBarPinned = ''
					rfl.localStorage.set 'CAMPAIGNS_SIDE_BAR_PINNED', _sideBarPinned
					$('#campaign-side-bar').removeClass 'pinned'
				else
					_sideBarPinned = '1'
					rfl.localStorage.set 'CAMPAIGNS_SIDE_BAR_PINNED', _sideBarPinned
					$('#campaign-side-bar').addClass 'pinned'
			, 1
		.delegate 'click', 'previewHtmlContent',
			(evt, i) ->
				campaign = _data.campaigns[i]
				require ['./preview-main'], (mod) ->
					mod.init _listId, campaign.id
		.delegate 'click', 'doFilterCampaigns',
			(evt) ->
				_doFilter(evt)
		.delegate 'keyup', 'keyupFilterCampaigns',
			(evt) ->
				if evt.keyCode is 13
					$('#creation-data-from').closest('.input-group').datepicker 'hide'
					$('#creation-data-to').closest('.input-group').datepicker 'hide'
					_doFilter(evt)
		.delegate 'click', 'removeFilterCriteria',
			(evt, seqs) ->
				seqs = seqs.split '_'
				rfl.ajax.history.dispatch (args...) ->
					args.shift()
					args2 = ((if i + '' in seqs then '' else item) for item, i in args)
					rfl.util.gotoUrl 'campaign/list#!' + args2.join '/'
			, 1
		_bindEvent = rfl.empty

	_renderCategory = (status) ->
		require ['ajax!' + G.getAjaxLoadUrl("lists/#{_listId}/campaignAmountByStatus@noCache=#{_clearCategoryCache}")], (res) ->
			if rfl.ajax.dealCommonCode res.code
				return
			if res.code is 0
				_clearCategoryCache = ''
				list = (item for item, i in res.data when item.status isnt 'ALL' and item.amount > 0)
				_statusAutoComplete and _statusAutoComplete.destroy()
				_statusAutoComplete = new AutoComplete '#filter-campaign-status',
					richSelectionResult: true,
					excludeExist: true,
					maxSelection: 1,
					dataSource: list,
					getRichItemText: (item, stdItem) ->
						return stdItem.name + '(' + item.amount + ')'
					getListItemText: (item, stdItem) ->
						return stdItem.name + '(' + item.amount + ')'
					getStdItem: (item, from) ->
						return {id: item.status, name: langResourceCampaign.status[item.status]}
				if status and status isnt 'ALL'
					_statusAutoComplete.addSelectedItem
						status: status
			else
				rfl.alerts.show res.message, 'error'
		, () ->
			rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'

	_renderFilter = (creationDateFrom, creationDateTo, campaignStatus, campaignName) ->
		$('#filter-criteria-div').html filterCriteriaTpl.render
			creationDateFrom: creationDateFrom and rfl.util.formatDateTime +creationDateFrom, 'yyyy-MM-dd'
			creationDateTo: creationDateTo and rfl.util.formatDateTime +creationDateTo, 'yyyy-MM-dd'
			campaignStatus: campaignStatus
			campaignName: decodeURIComponent campaignName
			lang:
				common: langResourceCommon
				campaign: langResourceCampaign
		if creationDateFrom
			$('#creation-data-from').val rfl.util.formatDateTime +creationDateFrom, 'yyyy-MM-dd'
		else
			$('#creation-data-from').val ''
		if creationDateTo
			$('#creation-data-to').val rfl.util.formatDateTime +creationDateTo, 'yyyy-MM-dd'
		else
			$('#creation-data-to').val ''
		$('#filter-campaign-name').val decodeURIComponent campaignName
		if _statusAutoComplete and not campaignStatus
			_statusAutoComplete.clear()

	_render = (mark, listId, status, page = 1, sortKey = '', sortOrder = '', creationDateFrom = '', creationDateTo = '', campaignName = '') ->
		if not listId
			return rfl.ui.renderInvalidUrl '#main-div'
		G.listId = listId
		_listId = listId
		_bindEvent()
		_renderCategory status
		_renderFilter creationDateFrom, creationDateTo, status, campaignName
		rfl.ajax.get
			url: "lists/#{listId}/campaigns"
			data:
				pageNumber: page - 1
				pageSize: G.ITEMS_PER_PAGE
				property: sortKey
				direction: sortOrder
				status: status
				start: creationDateFrom
				end: creationDateTo
				key: decodeURIComponent campaignName
			success: (res) ->
				if res.code is 0
					_data = res.data
					_getBase64Params (base64Params) ->
						$('#campaign-list-div').html campaignsTpl.render
							listId: listId
							base64Params: base64Params
							campaigns: _data.campaigns
							totalItems: _data.total
							page: page
							ajaxPagerUrlPattern: [listId, status, '{{page}}', sortKey, sortOrder].join('/')
							lang:
								common: langResourceCommon
								campaign: langResourceCampaign
						, util: rfl.util
				else
					rfl.ui.renderPageLoadError '#main-div', content: res.message
			error: (res) ->
				rfl.ui.renderPageLoadError '#main-div'

	render = (args...) ->
		if args.length
			_render.apply null, args
		else 
			rfl.ajax.history.dispatch (args...) ->
				_render.apply null, args

	init = () ->
		return if not rfl.auth.checkAndWarn 'PERM_USER_ADMIN'
		$('#main-div').html mainTpl.render
			listId: ''
			listName: ''
			dateFormat: 'yyyy-MM-dd'
			lang:
				common: langResourceCommon
				campaign: langResourceCampaign
		rfl.ajax.history.init 8, render
		$('#creation-data-from').closest('.input-group').datepicker().on 'changeDate', (evt) ->
			if evt.viewMode is 'days'
				$('#creation-data-from').closest('.input-group').datepicker 'hide'
		$('#creation-data-to').closest('.input-group').datepicker().on 'changeDate', (evt) ->
			if evt.viewMode is 'days'
				$('#creation-data-to').closest('.input-group').datepicker 'hide'
		rfl.css.load 'js/lib/datepicker/main.css'
		formUtil.setCommonMsg langResourceCommon.msg.validator

	init: init