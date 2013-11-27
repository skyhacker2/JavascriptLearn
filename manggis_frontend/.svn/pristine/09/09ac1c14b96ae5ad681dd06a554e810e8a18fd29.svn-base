define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	PairBox = require 'pair-box'
	AutoComplete = require 'auto-complete'
	formUtil = require 'form-util'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceUser = require 'lang/{{G.LANG}}/user'
	User = require '../models/user'
	Group = require '../../group/models/group'
	Role = require '../../role/models/role'

	class UserEdit extends Spine.Controller
		@init: (options) ->
			@instance = new UserEdit(options)

		events:
			'submit form': 'save'
			'click [data-save-btn]': 'save'
			'click [data-cancel-btn]': 'cancel'
			'click [data-add-all-btn]': 'addAllGroup'
			'click [data-remove-all-btn]': 'removeAllGroup'
			'click [data-show-ac-btn]': 'showAutoCompleteBox'
			'click': 'hideAutoCompleteBox'

		template: require '../views/user-edit.tpl.html'

		init: ->
			User.on 'refresh', @userRefresh
			User.on 'ajaxError ajaxBizError', @ajaxError

			if rfl.auth.getData('currentGroup').superGroup
				@groupFetchPromise = Group.ajaxFetch()
			@roleFetchPromise = Role.ajaxFetch()

			@routes
				'!/:id': (params) =>
					User.ajaxFetch 
						ajax:
							id: params.id
				'*glob': (params) =>
					if params.glob
						rfl.ui.renderInvalidUrl '#main-div'
					else
						@userRefresh()
			Spine.Route.setup()
			formUtil.setCommonMsg langResourceCommon.msg.validator

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		userRefresh: ()=>
			if rfl.auth.getData('currentGroup').superGroup
				@groupFetchPromise.done (res) =>
					if res.code is 0
						@render()
			else
				@render()

		render: =>
			#rfl.auth.getData('currentGroup').superGroup = false
			user = User.first()
			@html @template.render
				isEdit: !!user
				data: user or {}
			if rfl.auth.getData('currentGroup').superGroup
				@renderGroup()
			else
				@initAutoComplete '#edit-user-roles',
					excludeExist: true
					nameMaxLength: 70
					initData: user?.groups?[0]?.roles or [], 
					listStyle: width: '542px'
					onKeydown: (evt) =>
						if evt.keyCode is 13 and not @autoComplete.isListShown()
							@save()

		renderGroup: ->
			user = User.first()
			groups = Group.all()
			selectedDataList = user?.groups
			selectedDataList ?= if groups.length is 1 then [groups[0]] else []
			@pairBox.destroy() if @pairBox
			@pairBox = new PairBox '#available-groups', '#selected-groups', groups, 
				selectedDataList: selectedDataList
				selectedListTpl: require '../views/user-edit-selected-groups.tpl.html'

		initAutoComplete: (box, opt, callback) ->
			@roleFetchPromise.done (res) =>
				if res.code is 0
					@autoComplete = new AutoComplete box, $.extend
						richSelectionResult: true
						listMaxLength: 6
						listTpl: require '../views/user-edit-auto-complete-list.tpl.html'
						dataSource: Role.all()
					, opt
					callback?()

		showAutoCompleteBox: (evt) =>
			evt.stopPropagation()
			target = evt.currentTarget
			groupId = $(target).data 'id'
			offset = $(target).offset()
			@curEditGroup = @pairBox.getSelectedItemById groupId
			doShow = () =>
				$(target).css 'visibility', 'hidden'
				@autoCompleteBox.css
					left: (offset.left + 10) + 'px'
					top: (offset.top + 2) + 'px'
				@autoCompleteBox.show()
				setTimeout () =>
					@autoCompleteBox.find('input')[0].focus()
				 200
			if not @autoCompleteBox
				@autoCompleteBox = $('<div class="form-inline float-auto-complete-box" style="position: absolute; display: none;"><input type="text" class="form-control" data-rfl-cancel-bubble="click" style="margin-bottom: 5px; width: 300px;" /> <button class="btn btn-default close-float-auto-complete-box-btn" style="margin-bottom: 5px;">' + langResourceCommon.label.done + '</button></div>').appendTo @el
				@initAutoComplete @autoCompleteBox.find('input'),
					richSelectionResult: true
					nameMaxLength: 36
					initData: @curEditGroup.roles
					listStyle: width: '282px'
					onKeydown: (evt) =>
						if evt.keyCode is 13 && not @autoComplete.isListShown()
							@hideAutoCompleteBox evt
				, () ->
					doShow()
			else
				doShow()
				@autoComplete.setSelectedData @curEditGroup.roles

		hideAutoCompleteBox: (evt) =>
			return if not @autoCompleteBox
			return if $(evt.target.parentNode).hasClass 'auto-complete-rich-item'
			return if evt.type is 'click' and $(evt.target).closest('.float-auto-complete-box').length and not $(evt.target).hasClass 'close-float-auto-complete-box-btn'
			@curEditGroup.roles = @autoComplete.getSelectedDataList()
			@pairBox.render()
			@autoCompleteBox.hide()

		addAllGroup: =>
			@pairBox?.addAll()

		removeAllGroup: =>
			@pairBox?.removeAll()

		save: (evt) =>
			evt?.preventDefault()
			valid = formUtil.validate '#edit-user-form'
			if not valid.passed
				formUtil.focus valid.failList[0].item
				return
			groups = if rfl.auth.getData('currentGroup').superGroup then @pairBox.getSelectedDataList (item) ->
				res = id: item.id, roleIds: []
				if item.roles
					res.roleIds.push role.id for role in item.roles
				res
			else []
			roleIds = if rfl.auth.getData('currentGroup').superGroup then [] else @autoComplete.getSelectedPropList 'id'
			user = User.first()
			if user
				user.fromForm('#edit-user-form')
				.load
					groups: groups
					roleIds: roleIds
				.ajaxUpdate
					done: ->
						rfl.util.gotoUrl 'user/list'
			else
				user = new User()
				user.fromForm('#edit-user-form')
				.load
					groups: groups
					roleIds: roleIds
				.ajaxCreate
					done: ->
						rfl.util.gotoUrl 'user/list'

		cancel: =>
			rfl.util.gotoUrl 'user/list'

	UserEdit