// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice;

  define(function(require) {
    var $, formUtil, fullScreenPage, langResourceCampaign, langResourceCommon, mainTpl, render, rfl, shortcutSave, _autoChange, _bindEvent, _marks, _render, _savePlainText;
    $ = require('jquery');
    rfl = require('rfl');
    formUtil = require('form-util');
    fullScreenPage = require('mod/nav-bar/full-screen-page');
    langResourceCommon = require("../../lang/" + G.LANG + "/common");
    langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
    mainTpl = require('./edit-content-plain-text.tpl.html');
    shortcutSave = require('mod/campaign/save');
    _marks = null;
    _autoChange = false;
    _savePlainText = function(step) {
      var pageData;
      pageData = rfl.pageStorage.get();
      return rfl.ajax.put({
        url: "lists/campaigns/" + _marks[3] + "/plainText",
        data: {
          plainText: $('#plain-textarea').val(),
          plainTextAutoChange: _autoChange
        },
        success: function(res) {
          if (res.code === 0) {
            if (step) {
              return require(['./edit'], function(mod) {
                return mod.gotoStep(step);
              });
            } else {
              return rfl.alerts.show(res.message, 'success');
            }
          } else {
            return rfl.alerts.show(res.message, 'error');
          }
        },
        error: function() {
          return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
        }
      });
    };
    _bindEvent = function() {
      shortcutSave.bind(function() {
        return _savePlainText();
      });
      rfl.Delegator.getPageDelegator().delegate('click', 'savePlainText', function(evt, step) {
        return _savePlainText(step);
      }, 1).delegate('click', 'plainTextInsertCustomerProperty', function(evt) {
        return require(['lib/ckeditor-4.2.1/plugins/ripersonalizer/dialog-main'], function(dialog) {
          var range;
          range = formUtil.getInputRange(G.id('plain-textarea'));
          return dialog.show({
            insertHtml: function(content) {
              return formUtil.addText2Input(G.id('plain-textarea'), content, range);
            }
          }, {
            placement: 'right'
          });
        });
      }, 1).delegate('click', 'plainTextInsertLinkage', function(evt) {
        return require(['lib/ckeditor-4.2.1/plugins/rilink/dialog-main'], function(dialog) {
          var range;
          range = formUtil.getInputRange(G.id('plain-textarea'));
          return dialog.show({
            insertHtml: function(content, mode, extra) {
              return formUtil.addText2Input(G.id('plain-textarea'), extra.tag, range);
            }
          }, {
            noNeedText: true,
            placement: 'right'
          });
        });
      }, 1).delegate('click', 'retrievePlainText', function(evt) {
        var pageData;
        pageData = rfl.pageStorage.get();
        return rfl.ajax.get({
          url: "lists/campaigns/" + _marks[3] + "/generatePlainText",
          success: function(res) {
            if (res.code === 0) {
              $('#plain-textarea').val(res.data.plainText);
              return rfl.alerts.show(res.message, 'success');
            } else {
              return rfl.alerts.show(res.message, 'error');
            }
          },
          error: function() {
            return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
          }
        });
      }).delegate('click', 'autoChange', function(evt) {
        return _autoChange = !_autoChange;
      });
      return _bindEvent = rfl.empty;
    };
    _render = function(mark, action, base64Info, step, sid) {
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
        url: "lists/campaigns/" + _marks[3] + "/plainText",
        success: function(res) {
          if (res.code === 0) {
            _autoChange = !!res.data.plainTextAutoChange;
            $('#main-div').html(mainTpl.render({
              listId: pageData.urlParams.listId,
              marks: _marks,
              urlParams: pageData.urlParams,
              data: res.data,
              autoChange: _autoChange,
              lang: {
                common: langResourceCommon,
                campaign: langResourceCampaign
              }
            }));
            fullScreenPage.checkScroll('.app-content-wrapper');
            formUtil.moveInputEnd('#plain-textarea');
            return setTimeout(function() {
              return $('.off-screen').removeClass('off-left off-top');
            }, 0);
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
