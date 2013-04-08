Admin.Module = Marionette.Controller.extend
  constructor: () ->
    throw new Error "The name of the module must be defined" if @name is undefined
    throw new Error "At least one route action must be defined" if @routeActions is undefined

    args = Array.prototype.slice.apply arguments
    Marionette.Controller.prototype.constructor.apply @, args

    @basePath = "#{@name.replace(/:/g, "/")}" if @basePath is undefined
    @basePath = if _.str.endsWith(@basePath, "/") then @basePath else "#{@basePath}/"

    @on "action:route", (actionName, pathParameters, options) ->
      @trigger "action:module", ActionFactory.routeAction(@, actionName, pathParameters), options

    @on "action:noroute", (actionName, options) ->
      @trigger "action:module", ActionFactory.action(@, actionName, options)

    @on "action:execute", (action) ->
      @triggerMethod action.name, action
      @trigger "action:executed", action

  routes: ->
    fReduce = (memo, value, key) =>
      memo[key] = @route(key)
      memo

    _.chain(_.reduce(@routeActions, fReduce, {})).pairs().sortBy(1).object().value()

  route: (actionName) ->
    route = @routeActions[actionName]

    if route == ''
      return _.str.rtrim @basePath, '/'
    else
      return "#{@basePath}#{_.str.ltrim route, '/'}"
