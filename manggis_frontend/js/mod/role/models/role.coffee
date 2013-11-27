define (require) ->
	Spine = require 'spine'

	class Role extends Spine.Model
		@configure 'Role', 'name', 'description', 'superRole', 'permissionIds'

		@extend Spine.Model.Ajax
		@include Spine.Model.Ajax

	Role