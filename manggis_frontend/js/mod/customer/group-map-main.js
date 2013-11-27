// Generated by CoffeeScript 1.6.3
(function() {
  define(function(require) {
    var $, GroupMap, itemTpl, langResourceCommon, langResourceCustomer, mainTpl, rfl, selectionTpl;
    $ = require('jquery');
    rfl = require('rfl');
    mainTpl = require('./group-map.tpl.html');
    selectionTpl = require('./group-map-selection-result.tpl.html');
    itemTpl = require('./group-map-item.tpl.html');
    langResourceCommon = require('lang/{{G.LANG}}/common');
    langResourceCustomer = require('lang/{{G.LANG}}/customer');
    GroupMap = (function() {
      function GroupMap(container, groups, opt) {
        opt = opt || {};
        this._opt = opt;
        this._maxR = opt.maxR || 220;
        this._minR = opt.minR || 120;
        this._maxSelection = opt.maxSelection || 0;
        this._container = $(container);
        this._groups = [];
        this._maxGroupMemberCount = 0;
        this._searchKey = '';
        this._init(groups || []);
      }

      GroupMap.prototype._init = function(groups) {
        var selected, self;
        self = this;
        selected = {};
        this._groups = [];
        if (this._opt.selected) {
          $.each(this._opt.selected, function(i, item) {
            if (typeof item === 'string') {
              return selected[item] = true;
            } else {
              return selected[item.id] = true;
            }
          });
        }
        $.each(groups, function(i, group) {
          return self._maxGroupMemberCount = Math.max(self._maxGroupMemberCount, group.customers);
        });
        $.each(groups, function(i, group) {
          var item;
          item = {
            index: i,
            id: group.id,
            name: group.name,
            selected: selected[group.id],
            customerAmount: group.customers,
            openRate: group.openRate || Math.random() * 0.4,
            R: self._minR + parseInt((self._maxR - self._minR) * group.customers / Math.max(self._maxGroupMemberCount, 1))
          };
          if (item.openRate > 0.3) {
            item.type = 'A';
          } else if (item.openRate > 0.2) {
            item.type = 'B';
          } else if (item.openRate > 0.1) {
            item.type = 'C';
          } else if (item.openRate > 0.0) {
            item.type = 'D';
          } else {
            item.type = 'E';
          }
          return self._groups.push(item);
        });
        this._bindEvent();
        this.render();
        return setTimeout(function() {
          if (self._container) {
            self._checkSelectionResultShown();
            return setTimeout(arguments.callee, 2000);
          }
        }, 2000);
      };

      GroupMap.prototype._flush = function() {
        var self;
        self = this;
        this._maxGroupMemberCount = 0;
        $.each(this._groups, function(i, group) {
          return self._maxGroupMemberCount = Math.max(self._maxGroupMemberCount, group.customerAmount);
        });
        $.each(this._groups, function(i, group) {
          group.index = i;
          return group.R = self._minR + parseInt((self._maxR - self._minR) * group.customerAmount / Math.max(self._maxGroupMemberCount, 1));
        });
        if (this._searchKey) {
          return this._search(this._searchKey);
        } else {
          return this.render();
        }
      };

      GroupMap.prototype._showMsg = function(msg) {
        return $('.group-map-msg', this._container).html(msg);
      };

      GroupMap.prototype._addGroup = function(group) {
        var item, self;
        self = this;
        item = {
          index: this._groups.length,
          id: group.id,
          name: group.name,
          selected: false,
          customerAmount: 0,
          openRate: 0,
          R: this._minR,
          type: 'E'
        };
        this._groups.push(item);
        item = itemTpl.render({
          listId: this._opt.listId || G.listId,
          group: item,
          maxR: this._maxR,
          minR: this._minR,
          selectable: this._maxSelection > 0,
          editable: this._opt.editable,
          manageable: this._opt.manageable
        });
        $('.group-map-canvas', this._container).prepend($(item));
        setTimeout(function() {
          return $('.group-map-item', self._container).removeClass('group-map-item-hidden');
        }, 500);
        if (this._groups.length === 1) {
          return this._showMsg('');
        }
      };

      GroupMap.prototype._editGroup = function(target, url, callback, initVal) {
        return require(['instant-editor'], function(instantEditor) {
          return instantEditor.show({
            propertyType: 'TEXT'
          }, target, function(inputBox, opt) {
            return require(['form-util'], function(formUtil) {
              var val, valid;
              formUtil.setCommonMsg(langResourceCommon.msg.validator);
              valid = formUtil.validateOne(inputBox);
              val = inputBox.value;
              if (valid.passed) {
                return rfl.ajax[typeof initVal !== 'undefined' ? 'put' : 'post']({
                  url: url,
                  data: {
                    name: val
                  },
                  success: function(res) {
                    if (res.code === 0) {
                      if (callback) {
                        callback(res.data, val);
                      }
                      return instantEditor.hide();
                    } else {
                      return formUtil.highLight(inputBox, res.message);
                    }
                  },
                  error: function() {
                    return formUtil.highLight(inputBox, langResourceCommon.msg.serverBusy);
                  }
                });
              } else {
                return formUtil.focus(inputBox);
              }
            });
          }, {
            initVal: initVal,
            label: 'Action Set Name',
            validator: 'mandatory name',
            maxlength: rfl.config.MAX_LENGTH.NAME,
            lang: langResourceCommon
          });
        });
      };

      GroupMap.prototype._search = function(key) {
        var groups;
        if (!key) {
          key = $('.search-section input', this._container).val();
          key = $.trim(key.toLowerCase());
        }
        if (key) {
          this._searchKey = key;
          groups = [];
          $.each(this._groups, function(i, group) {
            if (group.name.toLowerCase().indexOf(key) >= 0) {
              return groups.push(group);
            }
          });
          this.render({
            groups: groups,
            noResultMsg: langResourceCustomer.msg.noGroupSearchResult
          });
          return $('.search-section .icon-remove-sign', this._container).show();
        } else {
          return $('.search-section input', this._container)[0].focus();
        }
      };

      GroupMap.prototype._bindEvent = function() {
        var self;
        self = this;
        return this._container.delegate('[data-rfl-click="select-group-map-item"]', 'click', function(evt) {
          var group, index, item, selected;
          index = $(this).closest('[data-index]').data('index');
          group = self._groups[index];
          item = $('.group-map-item[data-index="' + index + '"]', self._container);
          if (group.selected) {
            item.removeClass('group-selected');
            group.selected = false;
            if (self._opt.onDeselect) {
              self._opt.onDeselect(group);
            }
          } else {
            selected = self.getSelected();
            if (selected.length < self._maxSelection || self._maxSelection === 1) {
              if (self._maxSelection === 1) {
                $('.group-map-item', self._container).removeClass('group-selected');
                selected[0].selected = false;
                if (self._opt.onDeselect) {
                  self._opt.onDeselect(group);
                }
              }
              item.addClass('group-selected');
              group.selected = true;
              if (self._opt.onSelect) {
                self._opt.onSelect(group);
              }
            }
          }
          $('.selection-result', self._container).html(selectionTpl.render({
            groups: self._groups
          }));
          return self._checkSelectionResultShown();
        }).delegate('[data-rfl-click="create-group-map-item"]', 'click', function(evt) {
          return self._editGroup(evt.target, 'lists/' + (self._opt.listId || G.listId) + '/groups', function(group) {
            return self._addGroup(group);
          });
        }).delegate('[data-rfl-click="edit-group-map-item"]', 'click', function(evt) {
          var group, item;
          item = $(evt.target).closest('.group-map-item');
          group = self._groups[item.data('index')];
          return self._editGroup(evt.target, 'lists/groups/' + group.id, function(group, newName) {
            return $('.group-name', item).html(newName);
          }, group.name);
        }).delegate('[data-rfl-click="delete-group-map-item"]', 'click', function(evt) {
          var group, item;
          item = $(evt.target).closest('.group-map-item');
          group = self._groups[item.data('index')];
          return rfl.alerts.confirm(rfl.util.formatMsg(langResourceCustomer.msg.delGroupConfirm, [group.name]), function() {
            return rfl.ajax.del({
              queueName: 'delCustomerGroup',
              url: 'lists/groups/' + group.id,
              success: function(res) {
                if (res.code === 0) {
                  self._groups.splice(item.data('index'), 1);
                  return self._flush();
                } else {
                  return rfl.alerts.show(res.message, 'error');
                }
              },
              error: function() {
                return rfl.alerts.show(langResourceCommon.msg.serverBusy, 'error');
              }
            });
          }, {
            makeSure: true
          });
        }).delegate('[data-rfl-click="group-map-import"]', 'click', function(evt) {
          var group, item;
          item = $(evt.target).closest('.group-map-item');
          group = self._groups[item.data('index')];
          return rfl.util.gotoUrl('customer/import#!' + (self._opt.listId || G.listId) + '///' + group.id);
        }).delegate('[data-rfl-click="group-map-search"]', 'click', function(evt) {
          return self._search();
        }).delegate('[data-rfl-click="group-map-keyup-search"]', 'keyup', function(evt) {
          if (evt.keyCode === 13) {
            return self._search();
          }
        }).delegate('[data-rfl-click="group-map-clear-search"]', 'click', function(evt) {
          self._searchKey = '';
          return self.render();
        });
      };

      GroupMap.prototype._checkSelectionResultShown = function() {
        var cBottom, cTop, wBottom, wTop;
        if (!this._container) {
          return;
        }
        cTop = this._container.offset().top;
        cBottom = this._container.height() + cTop;
        wTop = $(window).scrollTop();
        wBottom = $(window).height() + wTop;
        if (wBottom < cTop + 100 || wTop > cBottom - 200 || !this.getSelected().length) {
          return $('.selection-result', this._container).removeClass('shown');
        } else {
          return $('.selection-result', this._container).addClass('shown');
        }
      };

      GroupMap.prototype.getSelected = function(property) {
        var res;
        res = [];
        $.each(this._groups, function(i, group) {
          if (group.selected) {
            return res.push(property ? group[property] : group);
          }
        });
        return res;
      };

      GroupMap.prototype.render = function(opt) {
        var groups;
        opt = opt || {};
        groups = opt.groups || this._groups.concat();
        this._container.html(mainTpl.render({
          listId: this._opt.listId || G.listId,
          groups: groups,
          maxR: this._maxR,
          minR: this._minR,
          selectable: this._maxSelection > 0,
          editable: this._opt.editable,
          manageable: this._opt.manageable,
          searchKey: this._searchKey,
          noResultMsg: opt.noResultMsg || langResourceCustomer.msg.noGroups
        }));
        $('.selection-result', this._container).html(selectionTpl.render({
          groups: this._groups
        }));
        $('.group-map-item', this._container).each(function(i, item) {
          return setTimeout(function() {
            return $(item).removeClass('group-map-item-hidden');
          }, 1000 * Math.random());
        });
        this._checkSelectionResultShown();
        return this;
      };

      GroupMap.prototype.destroy = function() {
        this._container.undelegate();
        this._container.html('');
        return this._container = null;
      };

      return GroupMap;

    })();
    return GroupMap;
  });

}).call(this);
