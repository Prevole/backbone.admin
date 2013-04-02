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
