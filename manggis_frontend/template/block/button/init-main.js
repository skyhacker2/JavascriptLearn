define(function(require) {
	var makeTpl = require('./make.tpl.html'),
		viewTpl = require('./view.tpl.html'),
		Blockprint = require('mod/template/Blockprint-main'),
		defaultBlockData = {
			blockType: "button",
			txt: 'Click to Change the Text',
			href: false,
			align: false
		},
		blockprint = new Blockprint(defaultBlockData, makeTpl, viewTpl);

	return {
		init: function(){
			require('mod/template/button-main').init();
		},
		make: blockprint.make,
		view: blockprint.view,
		setter: {
			setButton: function(data){
				data.txt && (this.data.txt = data.txt);
				data.href && (this.data.href = data.href);
				data.align && (this.data.align = data.align);
			}
		},
		callback: function(block){
			require(['mod/template/edit-button-main'], function(mod){
				mod.show(block);
			});
		}
	};
});