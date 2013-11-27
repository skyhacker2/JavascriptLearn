define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceAdRemark = require 'lang/{{G.LANG}}/ad-remark'
	AdRemark = require '../models/ad-remark'
	Domain = require '../models/domain'
	AutoComplete = require 'auto-complete'
	Dialog = require './dialog'

	class AdRemarkList extends Spine.Controller

		events:
			'click [data-create-btn]': 'create'
			'click [data-edit-btn]': 'edit'
			'click [data-del-btn]': 'del'

		template: require '../views/ad-remark-list.tpl.html'
		dialogTpl : require '../views/ad-remark-dialog.tpl.html'

		init: ->
			AdRemark.on 'refresh', @render
			AdRemark.on 'ajaxError ajaxBizError', @ajaxError
			AdRemark.on 'ajaxSuccess', @ajaxSuccess
			@routes
				'*glob': (params) =>
					@routeParams = params.glob.replace(/^!?\/?/, '').split '/'
					@fetchAdRemarks()
			Spine.Route.setup()
			#AdRemark.ajaxFetch()

		fetchAdRemarks: ->
			((page,sortKey='',sortOrder) ->
				page = page or 1
				AdRemark.ajaxFetch
					clear: true
					ajax:
						data:
							pageNumber: page - 1
							pageSize: G.ITEMS_PER_PAGE
							property: sortKey
							direction: if sortOrder is 'asc' then 'asc' else 'desc'
			).apply @, @routeParams

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		ajaxSuccess: (record, type, res, stauts, xhr) =>
			if type is 'update' or type is 'create' or type is 'destroy'
				if res.code is 0
					rfl.alerts.show res.message, 'success'
				else
					rfl.alerts.show res.message, 'error'
		render:=>
			console.log 'render'
			((page=1,sortKey='',sortOrder) ->
				console.log AdRemark.all()
				@html @template.render 
					adRemarks: AdRemark.all()
					totalItems: AdRemark.total
					page: parseInt page or 1
					sortOrder:sortOrder
					sortKey:sortKey
			).apply @,@routeParams
			

		create:(evt)->
			dialog = new Dialog
			dialog.show()

		edit:(evt)=>
			id = $(evt.target).closest('tr').data 'id'
			adRemark = AdRemark.find id
			dialog = new Dialog
			dialog.show(adRemark)

		del:(evt)=>
			id = $(evt.target).closest('tr').data 'id'
			adRemark = AdRemark.find id
			rfl.alerts.confirm rfl.util.formatMsg(langResourceAdRemark.msg.delUserConfirm, [adRemark.domains, adRemark.remark]), 
				()-> 
					adRemark.ajaxDestroy()
				makeSure:true

	AdRemarkList
