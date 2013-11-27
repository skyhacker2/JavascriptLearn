define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	PairBox = require 'pair-box'
	formUtil = require 'form-util'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceRole = require 'lang/{{G.LANG}}/role'
	Role = require '../models/role'
	PermissionGroup = require '../models/permission-group'

	class RoleEdit extends Spine.Controller
		events:
			'submit form': 'save'
			'click [data-save-btn]': 'save'
			'click [data-cancel-btn]': 'cancel'
			'click [data-add-all-btn]': 'addAllPermission'
			'click [data-remove-all-btn]': 'removeAllPermission'

		template: require '../views/role-edit.tpl.html'

		init: ->
			Role.on 'refresh', @render
			Role.on 'ajaxError ajaxBizError', @ajaxError
			PermissionGroup.on 'refresh', @renderPermission
			PermissionGroup.on 'ajaxError ajaxBizError', @ajaxError
			@routes
				'!/:id': (params) =>
					Role.ajaxFetch 
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
			role = Role.first()
			@html @template.render
				isEdit: !!role
				data: role or {}
			@pairBox.destroy() if @pairBox
			PermissionGroup.ajaxFetch()

		renderPermission: =>
			role = Role.first()
			@pairBox = new PairBox '#available-permissions', '#selected-permissions', PermissionGroup.all(), 
				selectedDataList: PermissionGroup.getGroups role?.permissionIds or []
				getStdItem: (item) ->
					id: item.id
					name: item.name
					children: item.permissions
				setChildren: (item, children) ->
					item.permissions = children

		addAllPermission: =>
			@pairBox?.addAll()

		removeAllPermission: =>
			@pairBox?.removeAll()

		save: (evt) =>
			evt.preventDefault()
			valid = formUtil.validate '#edit-role-form'
			if not valid.passed
				formUtil.focus valid.failList[0].item
				return
			permissionIds = PermissionGroup.getPermissionIds @pairBox.getSelectedDataList()
			role = Role.first()
			if role
				role.fromForm('#edit-role-form')
				.load(permissionIds: permissionIds)
				.ajaxUpdate
					done: ->
						rfl.util.gotoUrl 'role/list'
			else
				role = new Role()
				role.fromForm('#edit-role-form')
				.load(permissionIds: permissionIds)
				.ajaxCreate
					done: ->
						rfl.util.gotoUrl 'role/list'

		cancel: =>
			rfl.util.gotoUrl 'role/list'

	RoleEdit