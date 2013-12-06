Webpage = require('webpage')
system = require('system')
config = require('./config.js')
Job = require('../job')

class Snapshot

	constructor: ->
		@count = 0

	onFinishOne: ->
		@count += 1
		if @count is @jobs.jobList.length
			console.log 'phantom exit()'
			phantom.exit(0)
		else
			console.log @count
			console.log @jobs.jobList.length

	doJob: (job)=>
		page = Webpage.create()
		page.viewportSize = config.viewportSize
		for key, val of config.settings
			page.settings[key] = val
		page.open job.url, (status)=>
			if (status is 'fail')
				data = {
					job: job,
					status: 'fail'
				}
			else
				page.render(job.path)
				data = {
					job: job,
					status: 'success'
				}
			console.log JSON.stringify(data)
			@onFinishOne()

	begin: (jobs)=>
		for job in jobs.jobList
			@doJob(job)

	init:->
		if system.args.length < 2 or system.args.length > 2
			console.log 'Usage: snapshot.js {"jobList": [{"url":"www.example.com", "path":"./example.png"}]}'
			phantom.exit(1)
		else
			# Need to parse twice, I don't know why.
			@jobs = JSON.parse(system.args[1])
			@jobs = JSON.parse(@jobs)
			@begin(@jobs)

snapshot = new Snapshot()
snapshot.init();
