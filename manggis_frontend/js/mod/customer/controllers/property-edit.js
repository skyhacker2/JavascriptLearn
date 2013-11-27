// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var $, Property, PropertyEdit, Spine, formUtil, langResourceCommon, langResourceCustomer, rfl, _ref;
    $ = require('jquery');
    Spine = require('spine');
    rfl = require('rfl');
    formUtil = require('form-util');
    langResourceCommon = require('lang/{{G.LANG}}/common');
    langResourceCustomer = require('lang/{{G.LANG}}/customer');
    Property = require('../models/property');
    PropertyEdit = (function(_super) {
      __extends(PropertyEdit, _super);

      function PropertyEdit() {
        this.cancel = __bind(this.cancel, this);
        this.save = __bind(this.save, this);
        this.delSetItem = __bind(this.delSetItem, this);
        this.render = __bind(this.render, this);
        this.ajaxError = __bind(this.ajaxError, this);
        _ref = PropertyEdit.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      PropertyEdit.init = function(options) {
        return this.instance = new PropertyEdit(options);
      };

      PropertyEdit.changeDataType = function(type) {
        var _ref1, _ref2, _ref3;
        if (type == null) {
          type = $('#edit-property-dataType', (_ref1 = this.instance) != null ? _ref1.el : void 0).val();
        }
        if (type === 'SET' || type === 'MULTISET') {
          return (_ref2 = this.instance) != null ? _ref2.showSetForm() : void 0;
        } else {
          return (_ref3 = this.instance) != null ? _ref3.hideSetForm() : void 0;
        }
      };

      PropertyEdit.prototype.elements = {
        '#edit-set-form': 'elSetForm'
      };

      PropertyEdit.prototype.events = {
        'submit form': 'save',
        'click [data-save-btn]': 'save',
        'click [data-cancel-btn]': 'cancel',
        'click [data-del-set-btn]': 'delSetItem'
      };

      PropertyEdit.prototype.template = require('../views/property-edit.tpl.html');

      PropertyEdit.prototype.init = function() {
        var _this = this;
        Property.on('refresh', this.render);
        Property.on('ajaxError ajaxBizError', this.ajaxError);
        this.routes({
          '!/:listId/:propertyId': function(params) {
            _this.listId = params.listId;
            Property.setListId(_this.listId);
            return Property.ajaxFetch({
              ajax: {
                id: params.propertyId
              }
            });
          },
          '!/:listId': function(params) {
            _this.listId = params.listId;
            Property.setListId(_this.listId);
            return _this.render();
          },
          '*glob': function(params) {
            return rfl.ui.renderInvalidUrl('#main-div');
          }
        });
        Spine.Route.setup();
        return formUtil.setCommonMsg(langResourceCommon.msg.validator);
      };

      PropertyEdit.prototype.ajaxError = function(record, type, res, status, xhr) {
        if (!rfl.ajax.dealCommonCode(res.code)) {
          return rfl.alerts.show(res.message || langResourceCommon.msg.serverBusy, 'error');
        }
      };

      PropertyEdit.prototype.render = function() {
        var property;
        property = Property.first();
        this.html(this.template.render({
          isEdit: !!property,
          listId: this.listId,
          property: property || {}
        }));
        formUtil.initPlaceHolder($('#edit-property-form .place-holder-input', this.el));
        return PropertyEdit.changeDataType();
      };

      PropertyEdit.prototype.showSetForm = function() {
        this.elSetForm.show();
        return formUtil.focus($('#edit-property-set', this.el));
      };

      PropertyEdit.prototype.hideSetForm = function() {
        return this.elSetForm.hide();
      };

      PropertyEdit.prototype.delSetItem = function(evt) {
        var i, item, items, property;
        i = $(evt.currentTarget).data('index');
        property = Property.first();
        items = property.items;
        item = items[i];
        if (item) {
          items.splice(i, 1);
          return $('#existing-property-set-div', this.el).html(require('../views/property-edit-set.tpl.html').render({
            property: property
          }));
        }
      };

      PropertyEdit.prototype.save = function(evt) {
        var items, property, val, valid, _i, _len, _ref1,
          _this = this;
        if (evt != null) {
          evt.preventDefault();
        }
        valid = formUtil.validate($('#edit-property-form', this.el));
        if (!valid.passed) {
          formUtil.focus(valid.failList[0].item);
          return;
        }
        items = [];
        property = Property.first();
        if (property) {
          $('#existing-property-set-div', this.el).find('input').each(function(i, item) {
            return items.push({
              id: $(item).data('id'),
              value: item.value
            });
          });
        }
        if ((valid.data.propertyType === 'SET' || valid.data.propertyType === 'MULTISET') && !items.length && !valid.data.items.length) {
          formUtil.focus($('#edit-property-set', this.el));
          formUtil.highLight($('#edit-property-set', this.el), langResourceCommon.msg.validator.mandatory);
          return;
        }
        _ref1 = valid.data.items;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          val = _ref1[_i];
          items.push({
            value: val
          });
        }
        if (property) {
          return property.fromForm('#edit-property-form').load({
            items: items
          }).ajaxUpdate({
            done: function() {
              return rfl.util.gotoUrl("customer/property-list#!/" + _this.listId);
            }
          });
        } else {
          property = new Property();
          return property.fromForm('#edit-property-form').load({
            items: items
          }).ajaxCreate({
            done: function() {
              return rfl.util.gotoUrl("customer/property-list#!/" + _this.listId);
            }
          });
        }
      };

      PropertyEdit.prototype.cancel = function() {
        return rfl.util.gotoUrl("customer/property-list#!/" + this.listId);
      };

      return PropertyEdit;

    })(Spine.Controller);
    return PropertyEdit;
  });

}).call(this);