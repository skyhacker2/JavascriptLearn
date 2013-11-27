// Generated by CoffeeScript 1.6.3
(function() {
  var __slice = [].slice;

  define(function(require) {
    var $, AutoComplete, formUtil, fullScreenPage, langResourceCampaign, langResourceCommon, mainTpl, personalizeSubjectTpl, render, replyToTpl, rfl, shortcutSave, _bindEvent, _createAutoComplete, _data, _doSave, _initFromAutoComplete, _initReplyToAutoComplete, _marks, _range, _render, _save, _showSubjectPersonalizer;
    $ = require('jquery');
    rfl = require('rfl');
    formUtil = require('form-util');
    AutoComplete = require('auto-complete');
    shortcutSave = require('mod/campaign/save');
    fullScreenPage = require('mod/nav-bar/full-screen-page');
    langResourceCommon = require("../../lang/" + G.LANG + "/common");
    langResourceCampaign = require("../../lang/" + G.LANG + "/campaign");
    mainTpl = require('./edit-campaign.tpl.html');
    replyToTpl = require('./edit-campaign-reply-to.tpl.html');
    personalizeSubjectTpl = require('./edit-campaign-personalize-subject.tpl.html');
    _marks = null;
    _data = {};
    _range = null;
    _doSave = function(callback) {
      var data, pageData, sid, valid;
      valid = formUtil.validate('.campaign-form');
      data = formUtil.getData('.campaign-form');
      data.replyToName = data.replyToName || data.fromName;
      data.replyToEmail = data.replyToEmail || data.fromEmail;
      data.useAdRemark = $('#enableAdRemark')[0].checked;
      if (valid.passed) {
        if (_marks[0] === 'create') {
          rfl.util.unshiftLocalStoredList('FROM_NAME', data.fromName);
          rfl.util.unshiftLocalStoredList('FROM_EMAIL', data.fromEmail);
          if (data.replyToName !== data.fromName) {
            rfl.util.unshiftLocalStoredList('REPLY_TO_NAME', data.replyToName);
          }
          if (data.replyToEmail !== data.fromEmail) {
            rfl.util.unshiftLocalStoredList('REPLY_TO_EMAIL', data.replyToEmail);
          }
        }
        pageData = rfl.pageStorage.get();
        sid = _marks[3] || pageData.sid;
        if (_marks[0] === 'duplicate') {
          return rfl.ajax.put({
            url: "lists/campaigns/" + sid + "/duplicate",
            data: data,
            success: function(res) {
              if (res.code === 0) {
                callback(res);
                return rfl.alerts.show(res.message, 'success');
              } else {
                return rfl.alerts.show(res.message, 'error');
              }
            },
            error: function() {
              return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
            }
          });
        } else {
          return rfl.ajax[sid ? 'put' : 'post']({
            url: sid ? "lists/campaigns/" + sid : "lists/" + pageData.urlParams.listId + "/campaigns",
            data: data,
            success: function(res) {
              if (res.code === 0) {
                rfl.pageStorage.set({
                  sid: res.data.id
                });
                callback(res);
                if (!sid) {
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
        }
      } else {
        return formUtil.focus(valid.failList[0].item);
      }
    };
    _save = function(nextStep) {
      return _doSave(function(res) {
        var contentEditor;
        if (nextStep) {
          if (nextStep === 'content') {
            contentEditor = res.data.contentEditor;
            if (contentEditor === rfl.config.CAMPAIGN_CONTENT_EDITOR.DESIGNER) {
              nextStep = 'content-design';
            } else if (contentEditor === rfl.config.CAMPAIGN_CONTENT_EDITOR.CKEDITOR) {
              nextStep = 'content-upload-edit';
            } else {
              nextStep = 'content-select-type';
            }
          }
          return location.hash = '!' + [(_marks[0] === 'duplicate' ? 'edit' : _marks[0]), _marks[1], nextStep, res.data.id].join('/');
        } else {
          rfl.alerts.show(res.message, 'success');
          $('.header-inner .campaign-name').html(rfl.util.encodeHtml($('#campaign-name').val()));
          if (_marks[0] === 'duplicate') {
            return location.hash = '!' + ['edit', _marks[1], _marks[2], res.data.id].join('/');
          }
        }
      });
    };
    _showSubjectPersonalizer = function(evt) {
      var pageData;
      pageData = rfl.pageStorage.get();
      return rfl.service.getFrequencyOrderProperties(pageData.urlParams.listId, function(propertys) {
        var dataSource;
        dataSource = propertys.concat();
        dataSource.sort(function(a, b) {
          if (a.basic) {
            if (b.basic) {
              return a.propertyType - b.propertyType;
            } else {
              return -1;
            }
          } else {
            return 1;
          }
        });
        $('#personalize-subject-div').html(personalizeSubjectTpl.render({
          lang: {
            common: langResourceCommon,
            campaign: langResourceCampaign
          }
        }));
        new AutoComplete('#subject-property-list', {
          maxSelection: 1,
          dataSource: dataSource,
          onBeforeSelect: function(item) {
            formUtil.addText2Input(G.id('campaign-subject'), '${' + item.tag + '}', _range);
            rfl.service.unshiftProperty(item.id);
            return false;
          }
        });
        formUtil.initPlaceHolder('#subject-property-list');
        formUtil.focus('#subject-property-list');
        return $(evt.target).closest('span').remove();
      });
    };
    _bindEvent = function() {
      var ieTest, subjectLenHintShown;
      subjectLenHintShown = false;
      ieTest = navigator.appVersion.match(/MSIE\s(\d\.\d)/);
      if (ieTest && +ieTest[1] < 10) {
        $(document).on('click keyup select', '#campaign-subject', function(evt) {
          return _range = formUtil.getInputRange(G.id('campaign-subject'));
        });
      }
      shortcutSave.bind(function() {
        return _save();
      });
      rfl.Delegator.getPageDelegator().delegate('click', 'saveCampaign', function(evt, step) {
        return _save(step);
      }, 2).delegate('keyup', 'step1KeyupSubmit', function(evt, min, max) {
        var len, target;
        if (evt.keyCode === 13) {
          return _save('content');
        } else if (min && max) {
          min = +min;
          max = +max;
          target = evt.target;
          len = rfl.util.getByteLength(target.value);
          if (len > 0) {
            if (len < min || len > max) {
              formUtil.showInputHint(target, "For better Open Rate, you should enter " + min + "-" + max + " characters.", 'warning');
            } else {
              formUtil.showInputHint(target, 'Want to improve your Open Rate? Please click <a href="#" target="_blank">here</a> to get more suggestions!', 'info');
            }
            return subjectLenHintShown = true;
          } else if (subjectLenHintShown) {
            return formUtil.hideInputHint(target, true);
          }
        }
      }, 1).delegate('click', 'showReplySetting', function(evt) {
        $(this).closest('.control-group').removeClass('last');
        $(this).closest('div').remove();
        $('#reply-to-div').html(replyToTpl.render({
          lang: {
            common: langResourceCommon,
            campaign: langResourceCampaign
          },
          data: {}
        }));
        _initReplyToAutoComplete();
        return formUtil.focus('#reply-to-email');
      }, 1).delegate('click', 'showPersonalizeSubject', function(evt) {
        return setTimeout(function() {
          return _showSubjectPersonalizer(evt);
        }, 200);
      }, 1);
      return _bindEvent = rfl.empty;
    };
    _createAutoComplete = function(box, dataSource) {
      return new AutoComplete(box, {
        freeInput: true,
        maxSelection: 1,
        dataSource: dataSource,
        getStdItem: function(item) {
          return {
            id: item,
            name: item
          };
        }
      });
    };
    _initReplyToAutoComplete = function() {
      var emailList, nameList;
      nameList = rfl.util.getLocalStoredList('REPLY_TO_NAME');
      if (nameList.length) {
        if (!_data.replyToName) {
          $('#reply-to-name').val(nameList[0] || '');
        }
        if (nameList.length > 1) {
          _createAutoComplete('#reply-to-name', nameList);
        }
      }
      emailList = rfl.util.getLocalStoredList('REPLY_TO_EMAIL');
      if (emailList.length) {
        if (!_data.replyToEmail) {
          $('#reply-to-email').val(emailList[0] || '');
        }
        if (emailList.length > 1) {
          return _createAutoComplete('#reply-to-email', emailList);
        }
      }
    };
    _initFromAutoComplete = function() {
      var emailList, nameList;
      nameList = rfl.util.getLocalStoredList('FROM_NAME');
      if (nameList.length) {
        if (!_data.fromName) {
          $('#from-name').val(nameList[0] || '');
        }
        if (nameList.length > 1) {
          _createAutoComplete('#from-name', nameList);
        }
      }
      emailList = rfl.util.getLocalStoredList('FROM_EMAIL');
      if (emailList.length) {
        if (!_data.fromEmail) {
          $('#from-email').val(emailList[0] || '');
        }
        if (emailList.length > 1) {
          return _createAutoComplete('#from-email', emailList);
        }
      }
    };
    _render = function(mark, action, base64Info, step, sid) {
      var doRender, pageData;
      if (action == null) {
        action = 'create';
      }
      doRender = function(data) {
        $('#main-div').html(mainTpl.render({
          listId: pageData.urlParams.listId,
          marks: _marks,
          urlParams: pageData.urlParams,
          data: data,
          lang: {
            common: langResourceCommon,
            campaign: langResourceCampaign
          }
        }));
        fullScreenPage.checkScroll('.app-content-wrapper');
        _initFromAutoComplete();
        formUtil.initInputHint();
        formUtil.focus('#campaign-name');
        $('#showPrefixIntr').popover({
          html: true,
          content: 'Some ISP likes 163 will treat our letter as spam if we don&apos; add [AD] in the subject. Enable subject suffix, and system will automatic add it in the subject for all this ISP.',
          trigger: 'hover',
          placement: 'top'
        });
        return setTimeout(function() {
          return $('.off-screen').removeClass('off-left off-top');
        }, 0);
      };
      pageData = rfl.pageStorage.get() || {};
      sid = sid || pageData.sid;
      _marks = [action, base64Info, step, sid];
      _bindEvent();
      formUtil.setCommonMsg(langResourceCommon.msg.validator);
      if (sid) {
        return rfl.ajax.get({
          url: "lists/campaigns/" + sid,
          success: function(res) {
            if (res.code === 0) {
              _data = res.data;
              return doRender(res.data);
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
      } else {
        return doRender({
          useAdRemark: true
        });
      }
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