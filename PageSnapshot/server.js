var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , Job = require('./job')
  , JobManager = require('./job-manager')
  , guid = require('./guid');

server.listen(3000);

var connNum = 0;
app.use(express.logger('dev'));
app.get("/extract", function (req, res) {
	connNum+=1;
	console.log(connNum);
	if (req.query.url) {
		var job = new Job('http://www.baidu.com', __dirname + "/snapshot/" + guid() +".png", function (status, id) {
			console.log(status);
			res.writeHead(200, {
                'Content-Type': 'application/json; charset=UTF-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.statusCode = 200;
            return res.end(JSON.stringify({status:status, id: id}));
		});
		JobManager.push(job)
	}
});