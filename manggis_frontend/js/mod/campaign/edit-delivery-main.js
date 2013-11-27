// Generated by CoffeeScript 1.6.3
(function() {
  define(function(require) {
    var $, AutoComplete, TimePicker, formUtil, fullScreenPage, langResourceCampaign, langResourceCommon, mainTpl, render, rfl, _askComplaint, _bindEvent, _complainNum, _data, _deliver, _dialog, _doSave, _groupMap, _initComplain, _initDatepicker, _initGroupMap, _newlyNum, _renderOneTimeInfo, _save, _showComplaintAndNewCustomer, _timePicker, _validateRecipients;
    $ = require('jquery');
    rfl = require('rfl');
    formUtil = require('form-util');
    AutoComplete = require('auto-complete');
    TimePicker = require('timepicker');
    fullScreenPage = require('mod/nav-bar/full-screen-page');
    langResourceCommon = require("../../lang/" + G.LANG + "/common");
    langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
    mainTpl = require('./edit-delivery.tpl.html');
    _data = null;
    _groupMap = null;
    _timePicker = null;
    _complainNum = null;
    _newlyNum = null;
    _dialog = null;
    _deliver = function() {
      return rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid) {
        var pageData;
        pageData = rfl.pageStorage.get();
        return rfl.ajax.get({
          url: "lists/campaigns/" + sid + "/send",
          success: function(res) {
            if (res.code === 0) {
              require(['./edit-overview-main'], function(mod) {
                return mod.render();
              });
              return _dialog.modal('hide');
            } else {
              return rfl.alerts.show(res.message, 'error');
            }
          },
          error: function() {
            return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
          }
        });
      });
    };
    _validateRecipients = function() {
      var customerGroups, deliverToAll;
      deliverToAll = !_data.oneTime && rfl.mockupFormControl.getRadioValue('deliverTo') === 'all';
      customerGroups = _data.oneTime || deliverToAll ? [] : _groupMap.getSelected('id');
      if (!_data.oneTime && !deliverToAll && !customerGroups.length) {
        formUtil.highLight('#delivery-groups', langResourceCommon.msg.validator.mandatory);
        formUtil.focus('#delivery-groups');
        return false;
      } else {
        formUtil.dehighLight('#delivery-groups');
        return true;
      }
    };
    _doSave = function(data, callback) {
      return rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid) {
        var customerGroups, deliverToAll, pageData, skipComplainedCustomer;
        pageData = rfl.pageStorage.get();
        deliverToAll = !_data.oneTime && rfl.mockupFormControl.getRadioValue('deliverTo') === 'all';
        skipComplainedCustomer = $('#skipComplainedCustomer')[0].checked;
        customerGroups = _data.oneTime || deliverToAll ? [] : _groupMap.getSelected('id');
        return rfl.ajax.put({
          url: "lists/campaigns/" + sid + "/delivery",
          data: $.extend(data, {
            deliverToAll: deliverToAll,
            customerGroups: customerGroups,
            skipComplainedCustomer: skipComplainedCustomer
          }),
          success: function(res) {
            if (res.code === 0) {
              return callback(res);
            } else {
              return rfl.alerts.show(res.message, 'error');
            }
          },
          error: function() {
            return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
          }
        });
      });
    };
    _save = function() {
      var data, date, deliverImmediately, hasError, scheduleDate, time;
      hasError = false;
      data = null;
      deliverImmediately = $('input[value="immediate"]')[0].checked;
      if (deliverImmediately) {
        if (_validateRecipients()) {
          data = {
            deliverImmediately: true
          };
        } else {
          hasError = true;
        }
      } else {
        date = $('#delivery-date').closest('.input-group').data('date-value');
        time = _timePicker.getMs();
        if (!_validateRecipients()) {
          hasError = true;
        }
        if (!$('#delivery-date').val()) {
          formUtil.highLight('#delivery-date', langResourceCommon.msg.validator.mandatory);
          hasError = true;
        } else {
          formUtil.dehighLight('#delivery-date');
        }
        if (time === -1) {
          formUtil.highLight('#time-picker', langResourceCommon.msg.validator.mandatory);
          hasError = true;
        } else {
          formUtil.dehighLight('#time-picker');
        }
        if (!hasError) {
          scheduleDate = date + time;
          rfl.pageStorage.set({
            scheduleDate: scheduleDate
          });
          data = {
            deliverImmediately: false,
            scheduleDate: scheduleDate
          };
        }
      }
      if (hasError) {
        return;
      }
      return _doSave(data, function(res) {
        return _dialog = rfl.dialog.create({
          content: 'Are you sure you want to deliver this campaign?',
          btns: [
            {
              text: "Let's go!",
              className: 'btn-primary',
              click: function() {
                return _deliver();
              }
            }, {
              text: 'Cancel',
              dismiss: true
            }
          ]
        });
      });
    };
    _initComplain = function() {
      return setTimeout(function() {
        return $('#complain').popover({
          container: 'body',
          placement: 'top',
          trigger: 'hover',
          content: 'Complained customer is the people who report your letter as spam before.'
        });
      }, 500);
    };
    _showComplaintAndNewCustomer = function(data) {
      if (data.noOfNewCustomer === 0) {
        $('#complain-note').hide();
      } else {
        $('#complain-num').html(data.noOfComplaint);
        $('#complain-note').show();
      }
      if (data.noOfNewCustomer === 0) {
        return $('#newly-import-note').hide();
      } else if (!rfl.localStorage.get('ignore-newly-import-note')) {
        $('#newly-num').html(data.noOfNewCustomer);
        return $('#newly-import-note').show();
      }
    };
    _askComplaint = function() {
      var customerGroups, deliverToAll, pageData;
      pageData = rfl.pageStorage.get();
      if (_data.oneTime) {
        return rfl.ajax.get({
          url: "lists/campaigns/" + _data.campaignId + "/calculateComplained",
          success: function(res) {
            if (res.code === 0) {
              return _showComplaintAndNewCustomer(res.data);
            } else {
              return rfl.alerts.show(res.message, 'error');
            }
          }
        });
      } else {
        deliverToAll = rfl.mockupFormControl.getRadioValue('deliverTo') === 'all';
        customerGroups = [];
        if (!deliverToAll) {
          if (!_groupMap) {
            return;
          }
          if (!customerGroups.length) {
            $('#complain-note').hide();
            $('#newly-import-note').hide();
            return;
          }
          customerGroups = _groupMap.getSelected('id');
        }
        return rfl.ajax.get({
          url: "lists/" + pageData.urlParams.listId + "/calculateComplained",
          data: {
            scope: deliverToAll ? 'all' : 'groups',
            customerGroups: customerGroups
          },
          success: function(res) {
            if (res.code === 0) {
              return _showComplaintAndNewCustomer(res.data);
            } else {
              return rfl.alerts.show(res.message, 'error');
            }
          }
        });
      }
    };
    _initGroupMap = function() {
      var pageData;
      pageData = rfl.pageStorage.get() || {};
      return require(['../customer/group-map-main', 'ajax!' + G.getAjaxLoadUrl('lists/' + pageData.urlParams.listId + '/groups')], function(GroupMap, data) {
        var groups;
        groups = data.data.groups;
        if (_groupMap || rfl.ajax.dealCommonCode(data.code) || data.code !== 0) {
          return;
        }
        _groupMap = new GroupMap('.delivery-group-selection', groups, {
          listId: pageData.urlParams.listId,
          maxSelection: 999,
          editable: true,
          selected: _data.customerGroups,
          onSelect: _askComplaint
        });
        return _askComplaint();
      });
    };
    _bindEvent = function() {
      rfl.Delegator.getPageDelegator().delegate('click', 'saveCampaignDelivery', function(evt, nextStep) {
        return _save(nextStep);
      }, 2).delegate('click', 'doNotShowAgain', function(evt) {
        rfl.localStorage.set('ignore-newly-import-note', 1);
        return $('#newly-import-note').hide();
      }, 1);
      rfl.mockupFormControl.on('toggle-radio', function(evt) {
        var target;
        target = evt.target;
        if (target.name === 'deliverType') {
          if (target.value === 'immediate') {
            return $('.delivery-schedule-setting').fadeOut();
          } else {
            return $('.delivery-schedule-setting').fadeIn();
          }
        } else if (target.name === 'deliverTo') {
          if (target.value === 'all') {
            $('.delivery-group-selection').fadeOut();
          } else {
            $('.delivery-group-selection').fadeIn();
            _initGroupMap();
          }
          return _askComplaint();
        }
      });
      return _bindEvent = rfl.empty;
    };
    _initDatepicker = function() {
      rfl.css.load('js/lib/datepicker/main.css');
      return require(['datepicker'], function(dp) {
        $('#delivery-date').closest('.input-group').datepicker({
          onRender: function(date) {
            var now;
            now = rfl.util.getSvrTime() - 1000 * 3600 * 24;
            if (date.getTime() < now) {
              return 'disabled';
            } else {
              return '';
            }
          }
        }).on('changeDate', function(evt) {
          if (evt.viewMode === 'days') {
            return $('#delivery-date').closest('.input-group').datepicker('hide');
          }
        });
        return $('#delivery-date').on('click', function(evt) {
          return $('#delivery-date').closest('.input-group').datepicker('show');
        });
      });
    };
    _renderOneTimeInfo = function() {
      return require(['ajax!' + G.getAjaxLoadUrl('lists/jobs/' + _data.importJobId), './edit-delivery-one-time-main.tpl.html'], function(jobRes, oneTimeTmpl) {
        if (jobRes.code === 0) {
          $('#one-time-info').html(oneTimeTmpl.render({
            listId: _data.listId,
            data: jobRes.data
          }));
          if (jobRes.data.info.added > 0) {
            return _askComplaint();
          }
        } else {
          return rfl.alerts.show(jobRes.message, 'error');
        }
      }, function() {
        return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
      });
    };
    render = function(container, data) {
      var pageData;
      pageData = rfl.pageStorage.get() || {};
      _data = data;
      _groupMap = null;
      _bindEvent();
      $(container).html(mainTpl.render({
        listId: pageData.urlParams.listId,
        urlParams: pageData.urlParams,
        data: data,
        dateFormat: 'yyyy-MM-dd',
        lang: {
          common: langResourceCommon,
          campaign: langResourceCampaign
        }
      }, {
        util: rfl.util
      }));
      _initComplain();
      if (data.oneTime) {
        _renderOneTimeInfo();
      } else if (!data.deliverToAll && data.customerGroups.length) {
        _initGroupMap();
      }
      _timePicker = new TimePicker('#time-picker', {
        id: 'delivery-time',
        initValue: data.scheduleDate
      });
      return _initDatepicker();
    };
    return {
      render: render
    };
  });

}).call(this);