CKEDITOR.plugins.add('ripersonalizer', {
	icons: 'ripersonalizer',
	init: function(editor) {
		editor.addCommand('insertPersonalizedInformation', {
			exec: function(editor) {
				require(['lib/ckeditor-4.2.1/plugins/ripersonalizer/dialog-main'], function(dialog) {
					dialog.show(editor);
				});
			}
		});

		editor.ui.addButton('insertPersonalizedInformation', {
			label: 'Insert Customer Property',
			command: 'insertPersonalizedInformation',
			toolbar: 'ri'
		});
	}
});