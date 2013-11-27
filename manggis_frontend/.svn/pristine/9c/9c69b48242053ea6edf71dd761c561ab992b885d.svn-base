define(function(require) {
	var makeTpl = require('./make.tpl.html'),
		viewTpl = require('./view.tpl.html'),
		Blockprint = require('mod/template/Blockprint-main'),
		defaultBlockData = {
			blockType: "navigation",
			txt: [
						'<div style="font-family:Lucida Grande,Arial,Helvetica,Geneva,Verdana,sans-serif;color:#666666;font-size:10px;line-height:1.5em">',
						'<a href="#" target="_blank">Home</a> &nbsp; | &nbsp;', 
						'<a href="#" target="_blank">App Store</a> &nbsp; | &nbsp; 800-xxxx-xxx &nbsp; | &nbsp;',
						'<a href="#" target="_blank">More App...</a>',
						'</div>'
					].join("")
		},
		blockprint = new Blockprint(defaultBlockData, makeTpl, viewTpl);

	return {
		make: blockprint.make,
		view: blockprint.view,
		setter: {
			setTxt: function(data){
				this.data.txt = data;
			}
		}
	};
});