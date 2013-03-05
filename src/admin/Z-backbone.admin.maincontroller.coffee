# The main controller to rule the application on the client side
MainController = class
  # Constructor
  # @param [Hash] options Options to configure the controller
  constructor: (options) ->
    @modules = {}

  # Register a module that will be manage through the administration framework
  # @param [Backbone.Admin.Module] module The module to register
  registerModule: (module) ->
#    if module is undefined or not (module instanceof ModuleController)
#      throw new Error "The module is not defined or not an instance of Module class"

    if @modules[module.getName()] != undefined
      throw new Error("The module #{module.getName()} is already instanciated.")
    else
      @modules[module.getName()] = module

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
mainController = new MainController()
