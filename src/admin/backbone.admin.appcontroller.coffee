###
## Admin.ApplicationController

The `application controller` manage the different module of the application
to offer the one page application experience.

The routes are gather from the different modules to manage the browser history
and the actions related to the modules.
###
Admin.ApplicationController = class
  # To manage the initilizers like the `Marionette.Application` does
  initializers: new Marionette.Callbacks()

  # To raise an event and execute a method `on` something
  triggerMethod: Marionette.triggerMethod

  # Modules managed by the application controller
  modules: {}

  # Region where the module action result should be displayed
  regionNames: []

  # The router to manage the routes associated to the module actions
  router: null

  # Flag to enforce that the application controller cannot be started twice
  started: false

  ###
  Constructor

  ```
  # Available options:
  options:
    router:
  ```

  *`router`: Could be a boolean to enable or disable the router. Could be a class to instanciate a new router or
  could be an instanciated router.

  @param {Object} options The options to configure the application controller
  ###
  constructor: (options) ->
    _.extend @, Backbone.Events

    options = _.defaults options || {},
      { router: Backbone.Router }

    if _.isBoolean(options.router) and options.router
      @router = new Backbone.Router()
    else if _.isFunction(options.router)
      @router = new options.router(options)
    else
      @router = options.router


    @on "action:done", @actionDone

    @listenTo @router, "route", @routedAction unless _.isNull(@router)


  ###
  Add an initializer to execute when the application will start

  @param {Function} initializer The initializer to add
  ###
  addInitializer: (initializer) ->
    @initializers.add(initializer)

  ###
  Like the `Marionette.Application.start(options)`, this method
  start the `ApplicationController`.

  @param {Object} options The options given to every initializer
  ###
  start: (options) ->
    if @started
      console.log "Application controller already started."
    else
      @triggerMethod("start:before", options)

      @initializers.run(options, @)

      Backbone.history.start(pushState: true) unless _.isNull(@router) and not Backbone.history.started

      @triggerMethod("start:after", options)

  routedAction: (action, params) ->
    actionParts = action.split(":")

    module = @modules[actionParts[0]]

    return if module is undefined

    @action ActionFactory.action(module, actionParts[1]), params

  routeAction: (action, params) ->
    actionParts = action.split(":")

    module = @modules[actionParts[0]]

    @action ActionFactory.routableAction(module, actionParts[1]), params unless module is undefined


  action: (action, options) ->
    result = action.module[action.actionName](options)

#    for name in @regionNames
#      @[name].close()

    for key in _.keys(result)
      unless @[key] is undefined
        @[key].show result[key]

    @trigger "action:done", action, options
#  routableAction: (actionDescription, options) ->


#  action: (action, options) ->
#    @executeAction action, options
#    @trigger "action:done"


  actionDone: (action, options) ->
    @router.navigate action.path() if not _.isNull(@router) and action.isRoutable

  ###
  Allow to register a module. When this function is called, the action that can be routed
  are gathered and registered in the `ApplicationController` router. Validations are done
  to enforce that the module is valid

  @param {Backbone.Admin.Module} module The module to register
  ###
  registerModule: (module) ->
    throw new Error "The module cannot be undefined" if module is undefined
    throw new Error "The module must be from Admin.Module type" unless module instanceof Admin.Module
#    throw new Error "The module must have a name" unless module.name is undefined || module.name.length == 0
    throw new Error "The module is already registered" unless @modules[module.name] is undefined

    # Register the module
    @modules[module.name] = module

    # Get all the actions declared in the module and prepare them to create the related routes
    # TODO: Be sure to differentiate the routable and the non-routable actions (delete should not be a routable action)
    actions = _.chain(module.routableActions).pairs().sortBy(1).object().value()

    # Register the routes in the router without any callback. Callbacks are done via the route event.
    unless _.isNull(@router)
      for actionName, path of actions
        moduleActionName = "#{module.name}:#{actionName}"
        @router.route path, moduleActionName

    # Listen the event action on each module registered
    @listenTo module, "action", @action

  registerRegion: (name, region) ->
    throw new Error "The region #{name} is already registered" unless @[name] is undefined

#    @regions[name] = region
    @[name] = region
    @regionNames.push name

