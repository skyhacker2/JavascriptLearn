define(function(require) {
	var $ = require('jquery');
	var rfl = require('rfl');
	var formUtil = require('form-util');
	var profileTpl = require('./profile.tpl.html');
	
	var navBar = {};
	var _opt;
	var _listLoading = false;

	function _initSearch() {
		require(['./search-main'], function(search) {
			search.init('.app-search', _opt);
			formUtil.focus('#app-search-box-input');
			_initSearch = function() {
				search.clear();
				formUtil.focus('#app-search-box-input');
			};
		});
	};

	function _toggleSearch() {
		$(document.body).removeClass('menu-active');
		$(document.body).toggleClass('search-active');
		_initSearch();
	};

	function _renderListMenu() {
		if(_listLoading) {
			return;
		}
		_listLoading = true;
		rfl.ajax.get({
			url: 'lists',
			cache: false,
			data: {},
			success: function(res) {
				_listLoading = false;
				if(res.code === 0) {
					if(res.data.lists.length) {
						$('.app-menu').append($('<div class="list-sub-menu"></div>'));
						_renderListMenu = function() {
							require(['./list-menu-main'], function(mod) {
								mod.render('.app-menu .list-sub-menu', res.data.lists);
							});
						};
						_renderListMenu();
					}
				}
			},
			error: function() {
				_listLoading = false;
			}
		});
	};

	navBar.hideAppMenu = function() {
		$('.app-menu').removeClass('list-menu-on');
		$('.app-menu').removeClass('mouse-enter');
	};
	
	navBar.init = function(navId, opt) {
		_opt = opt || {};
		var appMenuToRef, listMenuToRef;
		var userData = rfl.auth.getData();
		$('#nav-' + navId).addClass('active');
		$('.app-top-bar .user').attr('title', userData.email).find('span').html(rfl.util.headByByte(userData.email.split('@')[0], 12, '...'));
		$('.app-user-menu').html(profileTpl.render(userData, {util: rfl.util}));
		rfl.Delegator.getPageDelegator().delegate('click', 'navChangeGroup', function(evt, gid) {
			if(gid == rfl.auth.getData('currentGroup').id) {
				return;
			}
			rfl.ajax.post({
				queueName: 'changeGroup',
				url: '/users/changeCurrentGroup',
				data: {groupId: gid},
				success: function(res) {
					if(res.code === 0) {
						location.reload();
					} else {
						rfl.alerts.show(res.message, 'error');
					}
				},
				error: function() {
					rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
				}
			});
		}).delegate('click', 'navChangePassword', function(evt) {
			require(['./change-password-main'], function(mod) {
				mod.show();
				$(document.body).removeClass('search-active user-menu-active msg-box-active');
			});
		}).delegate('click', 'navLogout', function(evt) {
			rfl.login.logout();
		}, 1).delegate('click', 'changeTheme', function(evt, theme) {
			rfl.cookie.set('theme', theme, '', '', 24 * 365);
			location.reload();
		}, 1).delegate('click', 'toggleUserMenuSection', function(evt) {
			$(this).closest('.section').toggleClass('collapsed');
		}, 1).delegate('click', 'toggleAppSearch', function(evt) {
			_toggleSearch();
		}, 1).delegate('click', 'toggleAppMsgBox', function(evt) {
			$(document.body).removeClass('menu-active user-menu-active');
			$(document.body).toggleClass('msg-box-active');
		}, 2).delegate('click', 'toggleAppUserMenu', function(evt) {
			$(document.body).removeClass('menu-active msg-box-active');
			$(document.body).toggleClass('user-menu-active');
		}, 1).delegate('click', 'toggleAppMenu', function(evt) {
			$(document.body).removeClass('user-menu-active msg-box-active');
			$(document.body).toggleClass('menu-active');
		}, 1).delegate('click', 'fixAppMenu', function(evt) {
			$(document.body).toggleClass('menu-fixed');
			if($(document.body).hasClass('menu-fixed')) {
				rfl.cookie.set('mf', '1', '', '', 24 * 365);
			} else {
				rfl.cookie.del('mf');
			}
		}, 1).delegate('click', 'toggleListSubMenuItem', function(evt) {
			var subMenuItem = $(this).closest('li');
			if(subMenuItem.hasClass('active')) {
				$('li', '.list-sub-menu').removeClass('active');
			} else {
				$('li', '.list-sub-menu').removeClass('active');
				subMenuItem.addClass('active');
			}
		}, 1).delegateAnonymous('click', function(evt) {
			if($(this).closest('.app-top-bar .menu-handler, .app-menu, .app-top-bar .user, .app-user-menu, .app-top-bar .msg, .app-msg-box').length) {
				return;
			}
			$(document.body).removeClass('menu-active user-menu-active msg-box-active');
		});
		$(window).on('keyup', function(evt) {
			if(evt.keyCode === 27) {
				$(document.body).removeClass('search-active user-menu-active msg-box-active');
			}
			if(evt.ctrlKey) {
				if(evt.keyCode === 188) {
					_toggleSearch();
				} else if(evt.keyCode === 190) {
					if($(document.body).hasClass('search-active')) {
						require(['./search-main'], function(search) {
							search.switchType();
						});
					}
				}
			}
		});
		$('.app-menu').on('mouseenter', function(evt) {
			clearTimeout(appMenuToRef);
			appMenuToRef = setTimeout(function() {
				_renderListMenu();
				$('.app-menu').addClass('mouse-enter list-menu-on');
			}, 200);
		}).on('mouseleave', function(evt) {
			clearTimeout(appMenuToRef);
			appMenuToRef = setTimeout(function() {
				$('.app-menu').removeClass('mouse-enter list-menu-on');
			}, 400);
		});
		$('.app-top-bar .menu-home').on('mouseenter', function(evt) {
			clearTimeout(appMenuToRef);
			appMenuToRef = setTimeout(function() {
				_renderListMenu();
				$('.app-menu').addClass('mouse-enter list-menu-on');
			}, 400);
		}).on('mouseleave', function(evt) {
			clearTimeout(appMenuToRef);
			appMenuToRef = setTimeout(function() {
				$('.app-menu').removeClass('mouse-enter list-menu-on');
			}, 400);
		});
		navBar.init = rfl.empty;
	};
	
	return navBar;
});