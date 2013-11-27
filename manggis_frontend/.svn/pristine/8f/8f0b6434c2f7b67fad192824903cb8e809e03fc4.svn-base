Spine  = @Spine or require('spine')
$      = Spine.$
Model  = Spine.Model

Ajax =
  PROXY_PATH: '{{CGI_BASE}}static/js/lib/rfl/ajax-proxy.html' .replace '{{CGI_BASE}}', G.CGI_BASE

  getDataTypeURL: (url, dataType) ->
    url.replace /[^\/]+$/, (m) ->
      m.replace /^[\w\-\.]+/, (m) ->
        m.split('.')[0] + '.' + dataType

  url2obj: (str) ->
    return str unless typeof str is 'string'
    m = str.match /([^:]*:)?(?:\/\/)?([^\/:]+)?(:)?(\d+)?([^?#]+)(\?[^?#]*)?(#[^#]*)?/
    m ?= []
    uri = 
      href: str
      protocol: m[1] or 'http:'
      host: (m[2] or '') + (m[3] or '') + (m[4] or '')
      hostname: m[2] or ''
      port: m[4] or ''
      pathname: m[5] or ''
      search: m[6] or ''
      hash: m[7] or ''
    uri.origin = uri.protocol + '//' + uri.host
    uri

  getProxy: (settings, done, fail) ->
    if not @proxyFrame
      settings.urlObj ?= @url2obj settings.url
      @proxyFrame = document.createElement 'iframe'
      @proxyFrame.style.display = 'none'
      @proxyFrame.src = settings.urlObj.origin + @PROXY_PATH
      $(@proxyFrame).on 'load', onload = (evt) =>
        if @proxyFrame._loaded
          @getProxy settings, done, fail
        else
          $(@proxyFrame).off('load', onload).remove()
          @proxyFrame = null
          do fail
      @proxyFrame = document.body.appendChild @proxyFrame
    if @proxyFrame._loaded
      @proxyFrame.contentWindow.require ['jquery'], ($) ->
        done $
      , () ->
        fail()
  getURL: (object) ->
    object.url?() or object.url

  getCollectionURL: (object) ->
    if object
      if typeof object.url is "function"
        @generateURL(object)
      else
        object.url

  getScope: (object) ->
    G.CGI_BASE + (object.scope?() or object.scope or '')

  generateURL: (object, args...) ->
    if object.className
      collection = @getLowerCaseModelName(object.className) + 's'
      scope = Ajax.getScope(object)
    else
      if typeof object.constructor.url is 'string'
        collection = object.constructor.url
      else
        collection = @getLowerCaseModelName(object.constructor.className) + 's'
      scope = Ajax.getScope(object) or Ajax.getScope(object.constructor)
    args.unshift(collection)
    args.unshift(scope)
    # construct and clean url
    path = args.join('/')
    path = path.replace /(\/\/)/g, "/"
    path = path.replace /^\/|\/$/g, ""
    # handle relative urls vs those that use a host
    if path.indexOf("../") isnt 0
      Model.host + "/" + path
    else
      path

  getLowerCaseModelName: (name) ->
    name.charAt(0).toLowerCase() + name.slice(1)

$.extend Ajax, Spine.Events

class Base
  defaults:
    cache: true
    dataType: null
    headers: {'X-Requested-With': 'XMLHttpRequest'}

  ajax: (params, defaults) ->
    Ajax.trigger 'start'
    jqXHR    = null
    aborted  = false
    deferred = $.Deferred()
    promise  = deferred.promise()
    settings = @ajaxSettings(params, defaults)
    if @record?.id?
      # for existing singleton, model id may have been updated
      # after request has been queued
      settings.url ?= Ajax.getURL(@record)
      settings.data?.id = @record.id
    # 2 reasons not to stringify: if already a string, or if intend to have ajax processData
    if typeof settings.data isnt 'string' and settings.processData isnt true and settings.type isnt 'GET'
      settings.data = JSON.stringify(settings.data)
    settings.url = Ajax.getDataTypeURL settings.url, 'json'
    settings.urlObj = Ajax.url2obj settings.url
    #console.log settings
    if settings.type is 'GET'
      if G.ORIGIN isnt settings.urlObj.origin and settings.dataType is 'json'
        Ajax.getProxy settings, ($) ->
          if not aborted
            jqXHR = $.ajax(settings)
            .done(deferred.resolve)
            .fail(deferred.reject)
        , ->
          deferred.reject promise, '', ''
      else
        settings.dataType ?= if G.ORIGIN is settings.urlObj.origin then 'json' else 'jsonp'
        if settings.dataType is 'jsonp'
          settings.scriptCharset ?= 'UTF-8';
          settings.url = Ajax.getDataTypeURL settings.url, 'jsonp'
          settings.urlObj = Ajax.url2obj settings.url
          if not settings.jsonpCallback
            settings.url.split('/').pop().replace /^[a-zA-Z_]\w*/, (m) ->
              settings.jsonpCallback = m
            settings.jsonpCallback ?= 'jsonpCallback'
          settings.jsonp ?= 'callback'
        jqXHR = $.ajax(settings)
          .done(deferred.resolve)
          .fail(deferred.reject)
    else
      # for prototype
      if G.IS_PROTOTYPE
        settings.type = 'POST'
      settings.dataType = 'json'
      settings.contentType = 'application/json; charset=' + (settings.charset or 'UTF-8')
      if G.ORIGIN isnt settings.urlObj.origin
        Ajax.getProxy settings, ($) ->
          if not aborted
            jqXHR = $.ajax(settings)
              .done(deferred.resolve)
              .fail(deferred.reject)
        , ->
          deferred.reject promise, '', ''
      else
        jqXHR = $.ajax(settings)
          .done(deferred.resolve)
          .fail(deferred.reject)
    promise.abort = (statusText) ->
      aborted = true
      return jqXHR.abort(statusText) if jqXHR
      promise
    promise.always ->
      Ajax.trigger 'end'
    promise

  ajaxQueue: (params = {}, defaults) ->
    deferred = $.Deferred()
    promise  = deferred.promise()
    obj = @record or @model
    return promise if obj.ajaxQueueing
    obj.ajaxQueueing = true
    complete = params.complete
    params.complete = (args...) ->
      complete?.apply this, args...
      obj.ajaxQueueing = false
    @ajax params, defaults

  ajaxSettings: (params, defaults) ->
    $.extend({}, @defaults, defaults, params)

class Collection extends Base
  constructor: (@model) ->

  fetch: (params = {}, options = {}) ->
    if id = params.id
      record = new @model(id: id)
      delete params.id
    @ajax(
      params,
      type: 'GET',
      url: options.url or Ajax.getURL(if id then record else @model)
    ).done(@recordsResponse record, options)
    .fail(@failResponse record, options)

  # Private

  recordsResponse: (record = null, options = {}) =>
    (res, status, xhr) =>
      if res.code is 0
        if record
          records = res.data?[Ajax.getLowerCaseModelName(@model.className)] or res.data
        else
          records = res.data[Ajax.getLowerCaseModelName(@model.className) + 's'] or res.data
          @model.total = res.data.total if typeof res.data.total is 'number'
        @model.refresh records, options
        @model.trigger 'ajaxSuccess', record, 'fetch', res, status, xhr
        options.done?.apply record or @model, [res, status, xhr]
      else
        @model.trigger 'ajaxBizError', record, 'fetch', res, status, xhr
        options.fail?.apply record or @model, [res, status, xhr]

  failResponse: (record = null, options = {}) =>
    (xhr, statusText, error) =>
      res =
        code: -1
      @model.trigger 'ajaxError', record, 'fetch', res, statusText, xhr
      options.fail?.apply record or @model, [res, statusText, xhr]

class Singleton extends Base
  constructor: (@record) ->
    @model = @record.constructor

  reload: (params, options = {}) ->
    @ajax(
      params, {
        type: 'GET'
        url: options.url
      }
    ).done(@recordResponse('reload', options))
     .fail(@failResponse('reload', options))

  create: (params, options = {}) ->
    @ajax(
      params,
      type: 'POST'
      contentType: 'application/json'
      data: @record.toJSON()
      url: options.url or Ajax.getCollectionURL(@record)
    ).done(@recordResponse('create', options))
     .fail(@failResponse('create', options))

  update: (params, options = {}) ->
    @ajaxQueue(
      params, {
        type: 'PUT'
        contentType: 'application/json'
        data: @record.toJSON()
        url: options.url
      }
    ).done(@recordResponse('update', options))
     .fail(@failResponse('update', options))

  destroy: (params, options = {}) ->
    @ajaxQueue(
      params, {
        type: 'DELETE'
        url: options.url
      }
    ).done(@recordResponse('destroy', options))
     .fail(@failResponse('destroy', options))

  # Private

  recordResponse: (type, options = {}) =>
    (res, status, xhr) =>
      if res.code is 0
        data = res.data?[Ajax.getLowerCaseModelName(@model.className)] or res.data
        unless Spine.isBlank(data) or type is 'destroy'
          # ID change, need to do some shifting
          if data.id and @record.id isnt data.id
            @record.changeID data.id
          # Update with latest data
          @record.refresh data
        @record.trigger 'ajaxSuccess', type, res, status, xhr
        options.done?.apply @record, [res, status, xhr]
      else
        @record.trigger 'ajaxBizError', type, res, status, xhr
        options.fail?.apply @record, [res, status, xhr]

  failResponse: (type, options = {}) =>
    (xhr, statusText, error) =>
      res =
        code: -1
      @record.trigger 'ajaxError', type, res, statusText, xhr
      options.fail?.apply @record, [res, statusText, xhr]

# Ajax endpoint
Model.host = G.CGI_ORIGIN

Include =
  ajax: -> new Singleton(this)

  url: (args...) ->
    args.unshift(encodeURIComponent(@id))
    Ajax.generateURL(@, args...)

  ajaxCreate: (options = {}) ->
    @ajax()['create'](options.ajax, options)

  ajaxUpdate: (options = {}) ->
    @ajax()['update'](options.ajax, options)

  ajaxDestroy: (options = {}) ->
    @ajax()['destroy'](options.ajax, options).done =>
      @destroy(options)

Extend =
  ajax: -> new Collection(this)

  url: (args...) ->
    Ajax.generateURL(@, args...)

  ajaxFetch: (options = {}) ->
    @ajax()['fetch'](options.ajax, options)

Model.Ajax =
  extended: ->
    @extend Extend
    @include Include

# Globals
Ajax.defaults   = Base::defaults
Ajax.Base       = Base
Ajax.Singleton  = Singleton
Ajax.Collection = Collection
Spine.Ajax      = Ajax
module?.exports = Ajax
