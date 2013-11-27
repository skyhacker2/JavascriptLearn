define(function(require) {
	var makeTpl = require('./make.tpl.html'),
		viewTpl = require('./view.tpl.html'),
		Blockprint = require('mod/template/Blockprint-main'),
		defaultBlockData = {
			blockType: "title",
			title: [
						'<span style="font-family:',
						"'Arial Black',Arial,arial-black;",
						'font-size:45px;line-height:50px;text-transform:uppercase;">Template Title</span>'
					].join("")
		},
		blockprint = new Blockprint(defaultBlockData, makeTpl, viewTpl);

	return {
		make: blockprint.make,
		view: blockprint.view,
		setter: {
			setTitle: function(data){
				this.data.title = data;
			}
		}
	};
});