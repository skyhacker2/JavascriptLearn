define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceRole = require 'lang/{{G.LANG}}/role'
	Role = require '../models/role'

	class RoleList extends Spine.Controller
		events:
			'click [data-del-btn]': 'del'

		template: require '../views/role-list.tpl.html'

		init: ->
			Role.on 'refresh', @render
			Role.on 'ajaxError ajaxBizError', @ajaxError
			Role.ajaxFetch()

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		render: =>
			@html @template.render roles: Role.all()

		del: (evt) =>
			id = $(evt.target).closest('tr').data 'id'
			role = Role.find id
			rfl.alerts.confirm rfl.util.formatMsg(langResourceRole.msg.delRoleConfirm, [role.name]),
				() ->
					role.ajaxDestroy
						done: (res) ->
							rfl.alerts.show res.message, 'success'
							Role.ajaxFetch()
				{makeSure: true}

	RoleList