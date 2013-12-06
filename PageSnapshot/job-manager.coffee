guid = require './guid'
PageSnapshot = require './page-snapshot'

class JobManager
	@freeNum = 2
	@pool = []
	@workerJobMap = {}

	@push: (job)=>
		@pool.push(job)

	@checker: =>
		if @freeNum > 0 and @pool.length > 0
			if (@pool.length > 100)
				jobs = @pool.splice(0,100)
			else
				jobs = @pool
				@pool = []
			@doJob(jobs)
			@checker()
		else
			setTimeout(@checker, 200)

	@doJob: (jobs)=>
		@freeNum -= 1
		jobs = JSON.stringify({jobList: jobs})
		pageSnapshot = new PageSnapshot()
		#@workerJobMap[pageSnapshot.workerId] = job
		pageSnapshot.snapshot(jobs, @callback)

	@callback:(status, workerId)=>
		
		@freeNum += 1
		#console.log @workerJobMap[workerId]
		#if @workerJobMap[workerId]
			#console.log "Worker: #{workerId} finished."
			#job = @workerJobMap[workerId]
			#job.callback(status, job.id)
			#delete @workerJobMap[workerId]


	@init: ->
		@checker()

JobManager.init()

module.exports = JobManager