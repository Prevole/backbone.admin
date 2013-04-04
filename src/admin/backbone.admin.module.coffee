Admin.Module = Marionette.Controller.extend
  initialize: (options) ->
    throw new Error "The name of the module must be defined" if @name is undefined
    throw new Error "At least one route action must be defined" if @routeActions is undefined

    @basePath = "#{@name.replace(/:/g, "/")}" if @basePath is undefined
    @basePath = if _.str.endsWith(@basePath, "/") then @basePath else "#{@basePath}/"

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

  routableAction: (actionName, pathParameters, options) ->
    @trigger "action:module", ActionFactory.routeAction(@, actionName, pathParameters), options

  action: (actionName, options) ->
    @trigger "action:module", ActionFactory.action(@, actionName, options)

