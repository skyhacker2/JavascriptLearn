guid = require './guid'
fs = require 'fs'
Job = require './job'
JobManager = require './job-manager'

callback = (status, id)->
	if status is 'success'
		#console.log 'job: ' + id + ' finished!'
	else
		#console.log 'job: ' + id + ' fail!'
	console.log new Date()
fs.writeFile("./time.txt", new Date())
console.log new Date()

setTimeout (()->process.kill("SIGINT")), 3000


for i in [0...500]
	job = new Job('http://www.baidu.com', __dirname + "/snapshot/baidu#{i}.png", callback)
	JobManager.push(job)





