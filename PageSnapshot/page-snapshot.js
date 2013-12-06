// Generated by CoffeeScript 1.6.3
(function() {
  var PageSnapshot, guid, process,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  process = require('child_process');

  guid = require('./guid');

  PageSnapshot = (function() {
    function PageSnapshot() {
      this.snapshot = __bind(this.snapshot, this);
      this.onTimeout = __bind(this.onTimeout, this);
      this.onExit = __bind(this.onExit, this);
      this.onData = __bind(this.onData, this);
      this.workerId = guid();
    }

    PageSnapshot.prototype.onData = function(stream) {
      return console.log(new Date());
    };

    PageSnapshot.prototype.onExit = function(code) {
      if (code === null) {

      } else if (code === 0) {

      } else {

      }
      this.endTime = new Date();
      if (this.callback) {
        if (code === 0) {
          return this.callback('success', this.workerId);
        } else {
          return this.callback('fail', this.workerId);
        }
      }
    };

    PageSnapshot.prototype.onTimeout = function() {
      return this.worker.kill('SIGINT');
    };

    PageSnapshot.prototype.snapshot = function(jobs, callback) {
      this.callback = callback;
      this.startTime = new Date();
      this.worker = process.spawn('phantomjs', ['--disk-cache=true', __dirname + '/phantomjs_script/snapshot.js', JSON.stringify(jobs)]);
      this.worker.on('exit', this.onExit);
      this.worker.stdout.on('data', this.onData);
      this.worker.stderr.on('data', this.onData);
      return setTimeout(this.onTimeout, 200000);
    };

    return PageSnapshot;

  })();

  module.exports = PageSnapshot;

}).call(this);
