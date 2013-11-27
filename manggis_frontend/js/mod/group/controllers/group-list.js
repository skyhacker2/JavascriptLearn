// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var $, Group, GroupList, Spine, langResourceCommon, langResourceGroup, rfl, _ref;
    $ = require('jquery');
    Spine = require('spine');
    rfl = require('rfl');
    langResourceCommon = require('lang/{{G.LANG}}/common');
    langResourceGroup = require('lang/{{G.LANG}}/group');
    Group = require('../models/group');
    GroupList = (function(_super) {
      __extends(GroupList, _super);

      function GroupList() {
        this.toggle = __bind(this.toggle, this);
        this.del = __bind(this.del, this);
        this.render = __bind(this.render, this);
        this.ajaxError = __bind(this.ajaxError, this);
        _ref = GroupList.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      GroupList.prototype.events = {
        'click [data-del-btn]': 'del',
        'click [data-toggle-btn]': 'toggle'
      };

      GroupList.prototype.template = require('../views/group-list.tpl.html');

      GroupList.prototype.init = function() {
        Group.on('refresh', this.render);
        Group.on('ajaxError ajaxBizError', this.ajaxError);
        return Group.ajaxFetch();
      };

      GroupList.prototype.ajaxError = function(record, type, res, status, xhr) {
        if (!rfl.ajax.dealCommonCode(res.code)) {
          return rfl.alerts.show(res.message || langResourceCommon.msg.serverBusy, 'error');
        }
      };

      GroupList.prototype.render = function() {
        return this.html(this.template.render({
          groups: Group.all()
        }));
      };

      GroupList.prototype.del = function(evt) {
        var group, id;
        id = $(evt.target).closest('tr').data('id');
        group = Group.find(id);
        return rfl.alerts.confirm(rfl.util.formatMsg(langResourceGroup.msg.delGroupConfirm, [group.name]), function() {
          return group.ajaxDestroy({
            done: function(res) {
              rfl.alerts.show(res.message, 'success');
              return Group.ajaxFetch();
            }
          });
        }, {
          makeSure: true
        });
      };

      GroupList.prototype.toggle = function(evt) {
        var group, id,
          _this = this;
        id = $(evt.target).closest('tr').data('id');
        group = Group.find(id);
        return group.ajaxToggle({
          done: function(res) {
            rfl.alerts.show(res.message, 'success');
            return _this.render();
          }
        });
      };

      return GroupList;

    })(Spine.Controller);
    return GroupList;
  });

}).call(this);
