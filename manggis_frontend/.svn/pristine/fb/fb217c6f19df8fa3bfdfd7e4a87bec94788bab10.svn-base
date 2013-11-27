define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceGroup = require 'lang/{{G.LANG}}/group'
	Group = require '../models/group'

	class GroupList extends Spine.Controller
		events:
			'click [data-del-btn]': 'del'
			'click [data-toggle-btn]': 'toggle'

		template: require '../views/group-list.tpl.html'

		init: ->
			Group.on 'refresh', @render
			Group.on 'ajaxError ajaxBizError', @ajaxError
			Group.ajaxFetch()

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		render: =>
			@html @template.render groups: Group.all()

		del: (evt) =>
			id = $(evt.target).closest('tr').data 'id'
			group = Group.find id
			rfl.alerts.confirm rfl.util.formatMsg(langResourceGroup.msg.delGroupConfirm, [group.name]),
				() ->
					group.ajaxDestroy
						done: (res) ->
							rfl.alerts.show res.message, 'success'
							Group.ajaxFetch()
				{makeSure: true}

		toggle: (evt) =>
			id = $(evt.target).closest('tr').data 'id'
			group = Group.find id
			group.ajaxToggle
				done: (res) =>
					rfl.alerts.show res.message, 'success'
					@render()

	GroupList