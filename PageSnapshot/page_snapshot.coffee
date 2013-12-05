process = require 'child_process'

class PageSnapshot
	constructor: ->
		@error = false

	onData:(stream)=>
		console.log stream.toString()

	onExit: (code)=>
		console.log code
		if code is null
			console.log 'snapshot url: ' + @url + ' timeout.'
		else if code is 0
			console.log 'snapshot url: ' + @url + ' success.'
		else
			console.log 'unknown error.'
		@endTime = new Date()
		console.log 'Spend ' + (@endTime - @startTime) + 'ms.'

	onTimeout: =>
		@worker.kill('SIGINT')

	snapshot: (url, path)=>
		@url = url
		@path = path
		@startTime = new Date()
		@worker = process.spawn 'phantomjs', ['--disk-cache=true', __dirname + '/phantomjs_script/snapshot.js', url, path]
		@worker.on('exit', @onExit)
		@worker.on('data', @onData)

module.exports = PageSnapshot