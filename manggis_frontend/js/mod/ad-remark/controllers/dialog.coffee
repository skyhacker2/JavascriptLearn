define (require) ->
	$ = require 'jquery'
	Spine = require 'spine'
	rfl = require 'rfl'
	langResourceCommon = require 'lang/{{G.LANG}}/common'
	langResourceAdRemark = require 'lang/{{G.LANG}}/ad-remark'
	AdRemark = require '../models/ad-remark'
	Domain = require '../models/domain'
	AutoComplete = require 'auto-complete'
	formUtil = require 'form-util'
	domainTest = /^([a-zA-Z0-9\-]{1,63}\.)+[a-zA-Z0-9\-]{1,63}$/

	class Dialog extends Spine.Controller

		init: ->
			formUtil.setCommonMsg langResourceCommon.msg.validator

		dialogTpl : require '../views/ad-remark-dialog.tpl.html'

		validateDomain:->
			groupDataLen = @autoCompleteGroup.getSelectedDataList().length
			if not groupDataLen
				formUtil.highLight($('#domains') ,langResourceCommon.msg.validator.mandatory)
			else
				formUtil.highLight($('#domains') ,'', '')
			if groupDataLen
				return true
			else 
				return false

		validateRemark:->
			formUtil.validate $('#new-remark-form', @dialog)

		show: (adRemark)=>
			@dialog = rfl.dialog.create
				title: '[AD] Subject Suffix',
				content: @dialogTpl.render data: adRemark or {}
				btns: [
					{
						text:if adRemark then 'Update' else 'Create'
						className: 'btn-primary'
						click: (=>@submit adRemark)
					}, 
					{
						text: 'Cancel'
						dismiss: true
					}
				]
			
			setTimeout (=>@getAutoCompleteGroup adRemark) , 500

		submit: (adRemark)=>
			valid = @validateRemark()
			domainsValid = @validateDomain()
			if valid.passed and domainsValid
				data = formUtil.getData $('#new-remark-form'),@dialog
				data.domains = @autoCompleteGroup.getSelectedDataList('name')
				console.log data.domains
				ds = []
				for domain in data.domains
					ds.push domain.name
				data.domains = ds
				if adRemark
					adRemark.load(domains:data.domains)
					adRemark.ajaxUpdate()
				else
					ar = new AdRemark(domains:data.domains, remark:data.remark)
					ar.ajaxCreate()
				@dialog.modal('hide')
			else 
				if domainsValid
					formUtil.focus(valid.failList[0].item);
				else
					formUtil.focus('#domains')




		getAutoCompleteGroup: (adRemark)=>
			initData = []
			if adRemark
				for name in adRemark.domains
					d = Domain.findByAttribute("name", name) or new Domain(id:Domain.count()+1, name:name)
					d.save()
					console.log d
					initData.push d
			dataSource = Domain.all()
			_autoCompleteGroup = new AutoComplete '#domains',
				richSelectionResult:true
				dataSource: dataSource
				initData:initData
				separator:'; '
				noResultMsg:''
				onKeyup:(evt)->
					if evt.keyCode is 13 or (evt.keyCode > 36 and evt.keyCode < 41) 
						return
					dataSource.length = 0
					if this.value isnt '' and not Domain.findByAttribute("name", this.value) and domainTest.test(this.value)
						d = new Domain(id:Domain.count()+1, name:this.value)
						dataSource.push d
					Domain.each (domain)->dataSource.push domain

				onSelect:(item)->
					if not Domain.findByAttribute("name", item.name)
						d = new Domain(id:item.id, name:item.name)
						d.save()
					this.value = ''
					this.focus()
				onBlur:->
					console.log this.value
					for d in dataSource
						if d.name is this.value.replace(';','')
							d.save()
							_autoCompleteGroup.addSelectedItem(d)
					this.value = ''
				onFocus:()->
					return false
			
			_autoCompleteGroup._box.on 'paste', 
				()->
					setTimeout (=>
						console.log this.value
						values = this.value.split(';')
						for v in values
							value = $.trim v
							if domainTest.test value
								if Domain.findByAttribute("name", value)
									item = Domain.findByAttribute("name", value)
									_autoCompleteGroup.addSelectedItem(item)
								else
									item = new Domain(id:Domain.count()+1, name:value)
									item.save()
									dataSource.push item
									_autoCompleteGroup.addSelectedItem(item)
						this.value = ''),
						0
			@autoCompleteGroup = _autoCompleteGroup

	Dialog