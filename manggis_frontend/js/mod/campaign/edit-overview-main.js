// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice;

  define(function(require) {
    var $, fullScreenPage, langResourceCampaign, langResourceCommon, mainTpl, render, rfl, _bindEvent, _data, _marks, _render;
    $ = require('jquery');
    rfl = require('rfl');
    fullScreenPage = require('mod/nav-bar/full-screen-page');
    langResourceCommon = require("../../lang/" + G.LANG + "/common");
    langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
    mainTpl = require('./edit-overview.tpl.html');
    _marks = null;
    _data = null;
    _bindEvent = function() {
      rfl.Delegator.getPageDelegator().delegate('click', 'returnToManageCampaigns', function(evt) {
        var pageData;
        pageData = rfl.pageStorage.get();
        if (_marks[4] === 'list') {
          history.back();
          return setTimeout(function() {
            return rfl.util.gotoUrl("campaign/list#!" + pageData.urlParams.listId);
          }, 1000);
        } else {
          return rfl.util.gotoUrl("campaign/list#!" + pageData.urlParams.listId);
        }
      }, 1).delegate('click', 'overviewPreviewHtml', function(evt) {
        return require(['./preview-main'], function(mod) {
          var pageData;
          pageData = rfl.pageStorage.get();
          return mod.init(pageData.urlParams.listId, _marks[3]);
        });
      }).delegate('click', 'overviewUploadSendSample', function(evt) {
        return require(['./sample-sender-main'], function(sender) {
          var pageData;
          pageData = rfl.pageStorage.get();
          return sender.show(pageData.urlParams.listId, _marks[3]);
        });
      }, 1).delegate('click', 'overviewPreviewPlainText', function(evt) {
        var pageData, self;
        if ($('.popover:visible', $(this).parent()).length) {
          $(this).popover('hide');
          return;
        }
        self = this;
        pageData = rfl.pageStorage.get();
        return rfl.ajax.post({
          url: "lists/campaigns/" + _marks[3] + "/previewPlainText",
          success: function(res) {
            var hidePopover;
            if (res.code === 0) {
              $(self).popover({
                html: true,
                animation: false,
                trigger: 'mannual',
                content: res.data.plainText.replace(/\n/g, '<br />')
              });
              $(self).popover('show');
              $('.popover', $(self).parent()).css({
                width: '600px',
                maxWidth: '600px'
              });
              $('.popover-content', $(self).parent()).css({
                maxHeight: '400px',
                overflowY: 'auto'
              });
              $(self).popover('show');
              return $(document).on('click', hidePopover = function(evt) {
                if ($(evt.target).hasClass('popover') || $(evt.target).closest('.popover').length) {
                  return;
                }
                $(self).popover('hide');
                return $(document).off('click', hidePopover);
              });
            } else {
              return rfl.alerts.show(res.message, 'error');
            }
          },
          error: function() {
            return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
          }
        });
      });
      return _bindEvent = rfl.empty;
    };
    _render = function(mark, action, base64Info, step, sid, from) {
      var editable, pageData;
      if (action == null) {
        action = 'view';
      }
      if (!sid) {
        rfl.ui.renderInvalidUrl('#main-div');
        return;
      }
      _marks = [action, base64Info, step, sid, from];
      pageData = rfl.pageStorage.get() || {};
      _bindEvent();
      return editable = rfl.ajax.get({
        url: "lists/campaigns/" + _marks[3] + "/overview",
        success: function(res) {
          var readyToDeliver, _ref;
          if (res.code === 0) {
            _data = res.data;
            readyToDeliver = _data.campaign.subject && (_data.campaign.fromName && _data.campaign.fromEmail) && (_data.campaign.replyToName && _data.campaign.replyToEmail) && _data.htmlDefined;
            editable = (_ref = _data.status) === 'DRAFT' || _ref === 'PENDING';
            $('#main-div').html(mainTpl.render({
              listId: pageData.urlParams.listId,
              marks: _marks,
              urlParams: pageData.urlParams,
              data: _data,
              readyToDeliver: readyToDeliver,
              editable: editable,
              lang: {
                common: langResourceCommon,
                campaign: langResourceCampaign
              }
            }, {
              util: rfl.util
            }));
            fullScreenPage.checkScroll('.app-content-wrapper');
            if (editable) {
              if (readyToDeliver) {
                return require(['./edit-delivery-main'], function(mod) {
                  return mod.render('.delivery-rule', $.extend({
                    listId: pageData.urlParams.listId,
                    campaignId: sid
                  }, _data.delivery));
                });
              }
            } else {

            }
          } else if (res.code === rfl.config.RES_CODE.RESOURCE_NOT_EXIST) {
            return rfl.ui.renderInvalidUrl('#main-div');
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
    };
    render = function() {
      return rfl.ajax.history.dispatch(function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _render.apply(null, args);
      });
    };
    return {
      render: render
    };
  });

}).call(this);