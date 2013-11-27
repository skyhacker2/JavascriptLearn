define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var langResourceCommon = require('../../lang/' + G.LANG + '/common');
	var langResourceCustomer = require('../../lang/' + G.LANG + '/customer');
	var mainTpl = require('./list.tpl.html');

	var _listId = '';
	var _base64Info = '';
	var _data = null;
	
	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'createCampaign', function(evt, type) {
			rfl.util.toBase64({listId: _listId, listName: _data.listName}, function(res) {
				if(type) {
					rfl.util.gotoUrl('campaign/edit#!create/' + res + '/campaign//' + type);
				} else {
					rfl.util.gotoUrl('campaign/edit#!create/' + res + '/campaign//regular');
				}
			});
		}, 1).delegate('click', 'editListName', function(evt) {
			require(['instant-editor'], function(instantEditor) {
				instantEditor.show({propertyType: 'TEXT'}, $(evt.target).closest('h1'), function(inputBox, opt) {
					require(['form-util'], function(formUtil) {
						formUtil.setCommonMsg(langResourceCommon.msg.validator);
						var valid = formUtil.validateOne(inputBox);
						var val = inputBox.value;
						if(valid.passed) {
							if(val != _data.groupName) {
								rfl.ajax.put({
									url: 'lists/' + _listId,
									data: {
										name: val
									},
									success: function(res) {
										if(res.code === 0) {
											_data.listName = val;
											$('[data-type="list-name"]').html(rfl.util.encodeHtml(val));
											instantEditor.hide();
										} else {
											formUtil.highLight(inputBox, res.message);
										}
									},
									error: function() {
										formUtil.highLight(inputBox, langResourceCommon.msg.serverBusy);
									}
								});
							} else {
								instantEditor.hide();
							}
						}
					});
				}, {
					initVal: _data.listName,
					validator: 'mandatory name',
					maxlength: rfl.config.MAX_LENGTH.NAME,
					lang: langResourceCommon
				});
			});
		}, 1);
		_bindEvent = rfl.empty;
	};
	
	function _renderMain() {
		$('#main-div').html(mainTpl.render($.extend(_data, {
			listId: _listId,
			lang: {common: langResourceCommon, customer: langResourceCustomer}
		})));
	};

	function _renderChart() {
		if(!$('#customer-growth-chart').length) {
			return;
		}
		rfl.css.load('js/lib/morris/main-min.css');
		require(['morris'], function(Morris) {
			$('#customer-growth-chart').empty();
			new Morris.Line({
				// ID of the element in which to draw the chart.
				element: 'customer-growth-chart',
				// Chart data records -- each entry in this array corresponds to a point on
				// the chart.
				data: [
					{ period: '2013-01', value: 20 },
					{ period: '2013-02', value: 2334 },
					{ period: '2013-03', value: 43221 },
					{ period: '2013-04', value: 53221 },
					{ period: '2013-05', value: 62343 }
				],
				// The name of the data record attribute that contains x-values.
				xkey: 'period',
				// A list of names of data record attributes that contain y-values.
				ykeys: ['value'],
				// Labels for the ykeys -- will be displayed when you hover over the
				// chart.
				labels: ['Customers']
			});
		});
	};

	function _render(mark, listId, page, sortKey, sortOrder) {
		_renderMain();
		_renderChart();
	};
	
	function render(mark, listId) {
		var args = arguments;
		if(args.length) {
			if(!listId || listId == _listId) {
				_render.apply(null, rfl.array.getArray(args));
			} else {
				rfl.ajax.get({
					url: 'lists/' + listId + '/overview',
					success: function(res) {
						if(res.code === 0) {
							rfl.util.toBase64({listName: res.data.listName}, function(base64Info) {
								G.listId = listId;
								_listId = listId;
								_base64Info = base64Info;
								_data = res.data;
								_render.apply(null, rfl.array.getArray(args));
							});
						} else if(res.code === 2) {
							rfl.ui.renderInvalidUrl('#main-div');
						} else {
							rfl.ui.renderPageLoadError('#main-div');
						}
					},
					error: function() {
						rfl.ui.renderPageLoadError('#main-div');
					}
				});
			}
		} else {
			//a refresh call, get current status from mark
			rfl.ajax.history.dispatch(function() {
				render.apply(null, rfl.array.getArray(arguments));
			});
		}
	};
	
	function init(listId, listRes) {
		if(!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
			return;
		}
		if(!rfl.ajax.dealCommonCode(listRes.code)) {
			if(listRes.code === 0) {
				rfl.util.toBase64({listName: listRes.data.listName}, function(base64Info) {
					G.listId = listId;
					_listId = listId;
					_base64Info = base64Info;
					_data = listRes.data;
					_bindEvent();
					rfl.ajax.history.init(4, render);
				});
			} else {
				rfl.ui.renderPageLoadError('#main-div');
			}
		}
	};
	
	return {
		init: init
	};
});