define(function(require) {
	var makeTpl = require('./make.tpl.html'),
		viewTpl = require('./view.tpl.html'),
		defaultTpl = require('./default.tpl.html'),
		Blockprint = require('mod/template/Blockprint-main'),
		dropFileSupported = 'File' in window && 'FormData' in window,
		defaultBlockData = {
			blockType: "right_img_left_text",
          	img: false,
			txt: '<p>Capture the text by click</p>'
		},
		defaultImg = defaultTpl.render({dropFileSupported: dropFileSupported}),
		blockprint = new Blockprint(defaultBlockData, makeTpl, viewTpl, {defaultImg: defaultImg});

	return {
		init: function(){
			require('mod/template/pic-main').init();
		},
		make: blockprint.make,
		view: blockprint.view,
		setter: {
			setTxt: function(data){
				this.data.txt = data;
			},
			setImg: function(data){
				var src = data.src,
					href = data.href,
					width = data.width,
					height = data.height,
					html = "";

				html += [
							'<img src="',
							src,
							'" '
						].join("");

				if(width){
					html += [
								'width="',
								width,
								'" '
							].join("")
				}
				if(height){
					html += [
								'height="',
								height,
								'" '
							].join("");
				}
				html += "/>";

				if(href){
					html = [
								'<a href="',
								href,
								'" target="_blank">',
								html,
								'</a>'
							].join("");
				}

				this.data.img = html;
			}
		}
	};
});