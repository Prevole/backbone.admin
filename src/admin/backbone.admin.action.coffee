Action = class
  module: null
  actionName: "main"
#  actionDetails: null
  pathParameters: {}
  isRoutable: false

  constructor: (@isRoutable, @module, actionName, pathParameters) ->
    throw new Error "The module must be defined" if @module is undefined
#    throw new Error "The action must be defined" if action is undefined or action.length == 0

    @moduleName = @module.name
    @actionName = actionName unless actionName is undefined
    @pathParameters = pathParameters unless pathParameters is undefined

  path: ->
    return if @module.routableActions[@actionName] is undefined

    path = @module.routableActions[@actionName]

    for key, value of @pathParameters
      path = path.replace(":#{key}", value)

    path

#    # Get the action name or define a default one
#    @actionName = actionParts[0] unless actionParts[1] is undefined
#
#    # Remaining elements
#    @actionDetails = actionParts[2] unless actionParts[2] is undefined


#  path: (module) ->
#    if @actionDetails is undefined
#      "#{module.actions[@actionName]}"
#    else
#      "#{module.actions[@actionName]}/#{@actionDetails}"
