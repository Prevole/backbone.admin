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

#    @on "action", @action, @

  action: (action, options) ->
#    alert action

    if action.match /.*:.*/g
      moduleName = action.replace /:.*/, ""
      actionName = action.replace /.*:/, ""
      route = "#{moduleName}/#{actionName}"
    else
      moduleName = action
#      actionName = "def"
      route = moduleName

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
    @router.navigate("#{route}", {trigger: true})

  handleAction: (moduleName, path, options) ->
    alert "#{moduleName}:#{paht}:#{options}"
#    result = module[module.getRoutableActions()[actionName]](options)
#
#    for key in _.keys(result)
#      do (key) =>
#        unless app[key] is undefined
#          app[key].show result[key]


  registerModule: (module) ->
    throw new Error "The module cannot be undefined" if module is undefined
    throw new Error "The module must be from Admin.Module type" unless module instanceof Admin.Module
    throw new Error "The module is already registered" unless @modules[module.name] is undefined

    @modules[module.name] = module

    alert "#{module.routes()}"

    for route in module.routes()
      do (route) =>
        @router.route route, "#{module.name}:#{route}", (options) =>
          alert "From router: #{module.name}:#{route}"
          @handleAction module.name, route, options

    @listenTo module, "action", @action

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
