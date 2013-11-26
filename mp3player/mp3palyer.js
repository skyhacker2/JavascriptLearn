var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');
 
var mp3path = "music.mp3"
fs.createReadStream(mp3path)
	.pipe(new lame.Decoder())
	.on('format', function (format) {
	this.pipe(new Speaker(format));
});