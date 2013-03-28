ActionFactory = new (class
  action: (module, actionName, options) ->
    new Action(false, module, actionName, options)

  routeAction: (module, actionName, options) ->
    new Action(true, module, actionName, options)

  outsideAction: (changeRoute, module, actionName, options) ->
    if changeRoute
      @routeAction module, actionName, options
    else
      @action module, actionName, options
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
