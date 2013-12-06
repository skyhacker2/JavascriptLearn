PageSnapshot = require './page_snapshot'
guid = require './guid'



class Job
	constructor: (@url, @path, @callback)->
		@id = guid()

class JobManager
	@freeNum = 20
	@pool = []
	@workerJobMap = {}

	@push: (job)=>
		@pool.push(job)

	@checker: =>
		if @freeNum > 0 and @pool.length > 0
			@doJob(@pool.shift())
		setTimeout(@checker, 0)

	@doJob: (job)=>
		@freeNum -= 1
		pageSnapshot = new PageSnapshot()
		@workerJobMap[pageSnapshot.workerId] = job
		pageSnapshot.snapshot(job.url, job.path, @callback)

	@callback:(status, workerId)=>
		
		@freeNum += 1
		#console.log @workerJobMap[workerId]
		if @workerJobMap[workerId]
			console.log "Worker: #{workerId} finished."
			job = @workerJobMap[workerId]
			job.callback(status, job.id)
			delete @workerJobMap[workerId]
			delete job

	@init: ->
		@checker()

JobManager.init()

callback = (status, id)->
	if status is 'success'
		console.log 'job: ' + id + ' finished!'
	else
		console.log 'job: ' + id + ' fail!'
for i in [0...1000]
	job = new Job('http://www.baidu.com', __dirname + "/snapshot/baidu#{i}.png", callback)
	JobManager.push(job)




