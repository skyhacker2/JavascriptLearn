var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , clients = [];

app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/public/css'));
//app.use(express.static(__dirname + '/public/font'));

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
  socket.emit('news', { hello: 'world' });

  socket.on('client', function (data) {
    clients.push({
        socket:socket,
        ready: false,
        finish: false
    });
    io.sockets.emit('server', {});
    console.log(data);
  });

  socket.on('server', function(data) {
    console.log(data);
    var data =[];
    for (var i = clients.length; i--;){
      data.push({
        clientId: i,
        ready: clients[i].ready
      });
    }

    socket.emit('client_data', {
      data: data
    });
  });

  socket.on('ready', function(data) {
    for (var i = clients.length; i--;) {
      var client = clients[i];
      if (client.socket === socket) {
        client.ready = true;
        socket.emit('client connected', {clientId: i, ready: 'true'});
        break;
      }
    }
  });

  socket.on('not ready', function(data) {
    for (var i = clients.length; i--;) {
      var client = clients[i];
      if (client.socket === socket) {
        client.ready = false;
        socket.emit('client connected', {clientId: i, ready: 'false'});
        break;
      }
    }
  });

  // when a client finish a job
  socket.on('ok', function(data) {
    for (var i = clients.length; i--;) {
      var client = clients[i];
      if (client.socket === socket) {
        socket.emit('finish one', {clientId: i});
        break;
      }
    }
  });

  // when a client happen a error
  socket.on('error', function(data) {
    for (var i = clients.length; i--;) {
      var client = clients[i];
      if (client.socket === socket) {
        socket.emit('unfinish one', {clientId: i});
        break;
      }
    }
  });

  // when server start the test
  socket.on('start test', function(data) {
    socket.emit('start', data);
  });

  socket.on('disconnect', function () {
    console.log('DISCONNESSO!!! ');
    for (var i = clients.length; i--;) {
      var client = clients[i];
      if (client.socket === socket)
        clients.splice(i, 1);
    }
    socket.emit('client_data', {
        msg: clients.length
    });
  });  
});

