# The main controller to rule the application on the client side
Admin.ApplicationController = class
  modules: {}
  regions: {}

  constructor: ->
    _.extend @, Backbone.Events

#    @on "action", @action, @

  action: (name) ->
    module = @modules[name]

    result = module[module.getRoutableActions()["main"]]()

    for key in _.keys(result)
      do (key) =>
        unless @regions[key] is undefined
          @regions[key].show result[key]

  registerModule: (module) ->
    throw new Error "The module cannot be undefined" if module is undefined
    throw new Error "The module must be from Admin.Module type" unless module instanceof Admin.Module
    throw new Error "The module is already registered" unless @modules[module.name] is undefined

    @modules[module.name] = module

  registerRegion: (name, region) ->
    throw new Error "The region #{name} is already registered" unless @regions[name] is undefined

    @regions[name] = region


#  switchModule: (moduleName, changeUrl = true) ->
#    module = retrieveModule.call @, moduleName
#
##    History.navigate "/books"
#
##    if changeUrl
##      module.getRouter().changeUrl("grid")
#
##      if module.collection.length == 0
##        module.collection.fetch()
#
#    gvent.trigger "changeView", new module.gridLayoutClass()
#
#  crudView: (view, type, options) ->
#    module = view.prototype.controller
#
#    switch type
#      when "create"
#        module.getRouter().changeUrl(type)
#      when "edit"
#        module.getRouter().changeUrl(type, id: options.model.get("id"))
#
#    gvent.trigger "changeView", new view(options)
#
#  retrieveModule = (moduleName) ->
#    if @modules[moduleName]
#      @modules[moduleName]
#    else
#      throw new Error "The module #{moduleName} is not registered."
#
#mainController = new MainController()
