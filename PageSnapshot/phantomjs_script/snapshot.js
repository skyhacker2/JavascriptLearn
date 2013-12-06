(function() {
  var Snapshot, config, page, snapshot, system,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  page = require('webpage').create();

  system = require('system');

  config = require('./config.js');

  Snapshot = (function() {

    function Snapshot() {
      this.snapshot = __bind(this.snapshot, this);
      this.onOpen = __bind(this.onOpen, this);
      this.onTimeout = __bind(this.onTimeout, this);
    }

    Snapshot.prototype.onTimeout = function(e) {
      console.log('time out.');
      return phantom.exit(2);
    };

    Snapshot.prototype.onOpen = function(status) {
      if (status !== 'success') {
        return phantom.exit(3);
      } else {
        console.log('open page success');
        return setTimeout(this.snapshot, 200);
      }
    };

    Snapshot.prototype.snapshot = function() {
      page.render(this.file);
      console.log('snapshot success');
      return phantom.exit(0);
    };

    Snapshot.prototype.init = function() {
      var key, val, _ref;
      if (system.args.length < 3 || system.args.length > 3) {
        console.log('Usage: snapshot.js URL FILE');
        return phantom.exit(1);
      } else {
        this.url = system.args[1];
        this.file = system.args[2];
        page.viewportSize = config.viewportSize;
        _ref = config.settings;
        for (key in _ref) {
          val = _ref[key];
          page.settings[key] = val;
        }
        page.onResourceTimeout = this.onTimeout;
        return page.open(this.url, this.onOpen);
      }
    };

    return Snapshot;

  })();

  snapshot = new Snapshot();

  snapshot.init();

}).call(this);