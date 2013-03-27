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

  @param {Object} options The options to configure the application controller. Recognized options:

  ```
  options:
		router: Boolean | Router class | Router instance
  ```

  - `router`: Could be a boolean to enable or disable the router. Could be a class to instanciate a new router or
  could be an instanciated router.
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

    # Action triggered from outside (navigation bar for example)
    @on "action:name", (actionName, changeRoute, parameters) =>
      actionFromOutside.call @, actionName, changeRoute, parameters

    @on "action:done", @actionDone

    # Action triggered from the router when a certain route is browsed
    unless _.isNull(@router)
      @listenTo @router, "route", (actionName, options) =>
        actionFromRouter.call @, actionName, options


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
      @triggerMethod("before:start", options)

      @initializers.run(options, @)

      Backbone.history.start(pushState: true) unless _.isNull(@router) and not Backbone.history.started

      @triggerMethod("after:start", options)

  ###
  Manage an action from the outside of the application controller or any of the modules
  in the application controller.

  For example, a navigation bar can trigger an action like ´<moduleName>:<actionName>´ and this
  method will retrieve the module and the action to run. Once done, an `Admin.Action` is created
  to represent the action to run.

  @param {String} actionName The name of the action with the format: `<moduleName>:<actionName>`
  @param {Boolean} changeRoute Define if the route in the navigation bar must change or not
  @param {Object} options A set of options to complete the path in the navigation bar
                          and/or used by the action execution
  ###
  actionFromOutside = (actionName, changeRoute, options) ->
    actionParts = actionName.split(":")

    module = @modules[actionParts[0]]
    action = if actionParts[1] is undefined then "main" else actionParts[1]

    @action ActionFactory.outsideAction(changeRoute, module, action, options) unless module is undefined


  actionFromRouter = (actionName, options) ->
    actionParts = actionName.split(":")

    module = @modules[actionParts[0]]
    action = if actionParts[1] is undefined then "main" else actionParts[1]

    unless module is undefined
      route = module.routableActions[action]

      parameterNames = route.match /(\(\?)?:\w+/g

      namedOptions = {}

      for index in [0 .. parameterNames.length - 1]
        parameterName = parameterNames[index].slice(1)
        namedOptions[parameterName] = options[index]
        options[index] = null

      namedOptions["remainingParameters"] = _.filter options, (value) ->
        not _.isNull(value)

      @action ActionFactory.action(module, action, namedOptions)










  action: (action) ->
    result = action.module[action.actionName](action.options)

#    for name in @regionNames
#      @[name].close()

    for key in _.keys(result)
      unless @[key] is undefined
        @[key].show result[key]

    @trigger "action:done", action
#  routableAction: (actionDescription, options) ->


#  action: (action, options) ->
#    @executeAction action, options
#    @trigger "action:done"


  actionDone: (action) ->
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
    @router.route path, "#{module.name}:#{actionName}" for actionName, path of actions unless _.isNull(@router)

    # Listen the event action on each module registered
    @listenTo module, "action", @action

  registerRegion: (name, region) ->
    throw new Error "The region #{name} is already registered" unless @[name] is undefined

#    @regions[name] = region
    @[name] = region
    @regionNames.push name

