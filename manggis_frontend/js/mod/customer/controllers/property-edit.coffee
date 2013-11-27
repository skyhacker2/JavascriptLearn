define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	formUtil = require 'form-util'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceCustomer = require 'lang/{{G.LANG}}/customer'
	Property = require '../models/property'

	class PropertyEdit extends Spine.Controller
		@init: (options) ->
			@instance = new PropertyEdit(options)

		@changeDataType: (type) ->
			type ?= $('#edit-property-dataType', @instance?.el).val()
			if type is 'SET' or type is 'MULTISET'
				@instance?.showSetForm()
			else
				@instance?.hideSetForm()

		elements:
			'#edit-set-form': 'elSetForm'

		events:
			'submit form': 'save'
			'click [data-save-btn]': 'save'
			'click [data-cancel-btn]': 'cancel'
			'click [data-del-set-btn]': 'delSetItem'

		template: require '../views/property-edit.tpl.html'

		init: ->
			Property.on 'refresh', @render
			Property.on 'ajaxError ajaxBizError', @ajaxError

			@routes
				'!/:listId/:propertyId': (params) =>
					@listId = params.listId
					Property.setListId @listId
					Property.ajaxFetch 
						ajax:
							id: params.propertyId
				'!/:listId': (params) =>
					@listId = params.listId
					Property.setListId @listId
					@render()
				'*glob': (params) =>
					rfl.ui.renderInvalidUrl '#main-div'
			Spine.Route.setup()
			formUtil.setCommonMsg langResourceCommon.msg.validator

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		render: =>
			property = Property.first()
			@html @template.render
				isEdit: !!property
				listId: @listId
				property: property or {}
			formUtil.initPlaceHolder $('#edit-property-form .place-holder-input', @el)
			PropertyEdit.changeDataType()

		showSetForm: ->
			@elSetForm.show()
			formUtil.focus $('#edit-property-set', @el)

		hideSetForm: ->
			@elSetForm.hide()

		delSetItem: (evt) =>
			i = $(evt.currentTarget).data 'index'
			property = Property.first()
			items = property.items;
			item = items[i]
			if item
				items.splice i, 1
				$('#existing-property-set-div', @el).html require('../views/property-edit-set.tpl.html').render
					property: property

		save: (evt) =>
			evt?.preventDefault()
			valid = formUtil.validate $('#edit-property-form', @el)
			if not valid.passed
				formUtil.focus valid.failList[0].item
				return
			items = []
			property = Property.first()
			if property
				$('#existing-property-set-div', @el).find('input').each (i, item) ->
					items.push
						id: $(item).data('id')
						value: item.value
			if (valid.data.propertyType is 'SET' or valid.data.propertyType is 'MULTISET') and not items.length and not valid.data.items.length
				formUtil.focus $('#edit-property-set', @el)
				formUtil.highLight $('#edit-property-set', @el), langResourceCommon.msg.validator.mandatory
				return
			items.push(value: val) for val in valid.data.items
			if property
				property.fromForm('#edit-property-form')
				.load
					items: items
				.ajaxUpdate
					done: =>
						rfl.util.gotoUrl "customer/property-list#!/#{@listId}"
			else
				property = new Property()
				property.fromForm('#edit-property-form')
				.load
					items: items
				.ajaxCreate
					done: =>
						rfl.util.gotoUrl "customer/property-list#!/#{@listId}"

		cancel: =>
			rfl.util.gotoUrl "customer/property-list#!/#{@listId}"

	PropertyEdit
