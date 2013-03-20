Admin.Module = class
  constructor: (options) ->
    throw new Error "The name of the module must be defined" if @name is undefined
    throw new Error "At least one routable action must be defined" if @routableActions is undefined

    @baseUrl = "/#{@name.replace(/:/g, "/")}" if @baseUrl is undefined

    _.extend @, Backbone.Events

#    for key, value of @actions
#      @["_#{key}"] = (args) =>
#        @trigger "action:done", @[key](args)

  routableAction: (actionName, pathParameters, options) ->
    @trigger "action", ActionFactory.routableAction(@, actionName, pathParameters), options

  action: (actionName, options) ->
    @trigger "action", ActionFactory.action(@, actionName), options

