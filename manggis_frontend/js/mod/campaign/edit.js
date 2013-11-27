// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice;

  define(function(require) {
    var $, getContentData, gotoEditContent, gotoStep, init, langResourceCampaign, langResourceCommon, mainTpl, render, rfl, showSpamRating, _bindEvent, _marks, _render;
    $ = require('jquery');
    rfl = require('rfl');
    langResourceCommon = require("../../lang/" + G.LANG + "/common");
    langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
    mainTpl = require('./edit.tpl.html');
    _marks = null;
    _bindEvent = function() {
      rfl.Delegator.getPageDelegator().delegate('click', 'selectCampaignType', function(evt, type) {
        return rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid) {
          if (action == null) {
            action = 'create';
          }
          if (base64Info == null) {
            base64Info = '';
          }
          rfl.pageStorage.set({
            sid: ''
          });
          return location.hash = '!' + [action, base64Info, 'campaign', '', type].join('/');
        });
      }, 2).delegate('click', 'gotoStep', function(evt, targetStep) {
        return gotoStep(targetStep);
      }, 2).delegate('click', 'viewSpamRating', function(evt) {
        return require(['./edit'], function(mod) {
          return mod.showSpamRating();
        });
      }, 1);
      $(document).on('keydown', function(evt) {
        if (evt.ctrlKey && evt.which === 83) {
          evt.preventDefault();
          return false;
        }
      });
      return _bindEvent = rfl.empty;
    };
    _render = function(mark, action, base64Info, step, sid) {
      var pageData;
      if (action == null) {
        action = 'create';
      }
      pageData = rfl.pageStorage.get() || {};
      if (!pageData.urlParams || base64Info && base64Info !== _marks[1]) {
        _marks = [action, base64Info, step, sid];
        if (base64Info) {
          rfl.util.fromBase64(base64Info, function(res) {
            if (res) {
              pageData.urlParams = res;
              rfl.pageStorage.set(pageData);
              G.listId = res.listId;
              return _render(mark, action, base64Info, step, sid);
            } else {
              return rfl.ui.renderInvalidUrl('#main-div');
            }
          }, true);
        } else {
          rfl.ui.renderInvalidUrl('#main-div');
        }
        return;
      }
      _marks = [action, base64Info, step, sid];
      if (step) {
        require(["./edit-" + step + "-main"], function(mod) {
          return mod.render();
        }, function() {
          return rfl.ui.renderPageLoadError('#main-div');
        });
      } else {
        $('#main-div').html(mainTpl.render({
          marks: [action, base64Info, step, sid],
          urlParams: pageData.urlParams,
          lang: {
            common: langResourceCommon,
            campaign: langResourceCampaign
          }
        }));
      }
      return _bindEvent();
    };
    getContentData = function(callback) {
      var contentData, pageData;
      pageData = rfl.pageStorage.get() || {};
      contentData = pageData.contentData;
      if (contentData) {
        rfl.pageStorage.set({
          contentData: null
        });
        callback({
          code: 0,
          message: 'ok',
          data: contentData
        });
        return;
      }
      return rfl.ajax.get({
        url: "lists/campaigns/" + _marks[3] + "/content",
        success: function(res) {
          return callback(res);
        },
        error: function() {
          return callback({
            code: -1,
            message: langResourceCommon.msg.serverBusy,
            data: null
          });
        }
      });
    };
    gotoStep = function(targetStep) {
      if (targetStep === 'content') {
        return gotoEditContent();
      } else {
        return rfl.ajax.history.dispatch(function(mark, action, base64Info, step, sid) {
          return location.hash = '!' + [action, base64Info, targetStep, sid].join('/');
        });
      }
    };
    gotoEditContent = function() {
      return getContentData(function(res) {
        var step;
        if (res.code === 0) {
          rfl.pageStorage.set({
            contentData: res.data
          });
          step = 'content-select-type';
          if (res.data.contentEditor === rfl.config.CAMPAIGN_CONTENT_EDITOR.DESIGNER) {
            step = 'content-design';
          } else if (res.data.contentEditor === rfl.config.CAMPAIGN_CONTENT_EDITOR.CKEDITOR) {
            step = 'content-upload-edit';
          }
          return gotoStep(step);
        } else {
          return rfl.alerts.show(res.message, 'error');
        }
      });
    };
    showSpamRating = function(content) {
      var pageData;
      pageData = rfl.pageStorage.get();
      return rfl.ajax.get({
        url: "lists/campaigns/" + _marks[3] + "/spamRating",
        success: function(res) {
          if (res.code === 0) {
            return require(['just-gage', './spam-rating-main.tpl.html'], function(JustGage, spamRatingTpl) {
              return rfl.dialog.create({
                show: false,
                title: 'Spam Rating',
                content: spamRatingTpl.render({
                  data: res.data,
                  lang: {
                    common: langResourceCommon,
                    campaign: langResourceCampaign
                  }
                }),
                btns: [
                  {
                    dismiss: true,
                    text: langResourceCommon.label.close
                  }
                ]
              }).on('shown.bs.modal', function() {
                return new JustGage({
                  id: 'gauge',
                  value: res.data.score,
                  min: 0,
                  max: res.data.thresholdScore,
                  title: 'Spam Rating'
                });
              }).modal('show');
            });
          } else {
            return rfl.alerts.show(res.message, 'error');
          }
        },
        error: function() {
          return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
        }
      });
    };
    render = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length) {
        return _render.apply(null, args);
      } else {
        return rfl.ajax.history.dispatch(function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _render.apply(null, args);
        });
      }
    };
    init = function(listId, listRes) {
      if (!rfl.auth.checkAndWarn('PERM_USER_ADMIN')) {
        return;
      }
      return rfl.ajax.history.init(6, render);
    };
    return {
      getContentData: getContentData,
      gotoStep: gotoStep,
      gotoEditContent: gotoEditContent,
      showSpamRating: showSpamRating,
      render: render,
      init: init
    };
  });

}).call(this);
