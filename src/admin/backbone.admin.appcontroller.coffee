Action = class
  actionName: "main"
  actionDetails: null

  constructor: (action) ->
    throw new Error "The module name must be defined" if action is undefined or action.length == 0

    # Get all the parts of the action
    actionParts = action.split ":"

    # Get the module name
    @moduleName = actionParts[0]

    # Get the action name or define a default one
    @actionName = actionParts[1] unless actionParts[1] is undefined

    # Remaining elements
    @actionDetails = actionParts[2] unless actionParts[2] is undefined

  path: (module) ->
    if @actionDetails is undefined
      "#{module.actions[@actionName]}"
    else
      "#{module.actions[@actionName]}/#{@actionDetails}"

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

  routeHandler: (action, params) ->
    @executeAction new Action(action), params

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

  executeAction: (actionDescription, options) ->
    module = @modules[actionDescription.moduleName]

    result = module[actionDescription.actionName](options)

    for key in _.keys(result)
      unless @application[key] is undefined
        @application[key].show result[key]



  action: (action, options) ->
    actionDescription = new Action(action)

    module = @modules[actionDescription.moduleName]

    path = actionDescription.path(module)
#      module.actions[actionDescription.actionName]

#    unless actionName == "main"
#      unless options is undefined
#        path = path.replace ":#{module.modelIdentifier}", options.model.get(module.modelIdentifier)

    @executeAction actionDescription, options

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

    # Register the module
    @modules[module.name] = module

    # Get all the actions declared in the module and prepare them to create the related routes
    # TODO: Be sure to differentiate the routable and the non-routable actions (delete should not be a routable action)
    actions = _.chain(module.actions).pairs().sortBy(1).object().value()

    # Register the routes in the router without any callback. Callbacks are done via the route event.
    for actionName, path of actions
      action = "#{module.name}:#{actionName}"
      @router.route path, action

    # Liste the event action on each module registered
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
