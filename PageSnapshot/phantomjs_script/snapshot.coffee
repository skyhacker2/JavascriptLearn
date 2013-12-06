page = require('webpage').create()
system = require('system')
config = require('./config.js')

class Snapshot
	onTimeout: (e)=>
		console.log 'time out.'
		phantom.exit(2)

	onOpen: (status)=>
		if status isnt 'success'
			phantom.exit(3)
		else
			console.log 'open page success'
			setTimeout @snapshot, 200

	snapshot: =>
		page.render(@file)
		console.log 'snapshot success'
		phantom.exit(0)


	init:->
		if system.args.length < 3 or system.args.length > 3
			console.log 'Usage: snapshot.js URL FILE'
			phantom.exit(1)
		else
			@url = system.args[1]
			@file = system.args[2]
			page.viewportSize = config.viewportSize
			for key, val of config.settings
				page.settings[key] = val
			page.onResourceTimeout = @onTimeout
			page.open @url, @onOpen

snapshot = new Snapshot()
snapshot.init();
