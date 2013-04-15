Action = class
  constructor: (isRoutable, module, name, options) ->
    throw new Error "The module must be defined" if module is undefined
#    throw new Error "The action must be defined" if action is undefined or action.length == 0

    @module = module || null
    @moduleName = @module.name
    @name = name || "main"
    @options = options || {}
    @isRoutable = isRoutable || false
    @updatedRegions = {}

  route: ->
    return if @module.routeActions[@name] is undefined

    route = @module.route @name

    for key, value of @options
      route = route.replace(":#{key}", value)

    route
