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

    # Actions triggered from outside (navigation bar for example)
    @on "action:outside:route", (actionName, parameters) =>
      actionFromOutside.call @, actionName, true, parameters
    @on "action:outside:noroute", (actionName, parameters) =>
      actionFromOutside.call @, actionName, false, parameters

    @on "action:done", (action) =>
      actionDone.call @, action

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
    actionMethod = if actionParts[1] is undefined then "main" else actionParts[1]

    action.call @, ActionFactory.outsideAction(changeRoute, module, actionMethod, options) unless module is undefined

  ###
  Manage an action triggered by `Backbone.History` events. This kind of action
  required to execute an action from a module but not to change the route in
  the navigation bar. The navigation bar is already up to date.

  The action name correspond to the route name regisered in the `Backbone.Router`
  object and the options is an array corresponding to the parameters contained in
  the `URL`.

  When it's possible, the options given to the action are mapped to parameter names
  if there are some matching. The remaining option, are given in an array inside the
  `options` object. The name associated to these remainings options is: ´_params´

  @param {String} actionName The name of the action with the format: `<moduleName>.<actionName>`
  @param {Array} options The list of options from the `URL`
  ###
  actionFromRouter = (actionName, options) ->
    actionParts = actionName.split(":")

    module = @modules[actionParts[0]]
    actionMethod = if actionParts[1] is undefined then "main" else actionParts[1]

    unless module is undefined
      namedOptions = {}

      # Get the action route configured in the module
      route = module.routableActions[actionMethod]

      # If there is a route
      unless route is undefined
        # Retrieve the parameter names. WARNING: The regex comes from `Backbone.History`
        parameterNames = route.match /(\(\?)?:\w+/g

        # Associate each parameter value to its name
        unless _.isNull(parameterNames)
          for index in [0 .. parameterNames.length - 1]
            parameterName = parameterNames[index].slice(1)
            namedOptions[parameterName] = options[index]
            options[index] = null

      # The remaining options have no names and are given in the same order received
      namedOptions["_params"] = _.filter options, (value) ->
        not _.isNull(value)

      # Run the action
      action.call @, ActionFactory.action(module, actionMethod, namedOptions)










  action = (action) ->
    result = action.module[action.actionName](action.options)

    unless _.isNull(result)
  #    for name in @regionNames
  #      @[name].close()

      for key in _.keys(result)
        unless @[key] is undefined
          @[key].show result[key]

      @trigger "action:done", action



  actionDone = (action) ->
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
    basePath = if _.str.endsWith(module.baseUrl, "/") then module.baseUrl else "#{module.baseUrl}/"

    fReduce = (memo, value, key) ->
      if value == ""
        memo[key] = basePath.substring(0, basePath.length - 1)
      else if _.str.startsWith value, "/"
        memo[key] = "#{basePath.substring(0, basePath.length - 1)}#{value}"
      else
        memo[key] = "#{basePath}#{value}"

      memo

    actions = _.chain(module.routableActions)
      .reduce(fReduce, {})
      .pairs()
      .sortBy(1)
      .object()
      .value()

    # Register the routes in the router without any callback. Callbacks are done via the route event.
    @router.route path, "#{module.name}:#{actionName}" for actionName, path of actions unless _.isNull(@router)

    # Listen the event action on each module registered
    @listenTo module, "action:module", (moduleAction) =>
      action.call @, moduleAction

  registerRegion: (name, region) ->
    throw new Error "The region #{name} is already registered" unless @[name] is undefined

#    @regions[name] = region
    @[name] = region
    @regionNames.push name

