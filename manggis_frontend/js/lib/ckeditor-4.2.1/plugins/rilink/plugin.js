CKEDITOR.plugins.add('rilink', {
	icons: 'rilink',
	init: function(editor) {
		editor.addCommand('insertRiLink', {
			exec: function(editor) {
				require(['lib/ckeditor-4.2.1/plugins/rilink/dialog-main'], function(dialog) {
					dialog.show(editor);
				});
			}
		});

		editor.ui.addButton('insertRiLink', {
			label: 'Insert Linkage',
			command: 'insertRiLink',
			toolbar: 'ri'
		});
	}
});