PageSnapshot = require './page_snapshot'

pageSnapshot = new PageSnapshot()
pageSnapshot.snapshot('http://www.baidu.com', __dirname + '/baidu.png')
#pageSnapshot = new PageSnapshot()
#pageSnapshot.snapshot('https://github.com', __dirname + '/github.png')
#pageSnapshot = new PageSnapshot()
#pageSnapshot.snapshot('http://www.google.com', __dirname + '/google.png')
