define(function() {
	var ajax = require("rfl").ajax;
	describe('Test rfl.ajax', function(){
		it('Should show the loading icon.', function(){
			ajax.showLoading();
			expect($('#ajax-loading').is(":hidden")).toBeFalsy();
		});
		it('Should hide the loading icon.', function(){
			ajax.hideLoading();
			expect($('#ajax-loading').is(":hidden")).toBeTruthy();
		});
	});
});