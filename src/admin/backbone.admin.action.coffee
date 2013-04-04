Action = class
  module: null
  actionName: "main"
#  actionDetails: null
  options: {}
  isRoutable: false

  constructor: (@isRoutable, @module, actionName, options) ->
    throw new Error "The module must be defined" if @module is undefined
#    throw new Error "The action must be defined" if action is undefined or action.length == 0

    @moduleName = @module.name
    @actionName = actionName unless actionName is undefined
    @options = options unless options is undefined

  route: ->
    return if @module.routeActions[@actionName] is undefined

    route = @module.route @actionName

    for key, value of @options
      route = route.replace(":#{key}", value)

    route
