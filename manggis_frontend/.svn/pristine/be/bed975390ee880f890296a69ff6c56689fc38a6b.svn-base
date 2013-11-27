define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	formUtil = require 'form-util'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceGroup = require 'lang/{{G.LANG}}/group'
	Group = require '../models/group'

	class GroupEdit extends Spine.Controller
		events:
			'submit form': 'save'
			'click [data-save-btn]': 'save'
			'click [data-cancel-btn]': 'cancel'

		template: require '../views/group-edit.tpl.html'

		init: ->
			Group.on 'refresh', @render
			Group.on 'ajaxError ajaxBizError', @ajaxError
			@routes
				'!/:id': (params) =>
					Group.ajaxFetch 
						ajax:
							id: params.id
				'*glob': (params) =>
					if params.glob
						rfl.ui.renderInvalidUrl '#main-div'
					else
						@render()
			Spine.Route.setup()
			formUtil.setCommonMsg langResourceCommon.msg.validator

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		render: =>
			group = Group.first()
			@html @template.render
				isEdit: !!group
				data: group or {}

		save: (evt) =>
			evt.preventDefault()
			valid = formUtil.validate '#edit-group-form'
			if not valid.passed
				formUtil.focus valid.failList[0].item
				return
			group = Group.first()
			if group
				group.fromForm('#edit-group-form').ajaxUpdate
					done: ->
						rfl.util.gotoUrl 'group/list'
			else
				group = new Group()
				group.fromForm('#edit-group-form').ajaxCreate
					done: ->
						rfl.util.gotoUrl 'group/list'

		cancel: =>
			rfl.util.gotoUrl 'group/list'

	GroupEdit