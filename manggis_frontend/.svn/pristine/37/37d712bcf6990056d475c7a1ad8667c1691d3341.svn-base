define (require) ->
	Spine = require 'spine'

	class PermissionGroup extends Spine.Model
		@configure 'PermissionGroup', 'name', 'permissions'

		@extend Spine.Model.Ajax
		@include Spine.Model.Ajax

		@getGroups: (permissionIds) ->
			groups = @all()
			permissionGroupMap = {}
			permissionIdMap = {}
			for group in groups
				for permission in group.permissions
					permissionGroupMap[permission.id] = group
					permissionIdMap[permission.id] = permission
			selectedGroup = {}
			for permId in permissionIds
				group = permissionGroupMap[permId];
				selectedGroup[group.id] ?= 
					id: group.id
					name: group.name
					permissions: []
				selectedGroup[group.id].permissions.push permissionIdMap[permId]
			res = []
			res.push group for groupId, group of selectedGroup
			res

		@getPermissionIds: (groups) ->
			res = []
			for group in groups
				for permission in group.permissions
					res.push permission.id
			res

	PermissionGroup