(function() {
  var exit, index, process;

  process = require('child_process');

  exit = function() {
    index.kill('SIGINT');
    return console.log('exit');
  };

  index = process.spawn('node', ['./index.js']);

  setTimeout(exit, 2000);

}).call(this);
