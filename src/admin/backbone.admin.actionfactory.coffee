ActionFactory = new (class
  routableAction: (module, actionName, pathParameters) ->
    new Action(true, module, actionName, pathParameters)

  action: (module, actionName) ->
    new Action(false, module, actionName, {})
)()
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
