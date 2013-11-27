define (require) ->
	Spine = require 'spine'

	class AdRemark extends Spine.Model
		@configure 'AdRemark', 'id', 'domains', 'remark'

		@extend Spine.Model.Ajax
		@include Spine.Model.Ajax


	AdRemark