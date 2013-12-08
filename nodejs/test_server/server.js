var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , clients = [];

var counter = function() {
  var i = 1;
  return function() {
    return i++;
  }
};
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
    next();
}

app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));

server.listen(8080);

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


io.sockets.on('connection', function (socket) {

  socket.emit('news', {});
  
  // Client connected.
  socket.on('client', function (data) {
    clients.push({
      id: socket.id,
      finished: 0,
      time: 0
    });
    socket.broadcast.emit('client_conn', {clients: clients});
  });

  // Client finish one.
  socket.on('finish one', function (data) {
    for (var i = clients.length; i--;) {
      if (clients[i].id === socket.id) {
        clients[i].finished += 1;
        clients[i].time = data.time;
        break;
      }
    }
    socket.broadcast.emit('client_conn', {clients: clients});
  });

  // Server connected.
  socket.on('server', function (data) {
    socket.emit('client_conn', {clients: clients});
  });

  // Start to test
  socket.on('start', function (data) {
    console.log('start');
    socket.broadcast.emit('start the job', {data: data});
    //socket.broadcast.json.send({data: 'message'});
  });


  socket.on('disconnect', function () {
    for (var i = clients.length; i--;)
      if (clients[i].id === socket.id) {
        clients.splice(i, 1);
      }
    console.log('DISCONNESSO!!! ');
  });  
});

