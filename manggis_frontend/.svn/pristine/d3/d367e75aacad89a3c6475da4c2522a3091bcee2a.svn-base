define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceUser = require 'lang/{{G.LANG}}/user'
	User = require '../models/user'
	Group = require '../../group/models/group'

	class UserList extends Spine.Controller
		@init: (options) ->
			@instance = new UserList(options)

		@changeGroup: (groupId = '') ->
			routeParams = @instance.routeParams.concat()
			routeParams[3] = groupId
			@instance.navigate '!/' + routeParams.join('/')

		events:
			'click [data-del-btn]': 'del'
			'click [data-toggle-btn]': 'toggle'

		template: require '../views/user-list.tpl.html'

		init: ->
			User.on 'refresh', @userRefresh
			User.on 'ajaxError ajaxBizError', @ajaxError

			if rfl.auth.getData('currentGroup').superGroup
				@groupFetchPromise = Group.ajaxFetch()

			@routes
				'*glob': (params) =>
					@routeParams = params.glob.replace(/^!?\/?/, '').split '/'
					@fetchUsers()
			Spine.Route.setup()

		ajaxError: (record, type, res, status, xhr) =>
			if not rfl.ajax.dealCommonCode res.code
				rfl.alerts.show res.message or langResourceCommon.msg.serverBusy, 'error'

		fetchUsers: ->
			((page, sortKey = '', sortOrder, groupId = '', searchText = '') ->
				page = page or 1
				User.ajaxFetch
					clear: true
					ajax:
						data:
							pageNumber: page - 1
							pageSize: G.ITEMS_PER_PAGE
							property: sortKey
							direction: if sortOrder is 'asc' then 'asc' else 'desc'
							groupId: groupId
							criteriaString: decodeURIComponent searchText
			).apply @, @routeParams

		userRefresh: =>
			if rfl.auth.getData('currentGroup').superGroup
				@groupFetchPromise.done (res) =>
					if res.code is 0
						@render()
			else
				@render()

		render: =>
			((page = 1, sortKey = '', sortOrder = '', groupId = '', searchText = '') ->
				@html @template.render
					ajaxPagerUrlPattern: ['/{{page}}', sortKey, sortOrder, groupId, searchText].join('/')
					lang: {common: langResourceCommon, user: langResourceUser}
					users: User.all()
					totalItems: User.total
					groups: Group.all()
					currentGroup: rfl.auth.getData('currentGroup')
					currentUserId: rfl.auth.getData('id')
					#
					page: parseInt page or 1
					sortKey: sortKey
					sortOrder: sortOrder
					groupId: groupId
					searchText: searchText
			).apply @, @routeParams

		del: (evt) =>
			id = $(evt.target).closest('tr').data 'id'
			user = User.find id
			rfl.alerts.confirm rfl.util.formatMsg(langResourceUser.msg.delUserConfirm, [user.email]),
				() =>
					user.ajaxDestroy
						done: (res) =>
							rfl.alerts.show res.message, 'success'
							@fetchUsers()
				{makeSure: true}

		toggle: (evt) =>
			id = $(evt.target).closest('tr').data 'id'
			user = User.find id
			user.ajaxToggle
				done: (res) =>
					rfl.alerts.show res.message, 'success'
					@render()

	UserList