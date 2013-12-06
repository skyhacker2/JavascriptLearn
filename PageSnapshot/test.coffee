process = require 'child_process'

exit = ()->
	index.kill('SIGINT')
	console.log 'exit'
index = process.spawn 'node', ['./index.js']
setTimeout(exit, 2000)
