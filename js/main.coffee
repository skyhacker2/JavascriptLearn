define (require)->
	class main
		@run: ->
			console.log location.host
			console.log location.hash
			console.log navigator.appCodeName
			console.log navigator.appName
			console.log navigator.appVersion
	main