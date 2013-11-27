define (require) ->
	Spine = require 'spine'

	class Property extends Spine.Model
		@configure 'Property', 'name', 'propertyType', 'basic', 'tag', 'items'

		@extend Spine.Model.Ajax
		@include Spine.Model.Ajax

		@setListId: (listId) ->
			@listId = listId

		@scope: () ->
			'lists/' + @listId

		scope: () ->
			if @isNew() and not @id
				@constructor.scope()
			else
				'lists'

	Property