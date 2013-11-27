// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var $, Group, Spine, User, UserList, langResourceCommon, langResourceUser, rfl, _ref;
    $ = require('jquery');
    Spine = require('spine');
    rfl = require('rfl');
    langResourceCommon = require('lang/{{G.LANG}}/common');
    langResourceUser = require('lang/{{G.LANG}}/user');
    User = require('../models/user');
    Group = require('../../group/models/group');
    UserList = (function(_super) {
      __extends(UserList, _super);

      function UserList() {
        this.toggle = __bind(this.toggle, this);
        this.del = __bind(this.del, this);
        this.render = __bind(this.render, this);
        this.userRefresh = __bind(this.userRefresh, this);
        this.ajaxError = __bind(this.ajaxError, this);
        _ref = UserList.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      UserList.init = function(options) {
        return this.instance = new UserList(options);
      };

      UserList.changeGroup = function(groupId) {
        var routeParams;
        if (groupId == null) {
          groupId = '';
        }
        routeParams = this.instance.routeParams.concat();
        routeParams[3] = groupId;
        return this.instance.navigate('!/' + routeParams.join('/'));
      };

      UserList.prototype.events = {
        'click [data-del-btn]': 'del',
        'click [data-toggle-btn]': 'toggle'
      };

      UserList.prototype.template = require('../views/user-list.tpl.html');

      UserList.prototype.init = function() {
        var _this = this;
        User.on('refresh', this.userRefresh);
        User.on('ajaxError ajaxBizError', this.ajaxError);
        if (rfl.auth.getData('currentGroup').superGroup) {
          this.groupFetchPromise = Group.ajaxFetch();
        }
        this.routes({
          '*glob': function(params) {
            _this.routeParams = params.glob.replace(/^!?\/?/, '').split('/');
            return _this.fetchUsers();
          }
        });
        return Spine.Route.setup();
      };

      UserList.prototype.ajaxError = function(record, type, res, status, xhr) {
        if (!rfl.ajax.dealCommonCode(res.code)) {
          return rfl.alerts.show(res.message || langResourceCommon.msg.serverBusy, 'error');
        }
      };

      UserList.prototype.fetchUsers = function() {
        return (function(page, sortKey, sortOrder, groupId, searchText) {
          if (sortKey == null) {
            sortKey = '';
          }
          if (groupId == null) {
            groupId = '';
          }
          if (searchText == null) {
            searchText = '';
          }
          page = page || 1;
          return User.ajaxFetch({
            clear: true,
            ajax: {
              data: {
                pageNumber: page - 1,
                pageSize: G.ITEMS_PER_PAGE,
                property: sortKey,
                direction: sortOrder === 'asc' ? 'asc' : 'desc',
                groupId: groupId,
                criteriaString: decodeURIComponent(searchText)
              }
            }
          });
        }).apply(this, this.routeParams);
      };

      UserList.prototype.userRefresh = function() {
        var _this = this;
        if (rfl.auth.getData('currentGroup').superGroup) {
          return this.groupFetchPromise.done(function(res) {
            if (res.code === 0) {
              return _this.render();
            }
          });
        } else {
          return this.render();
        }
      };

      UserList.prototype.render = function() {
        return (function(page, sortKey, sortOrder, groupId, searchText) {
          if (page == null) {
            page = 1;
          }
          if (sortKey == null) {
            sortKey = '';
          }
          if (sortOrder == null) {
            sortOrder = '';
          }
          if (groupId == null) {
            groupId = '';
          }
          if (searchText == null) {
            searchText = '';
          }
          return this.html(this.template.render({
            ajaxPagerUrlPattern: ['/{{page}}', sortKey, sortOrder, groupId, searchText].join('/'),
            lang: {
              common: langResourceCommon,
              user: langResourceUser
            },
            users: User.all(),
            totalItems: User.total,
            groups: Group.all(),
            currentGroup: rfl.auth.getData('currentGroup'),
            currentUserId: rfl.auth.getData('id'),
            page: parseInt(page || 1),
            sortKey: sortKey,
            sortOrder: sortOrder,
            groupId: groupId,
            searchText: searchText
          }));
        }).apply(this, this.routeParams);
      };

      UserList.prototype.del = function(evt) {
        var id, user,
          _this = this;
        id = $(evt.target).closest('tr').data('id');
        user = User.find(id);
        return rfl.alerts.confirm(rfl.util.formatMsg(langResourceUser.msg.delUserConfirm, [user.email]), function() {
          return user.ajaxDestroy({
            done: function(res) {
              rfl.alerts.show(res.message, 'success');
              return _this.fetchUsers();
            }
          });
        }, {
          makeSure: true
        });
      };

      UserList.prototype.toggle = function(evt) {
        var id, user,
          _this = this;
        id = $(evt.target).closest('tr').data('id');
        user = User.find(id);
        return user.ajaxToggle({
          done: function(res) {
            rfl.alerts.show(res.message, 'success');
            return _this.render();
          }
        });
      };

      return UserList;

    })(Spine.Controller);
    return UserList;
  });

}).call(this);
