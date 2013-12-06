(function() {

  module.exports = function() {
    var ID;
    ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      if (c === 'x') {
        v = r;
      } else {
        v = r & 0x3 | 0x8;
      }
      return v.toString(16);
    });
    return ID.toUpperCase();
  };

}).call(this);
