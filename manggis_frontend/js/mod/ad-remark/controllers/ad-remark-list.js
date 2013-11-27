// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var $, AdRemark, AdRemarkList, AutoComplete, Dialog, Domain, Spine, langResourceAdRemark, langResourceCommon, rfl, _ref;
    $ = require('jquery');
    Spine = require('spine');
    rfl = require('rfl');
    langResourceCommon = require('lang/{{G.LANG}}/common');
    langResourceAdRemark = require('lang/{{G.LANG}}/ad-remark');
    AdRemark = require('../models/ad-remark');
    Domain = require('../models/domain');
    AutoComplete = require('auto-complete');
    Dialog = require('./dialog');
    AdRemarkList = (function(_super) {
      __extends(AdRemarkList, _super);

      function AdRemarkList() {
        this.del = __bind(this.del, this);
        this.edit = __bind(this.edit, this);
        this.render = __bind(this.render, this);
        this.ajaxSuccess = __bind(this.ajaxSuccess, this);
        this.ajaxError = __bind(this.ajaxError, this);
        _ref = AdRemarkList.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      AdRemarkList.prototype.events = {
        'click [data-create-btn]': 'create',
        'click [data-edit-btn]': 'edit',
        'click [data-del-btn]': 'del'
      };

      AdRemarkList.prototype.template = require('../views/ad-remark-list.tpl.html');

      AdRemarkList.prototype.dialogTpl = require('../views/ad-remark-dialog.tpl.html');

      AdRemarkList.prototype.init = function() {
        var _this = this;
        AdRemark.on('refresh', this.render);
        AdRemark.on('ajaxError ajaxBizError', this.ajaxError);
        AdRemark.on('ajaxSuccess', this.ajaxSuccess);
        this.routes({
          '*glob': function(params) {
            _this.routeParams = params.glob.replace(/^!?\/?/, '').split('/');
            return _this.fetchAdRemarks();
          }
        });
        return Spine.Route.setup();
      };

      AdRemarkList.prototype.fetchAdRemarks = function() {
        return (function(page, sortKey, sortOrder) {
          if (sortKey == null) {
            sortKey = '';
          }
          page = page || 1;
          return AdRemark.ajaxFetch({
            clear: true,
            ajax: {
              data: {
                pageNumber: page - 1,
                pageSize: G.ITEMS_PER_PAGE,
                property: sortKey,
                direction: sortOrder === 'asc' ? 'asc' : 'desc'
              }
            }
          });
        }).apply(this, this.routeParams);
      };

      AdRemarkList.prototype.ajaxError = function(record, type, res, status, xhr) {
        if (!rfl.ajax.dealCommonCode(res.code)) {
          return rfl.alerts.show(res.message || langResourceCommon.msg.serverBusy, 'error');
        }
      };

      AdRemarkList.prototype.ajaxSuccess = function(record, type, res, stauts, xhr) {
        if (type === 'update' || type === 'create' || type === 'destroy') {
          if (res.code === 0) {
            return rfl.alerts.show(res.message, 'success');
          } else {
            return rfl.alerts.show(res.message, 'error');
          }
        }
      };

      AdRemarkList.prototype.render = function() {
        console.log('render');
        return (function(page, sortKey, sortOrder) {
          if (page == null) {
            page = 1;
          }
          if (sortKey == null) {
            sortKey = '';
          }
          console.log(AdRemark.all());
          return this.html(this.template.render({
            adRemarks: AdRemark.all(),
            totalItems: AdRemark.total,
            page: parseInt(page || 1),
            sortOrder: sortOrder,
            sortKey: sortKey
          }));
        }).apply(this, this.routeParams);
      };

      AdRemarkList.prototype.create = function(evt) {
        var dialog;
        dialog = new Dialog;
        return dialog.show();
      };

      AdRemarkList.prototype.edit = function(evt) {
        var adRemark, dialog, id;
        id = $(evt.target).closest('tr').data('id');
        adRemark = AdRemark.find(id);
        dialog = new Dialog;
        return dialog.show(adRemark);
      };

      AdRemarkList.prototype.del = function(evt) {
        var adRemark, id;
        id = $(evt.target).closest('tr').data('id');
        adRemark = AdRemark.find(id);
        return rfl.alerts.confirm(rfl.util.formatMsg(langResourceAdRemark.msg.delUserConfirm, [adRemark.domains, adRemark.remark]), function() {
          return adRemark.ajaxDestroy();
        }, {
          makeSure: true
        });
      };

      return AdRemarkList;

    })(Spine.Controller);
    return AdRemarkList;
  });

}).call(this);