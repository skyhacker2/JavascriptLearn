define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceCustomer = require 'lang/{{G.LANG}}/customer'
	Property = require '../models/property'

	class PropertyList extends Spine.Controller
		@init: (options) ->
			@instance = new PropertyList(options)

		events:
			'click [data-del-btn]': 'del'

		template: require '../views/property-list.tpl.html'

		init: ->
			Property.on 'refresh', @render
			Property.on 'ajaxError ajaxBizError', @ajaxError
			@routes
				'!/:listId': (params) =>
					@listId = params.listId
					Property.setListId @listId
					Property.ajaxFetch()
				'*glob': (params) =>
					rfl.ui.renderInvalidUrl '#main-div'
			Spine.Route.setup()

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		render: =>
			@html @template.render
				listId: @listId
				propertys: Property.all()

		del: (evt) =>
			id = $(evt.target).closest('tr').data 'id'
			property = Property.find id
			rfl.alerts.confirm rfl.util.formatMsg(langResourceCustomer.msg.delPropertyConfirm, [property.name]),
				() ->
					property.ajaxDestroy
						done: (res) ->
							rfl.alerts.show res.message, 'success'
							Property.ajaxFetch()
				{makeSure: true}

	PropertyList