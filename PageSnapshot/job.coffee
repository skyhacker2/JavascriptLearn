guid = require './guid'

class Job
	constructor: (@url, @path, @callback)->
		@id = guid()

module.exports = Job