# The main controller to rule the application on the client side
Admin.ApplicationController = class
  modules: {}

  router: new Backbone.Router()

  started: false

  constructor: (application) ->
    throw new Error "An application must be defined" if application is undefined
    throw new Error "Application should be Marionnette.Application" unless application instanceof Marionette.Application

    @application = application

    _.extend @, Backbone.Events

    @listenTo @router, "route", @routeHandler

  routeHandler: (route, params) ->
    @action route, params

#    @router = new (Backbone.Router.extend(
#      initializer: (options) ->
#        @controller = options.controller
#
#        @on "route", @actionHandler
#
#      actionHandler: (router, route, params) ->
#        console.log route
#        console.log arguments
#
#    ))(controller: @)

#    @on "action", @action, @

  action: (action, options) ->
    if action.match /.*:.*/g
      moduleName = action.replace /:.*/, ""
      actionName = action.replace /.*:/, ""
    else
      moduleName = action
      actionName = "main"

    console.log "Options: #{options}"
    console.log "Action: #{action}"
    console.log "Action name: #{actionName}"
    console.log "Module name: #{moduleName}"
    console.log "Modules: #{@modules}"

    module = @modules[moduleName]

    console.log "Module: #{module}"

    path = module.actions[actionName]

    console.log "Path: #{path}"

    unless actionName == "main"
      unless options is undefined
        path = path.replace ":#{module.modelIdentifier}", options.model.get(module.modelIdentifier)

    console.log "Path replaced: #{path}"

    result = module[actionName](options)

    console.log "Result: #{result}"

    for key in _.keys(result)
      unless @application[key] is undefined
        @application[key].show result[key]

#    module = @modules[moduleName]

#    result = module[module.getRoutableActions()[actionName]](options)
#
#    for key in _.keys(result)
#      do (key) =>
#        unless @application[key] is undefined
#          @application[key].show result[key]

#    app = @application

#    @router.route(route, action, ->
#      alert "action:#{action}:#{route}"
#
#      result = module[module.getRoutableActions()[actionName]](options)
#
#      for key in _.keys(result)
#        do (key) =>
#          unless app[key] is undefined
#            app[key].show result[key]
#    )

#    alert "#{path}"

    @router.navigate("/#{path}")

#  handleAction: (moduleName, actionName, path, options) ->
##    alert "#{moduleName}:#{actionName}:#{path}:#{options}"
#
#    module = @modules[moduleName]
#
#    return if module is undefined
#
#    result = module[actionName](options)
#
#    for key in _.keys(result)
#      unless @application[key] is undefined
#        @application[key].show result[key]

#  handleAction: (actionResult) ->
##    result = action()
#
#    for key in _.keys(actionResult)
#      unless @application[key] is undefined
#        @application[key].show actionResult[key]

  registerModule: (module) ->
    throw new Error "The module cannot be undefined" if module is undefined
    throw new Error "The module must be from Admin.Module type" unless module instanceof Admin.Module
    throw new Error "The module is already registered" unless @modules[module.name] is undefined

    @modules[module.name] = module

    actions = _.chain(module.actions).pairs().sortBy(1).object().value()

#    actions = sortByValue module.actions

    actionFn = @action

    handlerBuilder = (action) ->
      (options) ->
        actionFn(action, options)

    for actionName, path of actions
      action = "#{module.name}:#{actionName}"
      @router.route path, action
#      , handlerBuilder(action)
#      (options) =>
#        alert action
#        @action action, options

#      , (args) =>
#        @handleAction module.name, actionName, path, args

#      @_registerRoute module, actionName, path

#      (args) =>
#        @handleAction module[actionName](args)

#      (options) =>
#        n = actionName
#        p = path
#        @handleAction module.name, n, p, options

    @listenTo module, "action", @action
#    @listenTo module, "action:done", @handleAction

  registerRegion: (name, region) ->
    throw new Error "The region #{name} is already registered" unless @application[name] is undefined

#    @regions[name] = region
    @application[name] = region

  start: ->
    if @started
      console.log "Application controller already started."
    else
      @application.start()
      Backbone.history.start(pushState: true)

#  _registerRoute: (module, actionName, path) ->
#    @router.route path, "#{module.name}:#{actionName}", module["_#{actionName}"]


#  switchModule: (moduleName, changeUrl = true) ->
#    module = retrieveModule.call @, moduleName
#
##    History.navigate "/books"
#
##    if changeUrl
##      module.getRouter().changeUrl("grid")
#
##      if module.collection.length == 0
##        module.collection.fetch()
#
#    gvent.trigger "changeView", new module.gridLayoutClass()
#
#  crudView: (view, type, options) ->
#    module = view.prototype.controller
#
#    switch type
#      when "create"
#        module.getRouter().changeUrl(type)
#      when "edit"
#        module.getRouter().changeUrl(type, id: options.model.get("id"))
#
#    gvent.trigger "changeView", new view(options)
#
#  retrieveModule = (moduleName) ->
#    if @modules[moduleName]
#      @modules[moduleName]
#    else
#      throw new Error "The module #{moduleName} is not registered."
#
#mainController = new MainController()
