define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var langResourceCommon = require("../../lang/" + G.LANG + "/common");
	var langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
	var mainTpl = require('./edit-content-define-urls.tpl.html');
	var chaneUrlTpl = require('./change-url.tpl.html');
	var _marks = null;
	var _mark = null;
	var _markMap = {};
	var _dialog = null;
	var urls = {};
	var _rid = undefined;

	function _showPop(_data) {
		$('#iurl').attr('title', _data.url).html(_data.url);
		$('#ititle').html(_data.title);
		$('#iimage').attr('src', _data.status === 2 ? 'http://snapshot.manggis.internal/snapshot/template/' + _data.rid + '.png' : 'img/mod/campaign/waiting.jpg');
		$('#idescription').html(_data.description);
		$('#ilink').attr('href', _data.url);
		setTimeout(function () {
			$('#my-popover').removeClass('off');
		}, 100);
	}

	function _bindEvent() {
		rfl.Delegator.getPageDelegator().delegate('click', 'showLinkInfo', function(evt) {
			var _data;
			if (_mark) {
				_mark.removeClass('rotate-270');
				$('#my-popover').addClass('off');
			}
			_mark = $(evt.target).closest('a');
			if (!_mark.data('disable')) {
				_data = _mark.data('link-info');
				_mark.addClass('rotate-270');
				if (_data) {
					if (_mark.hasClass('text-danger')) {
						if (_data.url.length > 40) {
							$('#iurl').html(_data.url.slice(0, 40) + '...');
						} else {
							$('#iurl').html(_data.url);
						}
						$('#ititle').html('Page Not Found!');
						$('#iimage').attr('src', 'img/mod/campaign/404.jpg');
						$('#idescription').html('');
						$('#ilink').attr('href', _data.url);
						setTimeout(function () {
							$('#my-popover').removeClass('off');
						}, 100);
					} else if (_data.rid && _data.title && _data.description) {
						if (_data.url.length > 40) {
							$('#iurl').html(_data.url.slice(0, 40) + '...');
						} else {
							$('#iurl').html(_data.url);
						}    
						_showPop(_data);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
					} else {
						$.get('http://snapshot.manggis.internal/getExtract', {
							url: _data.url
						}, function (data) { 
							data.rid = data.id;
							data.id = undefined;
							delete data['id'];
							$.each(data, function (key, value) {
								_data[key] = _data[key] || value;
							});
							_data.status = data.status;
							_showPop(_data);
						});
					}
				} else {
					$('#iurl').html('unknow');
					$('#ititle').html('unknow');
					$('#idescription').html('unknow');
					setTimeout(function () {
						$('#my-popover').removeClass('off');
					}, 100);
				}
			} else {
				_mark = null;
				rfl.alerts.show('This is link is disabled, if you want to edit it, you can right-click to enable it.', 'warning');
			}
		}).delegate('click', 'submit-define', function (evt) {
			var pageData = rfl.pageStorage.get() || {},
				_data = _mark.data('link-info');
			_data.url = $('#ilink').attr('href');
			_data.image = $('#iimage').attr('src');
			_data.title = $('#ititle').html();
			_data.description = $('#idescription').html();
			_data.timestamp = undefined;
			_data.rid = _rid;
			$.post('http://snapshot.manggis.internal/saveUrl', {
				url: _data,
				listId: pageData.urlParams.listId,
				campaignId: _marks[3]
			}, function (res) {
				if (res.code === 0) {
					rfl.alerts.show(res.message, 'success');
					_mark.removeClass('rotate-270');
					_mark = null;
					$('#my-popover').hide();
				} else {
					rfl.alerts.show(res.message, 'error');
				}
			});
		}).delegate('click', 'cancel-define', function (evt) {
			_mark.removeClass('rotate-270');
			_mark = null;
			$('#my-popover').addClass('off');
		}).delegate('click', 'edit-url', function (evt) {
			_dialog = rfl.dialog.create({
				title: 'Change URL',
				content: chaneUrlTpl.render({url: $('#ilink').attr('href')}),
				btns: [
					{
						text: 'Check',
						className: 'btn-primary',
						click: _change
					},
					{
						dismiss: true,
						text: langResourceCommon.label.close
					}
				]
			}).on('hide', function () {
				_dialog.remove();
				_dialog = null;
			});
		}).delegate('keyup', 'changeUrlKeyUp', function (evt) {
			if (evt.which === 13) {
				_change();
			}
		});

		$(document).on('contextmenu', function(evt) {
			if ($(evt.target).hasClass('icon-map-marker')) {
				var target = $(evt.target).closest('a');
				if (!target.data('disable')) {
					target.addClass('text-muted');
					target.data('disable', true);
				} else {
					target.removeClass('text-muted');
					target.data('disable', false);
				}
				return evt.preventDefault();
			}
		});

		return _bindEvent = rfl.empty;
	}

	function _change() {
		var pageData = rfl.pageStorage.get();
		var url = $('#changeToUrl').val();
		rfl.ajax.showLoading();
		$.get('http://snapshot.manggis.internal/check', {
			url: url
		}, function (res) {
			if (res.status) {
				$('#changeUrlGroup').removeClass('has-error');
				_dialog.modal('hide');
				if (url.length > 40) {
					$('#iurl').html(url.slice(0, 40) + '...');
				} else {
					$('#iurl').html(url);
				}
				$('#iurl').attr('title', url);
				$('#ititle').html('');
				$('#iimage').attr('src', 'img/mod/campaign/waiting.jpg');
				$('#ilink').attr('href', url);
				$('#idescription').html('');

				$.get('http://snapshot.manggis.internal/extract', {
					url: url
				}, function (res) {
					if (res.status) {
						$('#ititle').html(res.title);
						$('#iimage').attr('src', res.status === 2 ? 'http://snapshot.manggis.internal/snapshot/template/' + res.rid + '.png' : 'img/mod/campaign/waiting.jpg');
						$('#ilink').attr('href', url);
						$('#idescription').html(res.description);
						_rid = res.rid;
						_dialog.modal('hide');
					} else {
						rfl.alerts.show('This url is unavilable.', 'error')
					}
				});
			} else {
				$('#changeUrlGroup').addClass('has-error');
			}
			rfl.ajax.hideLoading();
		});
	}
	
	function _imgChecker(container, callback) {
		var imgNum;
		!callback && (callback = container) && (container = document);
		imgNum = $('img', container).length;
		if (imgNum) {
			return $('img').load(function() {
				if (!--imgNum) {
					return callback();
				}
			}).error(function() {
				if (!--imgNum) {
					return callback();
				}
			});
		} else {
			callback();
		}
	}

	function _remove(urlArray, urlObjArray, map) {
		map = map || {};
		var newUrls = [],
			urlReg = /^https?\:\/\//;
		$.each(urlObjArray, function (i, urlObj) {
			if (urlObj.status > 0 && urlReg.test(urlObj.url)) {
				map[urlObj.url] = urlObj;
			}
		});
		$.each(urlArray, function (i, url) {
			if (!map[url]) {
				newUrls.push(url);
			}
		});
		return newUrls;
	}

	function _getUrlsData(allUrls) {
		var pageData = rfl.pageStorage.get() || {};
		rfl.ajax.get({
			url: 'lists/campaigns/' + _marks[3] + '/getCampaignUrls',
			success: function (res) {
				if (res.code === 0) {
					var newUrls = _remove(allUrls, res.data.urls, urls);
					_checkMark(urls);
					return _doNext(newUrls);
				} else {
					return rfl.ui.renderPageLoadError('#main-div', {
						content: res.message
					});
				}
			},
			error: function () {
				return rfl.ui.renderPageLoadError('#main-div');
			}
		});
	}

	function _checkMark(urls) {
		$.each(urls, function (i, url) {
			$.each(_markMap[url.url], function (i, mark) {
				mark.data('link-info', url);
				switch (url.status) {
					case 0:
						mark.removeClass('text-warning text-success').addClass('text-danger');
						break;
					case 1:
					case 2:
						mark.removeClass('text-warning text-danger').addClass('text-success');
						break;
				}
			});
		});
	}

	function _render(mark, action, base64Info, step, sid) {
		var pageData;
		if (action == null) {
			action = 'create';
		}
		if (!sid) {
			rfl.ui.renderInvalidUrl('#main-div');
			return;
		}
		_marks = [action, base64Info, step, sid];
		pageData = rfl.pageStorage.get() || {};
		_bindEvent();
		return rfl.ajax.get({
			url: 'lists/campaigns/' + _marks[3] + '/content',
			success: function(res) {
				if (res.code === 0) {
					$('#main-div').html(mainTpl.render({
						data: res.data,
						listId: pageData.urlParams.listId,
						marks: [action, base64Info, step, sid],
						urlParams: pageData.urlParams,
						lang: {
							common: langResourceCommon,
							campaign: langResourceCampaign
						}
					}));
					_imgChecker('#link-view', function() {
						var linkMap = $('#link-map'),
							pos = linkMap.offset(),
							allUrls = [];
						$('a', $('#link-view')).each(function (i, ele) {
							var offset, url, mark;
							ele = $(ele);
							url = ele.attr('href');
							if (url.match(/^http\:\/\//)) {
								offset = ele.offset();
								mark = $([
									'<a href="javascript:void(0)" class="text-warning link-marker" data-rfl-contextmenu="changeLinkStatus" data-rfl-click="showLinkInfo" style="text-decoration:none;position:absolute;top:', 
									offset.top - pos.top - 5, 
									'px;left:', 
									offset.left + pos.left - 15, 
									'px">', 
									'<i class="icon-map-marker icon-large"></i>', 
									'</a>'
								].join(''));
								linkMap.append(mark);
								allUrls.push(url);
								if (_markMap[url]) {
									_markMap[url].push(mark);
								} else {
									var markArray = [mark];
									_markMap[url] = markArray;
								}
							}
						});
						_getUrlsData(allUrls);
					});
					return setTimeout(function() {
						return $('.off-screen').removeClass('off-left off-top');
					}, 0);
				} else {
					return rfl.ui.renderPageLoadError('#main-div', {
						content: res.message
					});
				}
			},
			error: function() {
				return rfl.ui.renderPageLoadError('#main-div');
			}
		});
	}

	function _doNext(urlArray) {
		if (urlArray.length) {
			var pageData = rfl.pageStorage.get() || {};
			return $.post('http://snapshot.manggis.internal/urls', {
				listId: pageData.urlParams.listId,
				campaignId: _marks[3],
				urls: urlArray
			}, function(data) {
				_checkMark(data.urls);
				if (urlArray.length !== data.urls.length) {
					var newUrls = _remove(urlArray, data.urls, urls);
					return _doNext(newUrls);
				}
			});
		}
	}
	
	function render() {
		return rfl.ajax.history.dispatch(function () {
			var args;
			args = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
			return _render.apply(null, args);
		});
	};

	return {
		render: render
	};

});