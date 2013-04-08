ActionFactory = new (class
  action: (module, name, options) ->
    new Action(false, module, name, options)

  routeAction: (module, name, options) ->
    new Action(true, module, name, options)

  outsideAction: (changeRoute, module, name, options) ->
    if changeRoute
      @routeAction module, name, options
    else
      @action module, name, options
)()
