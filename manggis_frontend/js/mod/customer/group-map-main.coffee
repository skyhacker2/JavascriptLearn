define (require) ->
	$ = require 'jquery'
	rfl = require 'rfl'
	mainTpl = require './group-map.tpl.html'
	selectionTpl = require './group-map-selection-result.tpl.html'
	itemTpl = require './group-map-item.tpl.html'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceCustomer = require 'lang/{{G.LANG}}/customer'

	class GroupMap
		constructor: (container, groups, opt) ->
			opt = opt or {}
			this._opt = opt
			this._maxR = opt.maxR or 220
			this._minR = opt.minR or 120
			this._maxSelection = opt.maxSelection or 0
			this._container = $(container)
			this._groups = []
			this._maxGroupMemberCount = 0
			this._searchKey = ''
			this._init(groups or[])

		_init: (groups) ->
			self = this
			selected = {}
			this._groups = []
			if this._opt.selected
				$.each this._opt.selected, (i, item) ->
					if typeof item is 'string'
						selected[item] = true
					else
						selected[item.id] = true
			$.each groups, (i, group) ->
				self._maxGroupMemberCount = Math.max self._maxGroupMemberCount, group.customers
			$.each groups, (i, group) ->
				item =
					index: i
					id: group.id
					name: group.name
					selected: selected[group.id]
					customerAmount: group.customers
					openRate: group.openRate or Math.random() * 0.4 #TODO
					R: self._minR + parseInt((self._maxR - self._minR) * group.customers / Math.max self._maxGroupMemberCount, 1)
				if item.openRate > 0.3
					item.type = 'A'
				else if item.openRate > 0.2
					item.type = 'B'
				else if item.openRate > 0.1
					item.type = 'C'
				else if item.openRate > 0.0
					item.type = 'D'
				else
					item.type = 'E'
				self._groups.push item
			this._bindEvent()
			this.render()
			setTimeout ->
				if self._container
					self._checkSelectionResultShown()
					setTimeout arguments.callee, 2000
			, 2000

		_flush: () ->
			self = this
			this._maxGroupMemberCount = 0
			$.each this._groups, (i, group) ->
				self._maxGroupMemberCount = Math.max self._maxGroupMemberCount, group.customerAmount
			$.each this._groups, (i, group) ->
				group.index = i
				group.R = self._minR + parseInt((self._maxR - self._minR) * group.customerAmount / Math.max self._maxGroupMemberCount, 1)
			if this._searchKey
				this._search(this._searchKey)
			else
				this.render()

		_showMsg: (msg) ->
			$('.group-map-msg', this._container).html msg

		_addGroup: (group) ->
			self = this
			item =
				index: this._groups.length
				id: group.id
				name: group.name
				selected: false
				customerAmount: 0
				openRate: 0
				R: this._minR
				type: 'E'
			this._groups.push item
			item = itemTpl.render
				listId: this._opt.listId or G.listId
				group: item
				maxR: this._maxR
				minR: this._minR
				selectable: this._maxSelection > 0
				editable: this._opt.editable
				manageable: this._opt.manageable
			$('.group-map-canvas', this._container).prepend $(item)
			setTimeout ->
				$('.group-map-item', self._container).removeClass 'group-map-item-hidden'
			, 500
			if this._groups.length is 1
				this._showMsg ''

		_editGroup: (target, url, callback, initVal) ->
			require ['instant-editor'], (instantEditor) ->
				instantEditor.show 
					propertyType: 'TEXT'
					, target
					, (inputBox, opt) ->
						require ['form-util'], (formUtil) ->
							formUtil.setCommonMsg langResourceCommon.msg.validator
							valid = formUtil.validateOne inputBox
							val = inputBox.value
							if valid.passed
								rfl.ajax[if typeof initVal isnt 'undefined' then 'put' else 'post']
									url: url
									data:
										name: val
									success: (res) ->
										if res.code is 0
											if callback
												callback res.data, val
											instantEditor.hide()
										else
											formUtil.highLight inputBox, res.message
									error: () ->
										formUtil.highLight inputBox, langResourceCommon.msg.serverBusy
							else
								formUtil.focus inputBox
					, {
						initVal: initVal
						label: 'Action Set Name'
						validator: 'mandatory name'
						maxlength: rfl.config.MAX_LENGTH.NAME
						lang: langResourceCommon
					}

		_search: (key) ->
			if not key
				key = $('.search-section input', this._container).val()
				key = $.trim key.toLowerCase()
			if key
				this._searchKey = key
				groups = []
				$.each this._groups, (i, group) ->
					if group.name.toLowerCase().indexOf(key) >= 0
						groups.push group
				this.render
					groups: groups
					noResultMsg: langResourceCustomer.msg.noGroupSearchResult
				$('.search-section .icon-remove-sign', this._container).show()
			else
				$('.search-section input', this._container)[0].focus()

		_bindEvent: () ->
			self = this
			this._container.delegate '[data-rfl-click="select-group-map-item"]', 'click', (evt) ->
				index = $(this).closest('[data-index]').data 'index'
				group = self._groups[index]
				item = $('.group-map-item[data-index="' + index + '"]', self._container)
				if group.selected
					item.removeClass 'group-selected'
					group.selected = false
					if self._opt.onDeselect
						self._opt.onDeselect group
				else
					selected = self.getSelected()
					if selected.length < self._maxSelection or self._maxSelection is 1
						if self._maxSelection is 1
							$('.group-map-item', self._container).removeClass 'group-selected'
							selected[0].selected = false
							if self._opt.onDeselect
								self._opt.onDeselect group
						item.addClass 'group-selected'
						group.selected = true
						if self._opt.onSelect
							self._opt.onSelect group
				$('.selection-result', self._container).html selectionTpl.render
					groups: self._groups
				self._checkSelectionResultShown()
			.delegate '[data-rfl-click="create-group-map-item"]', 'click', (evt) ->
				self._editGroup evt.target, 'lists/' + (self._opt.listId or G.listId) + '/groups', (group) ->
					self._addGroup group
			.delegate '[data-rfl-click="edit-group-map-item"]', 'click', (evt) ->
				item = $(evt.target).closest('.group-map-item')
				group = self._groups[item.data 'index']
				self._editGroup evt.target, 'lists/groups/' + group.id, (group, newName) ->
					$('.group-name', item).html newName
				, group.name
			.delegate '[data-rfl-click="delete-group-map-item"]', 'click', (evt) ->
				item = $(evt.target).closest('.group-map-item')
				group = self._groups[item.data 'index']
				rfl.alerts.confirm rfl.util.formatMsg(langResourceCustomer.msg.delGroupConfirm, [group.name])
					, () ->
						rfl.ajax.del
							queueName: 'delCustomerGroup',
							url: 'lists/groups/' + group.id
							success: (res) ->
								if res.code is 0
									self._groups.splice item.data('index'), 1
									self._flush()
								else
									rfl.alerts.show res.message,'error'
							error: () ->
								rfl.alerts.show langResourceCommon.msg.serverBusy, 'error'
					, makeSure: true
			.delegate '[data-rfl-click="group-map-import"]', 'click', (evt) ->
				item = $(evt.target).closest('.group-map-item')
				group = self._groups[item.data 'index']
				rfl.util.gotoUrl 'customer/import#!' + (self._opt.listId or G.listId) + '///' + group.id
			.delegate '[data-rfl-click="group-map-search"]', 'click', (evt) ->
				self._search()
			.delegate '[data-rfl-click="group-map-keyup-search"]', 'keyup', (evt) ->
				if evt.keyCode is 13
					self._search()
			.delegate '[data-rfl-click="group-map-clear-search"]', 'click', (evt) ->
				self._searchKey = ''
				self.render()

		_checkSelectionResultShown: () ->
			if not this._container
				return
			cTop = this._container.offset().top
			cBottom = this._container.height() + cTop
			wTop = $(window).scrollTop()
			wBottom = $(window).height() + wTop
			if wBottom < cTop + 100 or wTop > cBottom - 200 or not this.getSelected().length
				$('.selection-result', this._container).removeClass 'shown'
			else
				$('.selection-result', this._container).addClass 'shown'

		getSelected: (property) ->
			res = []
			$.each this._groups, (i, group) ->
				if group.selected
					res.push if property then group[property] else group
			return res

		render: (opt) ->
			opt = opt or {}
			groups = opt.groups or this._groups.concat()
			this._container.html mainTpl.render
				listId: this._opt.listId or G.listId
				groups: groups
				maxR: this._maxR
				minR: this._minR
				selectable: this._maxSelection > 0
				editable: this._opt.editable
				manageable: this._opt.manageable
				searchKey: this._searchKey
				noResultMsg: opt.noResultMsg or langResourceCustomer.msg.noGroups
			$('.selection-result', this._container).html selectionTpl.render
				groups: this._groups
			$('.group-map-item', this._container).each (i, item) ->
				setTimeout ->
					$(item).removeClass 'group-map-item-hidden'
				, 1000 * Math.random()
			this._checkSelectionResultShown();
			return this

		destroy: () ->
			this._container.undelegate();
			this._container.html ''
			this._container = null
	
	return GroupMap