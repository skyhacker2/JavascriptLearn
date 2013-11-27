define (require)->
	Spine = require 'spine'
	domains = require '../../campaign/domains/' + G.LANG
	
	class Domain extends Spine.Model
		@configure "Domain", "id", "name"


	for i in [0...domains.length]
		domain = new Domain(id:i+1, name:domains[i])
		domain.save()
	Domain