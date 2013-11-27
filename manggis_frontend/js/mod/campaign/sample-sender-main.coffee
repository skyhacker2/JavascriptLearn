define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	formUtil = require 'form-util'
	AutoComplete = require 'auto-complete'
	langResourceCommon = require "../../lang/#{G.LANG}/common"
	langResourceCampaign = require "../../lang/#{G.LANG}/campaign"
	mainTpl = require './sample-sender.tpl.html'

	_dialog = null
	_emailAc = null
	_customerHistoryAc = null
	_customerAc = null

	_bindEvent = () ->
		rfl.Delegator.getPageDelegator().delegate 'click', 'xxx',
			(evt, type) ->
				1
			, 1
		rfl.ajax.history.on 'change', (evt) ->
			_dialog.modal 'hide' if _dialog
		_bindEvent = rfl.empty

	_initCustomerHistoryAc = (selectFirst) ->
		dataSource = rfl.util.getLocalStoredList('FREQUENTLY_USED_CUSTOMER_LIST')
		_customerHistoryAc.destroy() if _customerHistoryAc
		_customerHistoryAc = new AutoComplete '#send-sample-customer',
			freeInput: true
			disableFilter: true
			maxSelection: 1
			listStyle: width: 340
			dataSource: dataSource
			getStdItem: (item, from) ->
				return {id: item.id, name: if from is 'LIST' then "#{item.firstName} #{item.lastName} <#{item.email}>" else item.email}
			onSelect: (item) ->
				_customerAc.match item.email, (customers, input) ->
					if not customers.length
						rfl.util.removeFromLocalStoredList 'FREQUENTLY_USED_CUSTOMER_LIST', email: input,
							comparer: (a, b) ->
								return a.email is b.email
						_initCustomerHistoryAc()
					_customerAc.renderList customers, 
						matchedInput: input
						autoSelect: true
		if selectFirst and dataSource.length
			_customerAc.match dataSource[0].email, (customers, input) ->
				if not customers.length
					rfl.util.removeFromLocalStoredList 'FREQUENTLY_USED_CUSTOMER_LIST', email: input,
						comparer: (a, b) ->
							return a.email is b.email
					_initCustomerHistoryAc true
				_customerAc.renderList customers, 
					matchedInput: input
					autoSelect: true

	show = (listId, campaignId, content, onSuccess) ->
		_bindEvent()
		_dialog = rfl.dialog.create
			show: false
			title: 'Send yourself a test email'
			content: mainTpl.render(),
			btns: [
				{
					text: 'Send'
					className: 'btn-primary'
					click: () ->
						formUtil.setCommonMsg langResourceCommon.msg.validator
						valid = formUtil.validate '#send-sample-form'
						if valid.passed
							emailList = $('#send-sample-emails').val().split /\s*;\s*/
							rfl.ajax.post
								url: "lists/campaigns/#{campaignId}/sendSample"
								data: 
									sendToEmails: emailList
									mergeCustomerId: _customerAc and _customerAc.getSelectedPropList('id')[0] or ''
									html: content || ''
								success: (res) ->
									if res.code is 0
										rfl.util.unshiftLocalStoredList 'SEND_SAMPLE_EMAIL_LIST', email for email in emailList
										_dialog.modal 'hide'
										if onSuccess
											onSuccess res, $('#send-sample-emails').val()
										else
											rfl.alerts.show res.message, 'success'
									else
										rfl.alerts.show res.message,
											type: 'error'
											container: '#send-sample-form'
								error: () ->
									rfl.alerts.show langResourceCommon.msg.serverBusy,
										type: 'error'
										container: '#send-sample-form'
						else
							formUtil.focus valid.failList[0].item
				},
				{
					text: 'Cancel'
					dismiss: true
				}
			]
		_dialog.on 'shown.bs.modal', () ->
			_customerAc = new AutoComplete '#send-sample-customer',
				maxSelection: 1
				listStyle: width: 340
				getStdItem: (item, from) ->
					return {id: item.id, name: if from is 'LIST' then "#{item.firstName} #{item.lastName} <#{item.email}>" else item.email}
				getMatchedList: (input, callback) ->
					rfl.ajax.get
						url: "lists/#{listId}/searchCustomers"
						data: key: input
						success: (res) ->
							if res.code is 0
								if callback
									callback res.data.customers, input
								else
									_customerAc.renderList res.data.customers, matchedInput: input
							else
								_customerAc.renderList null, noResultMsg: res.message
						error: () ->
							_customerAc.renderList null, noResultMsg: langResourceCommon.msg.serverBusy
				onSelect: (item) ->
					rfl.util.unshiftLocalStoredList 'FREQUENTLY_USED_CUSTOMER_LIST', item,
						comparer: (a, b) ->
							return a.email is b.email
					_initCustomerHistoryAc()
			_initCustomerHistoryAc true
			emailList = rfl.util.getLocalStoredList 'SEND_SAMPLE_EMAIL_LIST'
			if emailList.length
				$('#send-sample-emails').val emailList[0] && emailList[0] + '; ' or ''
				if emailList.length > 1
					_emailAc = new AutoComplete '#send-sample-emails',
						freeInput: true
						dataSource: emailList
						listStyle: width: 340
						onBeforeSelect: (item) ->
							if new RegExp('(^|;|,)\\s*' + item.replace(/\./g, '\\.') + '\\s*(;|,|$)').test($('#send-sample-emails').val())
								_emailAc.hideList()
								return false
						getStdItem: (item) ->
							return {id: item, name: item}
					_emailAc.showFullList()
		_dialog.on 'hide', () ->
			_customerHistoryAc.destroy() if _customerHistoryAc
			_customerAc.destroy() if _customerAc
			_emailAc.destroy() if _emailAc
			_customerHistoryAc = null
			_customerAc = null
			_emailAc = null
			_dialog = null
		_dialog.modal 'show'

	show: show