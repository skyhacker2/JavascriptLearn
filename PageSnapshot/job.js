// Generated by CoffeeScript 1.6.3
(function() {
  var Job, guid;

  guid = require('./guid');

  Job = (function() {
    function Job(url, path, callback) {
      this.url = url;
      this.path = path;
      this.callback = callback;
      this.id = guid();
    }

    return Job;

  })();

  module.exports = Job;

}).call(this);