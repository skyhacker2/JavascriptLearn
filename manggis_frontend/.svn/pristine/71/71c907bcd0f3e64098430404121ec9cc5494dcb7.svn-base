define(function(require) {
	var makeTpl = require('./make.tpl.html'),
		viewTpl = require('./view.tpl.html'),
		Blockprint = require('mod/template/Blockprint-main'),
		defaultBlockData = {
			blockType: "social",
			txt: [
					'<p style="font-family: Helvetica Neue, Helvetica, Arial, sans serif; font-size: 13px; color: #666666; font-weight: bold; text-align: right;">',
					'Follow our latest updates! &nbsp;',
					'<a href="https://secure.weebly.com/weebly/eclick.php?u=19971457&amp;c=lifecycle.learn-about-domains&amp;s=232359644&amp;t=7cda59f97082d16765dbf821f2bc25ac&amp;r=https%3A%2F%2Fwww.facebook.com%2Fweebly" style="color: #0066CC;" target="_blank"><span style="color: #0066CC;"><img src="http://images.weebly.com/images/email/templates/large/facebook_icon.png" align="center" height="24px" width="24px" style="outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border:0;"></span></a>',
					'<a href="https://secure.weebly.com/weebly/eclick.php?u=19971457&amp;c=lifecycle.learn-about-domains&amp;s=232359644&amp;t=7cda59f97082d16765dbf821f2bc25ac&amp;r=http%3A%2F%2Ftwitter.com%2F%23%21%2FWeebly" style="color: #0066CC;" target="_blank"><span style="color: #0066CC;"><img src="http://images.weebly.com/images/email/templates/large/twitter_icon.png" align="center" height="24px" width="24px" style="outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border:0;"></span></a>',
					'<a href="https://secure.weebly.com/weebly/eclick.php?u=19971457&amp;c=lifecycle.learn-about-domains&amp;s=232359644&amp;t=7cda59f97082d16765dbf821f2bc25ac&amp;r=https%3A%2F%2Fplus.google.com%2F104179482858316089654%2Fposts" style="color: #0066CC;" target="_blank"><span style="color: #0066CC;"><img src="http://images.weebly.com/images/email/templates/large/googleplus_icon.png" align="center" height="24px" width="24px" style="outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border:0;"></span></a>',
					'<a href="https://secure.weebly.com/weebly/eclick.php?u=19971457&amp;c=lifecycle.learn-about-domains&amp;s=232359644&amp;t=7cda59f97082d16765dbf821f2bc25ac&amp;r=http%3A%2F%2Fblog.weebly.com%2F" style="color: #0066CC;" target="_blank"><span style="color: #0066CC;"><img src="http://images.weebly.com/images/email/templates/large/rss_icon.png" align="center" height="24px" width="24px" style="outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;border:0;"></span></a>',
					'</p>'
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