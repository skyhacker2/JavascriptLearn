define (require) ->
	Spine = require 'spine'

	class Group extends Spine.Model
		@configure 'Group', 'name', 'enabled', 'superGroup'

		@extend Spine.Model.Ajax
		@include Spine.Model.Ajax

		ajaxToggle: (options = {}) ->
			@ajax().ajaxQueue
				type: 'PUT'
				url: @url if @enabled then 'deactivate' else 'activate'
			.done (res, status, xhr) =>
				if res.code is 0
					@updateAttribute 'enabled', not @enabled
					@trigger 'ajaxSuccess', 'toggle', res, status, xhr
					options.done?.apply @record, [res, status, xhr]
				else
					@trigger 'ajaxBizError', 'toggle', res, status, xhr
					options.done?.apply @record, [res, status, xhr]
			.fail (xhr, statusText, error) =>
				res = 
					code: -1
				@trigger 'ajaxError', 'toggle', res, statusText, xhr
				options.fail?.apply @record, [xhr, statusText, error]

	Group