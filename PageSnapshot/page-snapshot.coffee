process = require 'child_process'
guid = require './guid'

class PageSnapshot
	constructor: ->
		@workerId = guid()

	onData:(stream)=>
		#console.log stream.toString()
		console.log new Date()

	onExit: (code)=>
		#console.log code
		if code is null
			#console.log 'snapshot url: ' + @url + ' timeout.'
		else if code is 0
			#console.log 'snapshot url: ' + @url + ' success.'
		else
			#console.log 'unknown error.'
		@endTime = new Date()
		#console.log 'Spend ' + (@endTime - @startTime) + 'ms.'
		if @callback
			if code is 0
				@callback('success', @workerId)
			else
				@callback('fail', @workerId)
	onTimeout: =>
		@worker.kill('SIGINT')

	snapshot: (jobs, callback)=>
		@callback = callback
		@startTime = new Date()
		@worker = process.spawn 'phantomjs', ['--disk-cache=true', __dirname + '/phantomjs_script/snapshot.js', JSON.stringify(jobs)]
		@worker.on('exit', @onExit)
		@worker.stdout.on('data', @onData)
		@worker.stderr.on('data', @onData)
		setTimeout(@onTimeout, 200000)

module.exports = PageSnapshot