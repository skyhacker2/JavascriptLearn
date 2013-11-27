define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	formUtil = require 'form-util'
	AutoComplete = require 'auto-complete'
	TimePicker = require 'timepicker'
	fullScreenPage = require 'mod/nav-bar/full-screen-page'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './edit-delivery.tpl.html'

	_data = null
	_groupMap = null
	_timePicker = null
	_complainNum = null
	_newlyNum = null
	_dialog = null

	_deliver = ->
		rfl.ajax.history.dispatch (mark, action, base64Info, step, sid) ->
			pageData = rfl.pageStorage.get()
			rfl.ajax.put
				url: "lists/campaigns/#{sid}/send"
				success: (res) ->
					if res.code is 0
						require ['./edit-overview-main'], (mod) ->
							mod.render()
						_dialog.modal 'hide'
					else
						rfl.alerts.show res.message, 'error'
				error: () ->
					rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'

	_validateRecipients = ->
		deliverToAll = not _data.oneTime and rfl.mockupFormControl.getRadioValue('deliverTo') is 'all'
		customerGroups = if _data.oneTime or deliverToAll then [] else _groupMap.getSelected 'id'		
		if not _data.oneTime and not deliverToAll and not customerGroups.length
			formUtil.highLight '#delivery-groups', langResourceCommon.msg.validator.mandatory
			formUtil.focus '#delivery-groups'
			return false
		else
			formUtil.dehighLight '#delivery-groups'
			return true

	_doSave = (data, callback) ->
		rfl.ajax.history.dispatch (mark, action, base64Info, step, sid) ->
			pageData = rfl.pageStorage.get()
			deliverToAll = not _data.oneTime and rfl.mockupFormControl.getRadioValue('deliverTo') is 'all'
			skipComplainedCustomer = $('#skipComplainedCustomer')[0].checked
			customerGroups = if _data.oneTime or deliverToAll then [] else _groupMap.getSelected 'id'
			rfl.ajax.put
				url: "lists/campaigns/#{sid}/delivery"
				data: $.extend data, {deliverToAll: deliverToAll, customerGroups: customerGroups, skipComplainedCustomer: skipComplainedCustomer}
				success: (res) ->
					if res.code is 0
						callback res
					else
						rfl.alerts.show res.message, 'error'
				error: () ->
					rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'

	_save = () ->
		hasError = false
		data = null
		deliverImmediately = $('input[value="immediate"]')[0].checked
		if deliverImmediately
			if _validateRecipients()
				data = deliverImmediately: true
			else
				hasError = true
		else
			date = $('#delivery-date').closest('.input-group').data('date-value')
			time = _timePicker.getMs()
			if not _validateRecipients()
				hasError = true
			if not $('#delivery-date').val()
				formUtil.highLight '#delivery-date', langResourceCommon.msg.validator.mandatory
				hasError = true
			else
				formUtil.dehighLight '#delivery-date'
			if time is -1
				formUtil.highLight '#time-picker', langResourceCommon.msg.validator.mandatory
				hasError = true
			else
				formUtil.dehighLight '#time-picker'
			if not hasError
				scheduleDate = date + time
				rfl.pageStorage.set scheduleDate: scheduleDate
				data = {deliverImmediately: false, scheduleDate: scheduleDate}
		if hasError
			return
		_doSave data, (res) ->
			_dialog = rfl.dialog.create
				content: 'Are you sure you want to deliver this campaign?'
				btns: [
					{
						text: "Let's go!",
						className: 'btn-primary',
						click: () ->
							_deliver()
					},
					{
						text: 'Cancel',
						dismiss: true
					}
				]

	_initComplain = () ->
		setTimeout () ->
			$('#complain').popover
				container: 'body'
				placement: 'top'
				trigger: 'hover'
				content: 'Complained customer is the people who report your letter as spam before.'
		, 500

	_showComplaintAndNewCustomer = (data) ->
		if data.noOfNewCustomer is 0
			$('#complain-note').hide();
		else
			$('#complain-num').html data.noOfComplaint
			$('#complain-note').show();
		if data.noOfNewCustomer is 0
			$('#newly-import-note').hide();
		else if not rfl.localStorage.get('ignore-newly-import-note')
			$('#newly-num').html data.noOfNewCustomer
			$('#newly-import-note').show();

	_askComplaint = () ->
		pageData = rfl.pageStorage.get()
		if _data.oneTime
			rfl.ajax.get
				url: "lists/campaigns/#{_data.campaignId}/calculateComplained"
				success: (res) ->
					if res.code is 0
						_showComplaintAndNewCustomer res.data
					else
						rfl.alerts.show res.message, 'error'
		else
			deliverToAll = rfl.mockupFormControl.getRadioValue('deliverTo') is 'all'
			customerGroups = []
			if not deliverToAll
				if not _groupMap
					return
				if not customerGroups.length
					$('#complain-note').hide();
					$('#newly-import-note').hide();
					return
				customerGroups = _groupMap.getSelected 'id'
			rfl.ajax.get
				url: "lists/#{pageData.urlParams.listId}/calculateComplained"
				data: 
					scope: if deliverToAll then 'all' else 'groups'
					customerGroups: customerGroups
				success: (res) ->
					if res.code is 0
						_showComplaintAndNewCustomer res.data
					else
						rfl.alerts.show res.message, 'error'

	_initGroupMap = () ->
		pageData = rfl.pageStorage.get() or {}
		require ['../customer/group-map-main', 'ajax!' + G.getAjaxLoadUrl('lists/' + pageData.urlParams.listId + '/groups')], (GroupMap, data) ->
			groups = data.data.groups
			if _groupMap or rfl.ajax.dealCommonCode(data.code) or data.code isnt 0
				return
			_groupMap = new GroupMap '.delivery-group-selection', groups, 
				listId: pageData.urlParams.listId,
				maxSelection: 999,
				editable: true,
				selected: _data.customerGroups
				onSelect: _askComplaint
			_askComplaint()

	_bindEvent = () ->
		rfl.Delegator.getPageDelegator().delegate 'click', 'saveCampaignDelivery',
			(evt, nextStep) ->
				_save nextStep
			, 2
		.delegate 'click', 'doNotShowAgain',
			(evt) ->
				rfl.localStorage.set('ignore-newly-import-note', 1);
				$('#newly-import-note').hide()
			, 1
		rfl.mockupFormControl.on 'toggle-radio', (evt) ->
			target = evt.target
			if target.name == 'deliverType'
				if target.value == 'immediate'
					$('.delivery-schedule-setting').fadeOut()
				else
					$('.delivery-schedule-setting').fadeIn()
			else if target.name == 'deliverTo'
				if target.value == 'all'
					$('.delivery-group-selection').fadeOut()
				else
					$('.delivery-group-selection').fadeIn()
					_initGroupMap()
				_askComplaint()
		_bindEvent = rfl.empty

	_initDatepicker = () ->
		rfl.css.load 'js/lib/datepicker/main.css'
		require ['datepicker'], (dp) ->
			$('#delivery-date').closest('.input-group').datepicker(
				onRender: (date) ->
					now = rfl.util.getSvrTime() - 1000 * 3600 * 24
					if date.getTime() < now then 'disabled' else ''
			).on 'changeDate', (evt) ->
				if evt.viewMode is 'days'
					$('#delivery-date').closest('.input-group').datepicker 'hide'
			$('#delivery-date').on 'click', (evt) ->
				$('#delivery-date').closest('.input-group').datepicker 'show'

	_renderOneTimeInfo = () ->
		require ['ajax!' + G.getAjaxLoadUrl('lists/jobs/' + _data.importJobId), './edit-delivery-one-time-main.tpl.html'], (jobRes, oneTimeTmpl) ->
			if jobRes.code is 0
				$('#one-time-info').html oneTimeTmpl.render 
					listId: _data.listId,
					data: jobRes.data
				if jobRes.data.info.added > 0
					_askComplaint()
			else
				rfl.alerts.show jobRes.message, 'error'
		, () ->
			rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'

	render = (container, data) ->
		pageData = rfl.pageStorage.get() or {}
		_data = data
		_groupMap = null
		_bindEvent()
		$(container).html mainTpl.render
			listId: pageData.urlParams.listId
			urlParams: pageData.urlParams
			data: data
			dateFormat: 'yyyy-MM-dd'
			lang:
				common: langResourceCommon
				campaign: langResourceCampaign
		, util: rfl.util
		_initComplain()
		if data.oneTime
			_renderOneTimeInfo()
		else if !data.deliverToAll and data.customerGroups.length
			_initGroupMap()
		_timePicker = new TimePicker '#time-picker',
			id: 'delivery-time'
			initValue: data.scheduleDate
		_initDatepicker()

	render: render