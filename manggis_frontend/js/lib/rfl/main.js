define(function(require) {
	return {
		config: require('./config'),
		array: require('./array'),
		json: require('./json'),
		css: require('./css'),
		cookie: require('./cookie'),
		history: require('./history'),
		localStorage: require('./local-storage'),
		pageStorage: require('./page-storage'),
		util: require('./util'),
		ui: require('./ui'),
		ajax: require('./ajax'),
		login: require('./login'),
		auth: require('./auth'),
		dialog: require('./dialog'),
		alerts: require('./alerts'),
		mockupFormControl: require('./mockup-form-control'),
		dataTable: require('./data-table'),
		events: require('./events'),
		service: require('./service'),
		section: require('./section'),
		InstanceManager: require('./instance-manager'),
		Delegator: require('./delegator'),
		Observer: require('./observer'),
		empty: function() {}
	};
});