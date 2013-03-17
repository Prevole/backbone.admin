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

#    if options is undefined
#      throw new Error "No option defined when some are required."
#
#    if not options.moduleName?
#      throw new Error "No module defined or not a string."
#    else if not moduleNamePattern.test options.moduleName
#      throw new Error "The module name is incorect."
#
#    # Set the module name
#    @name = options.moduleName
#
#    # To build the default path and names
#    @moduleBaseRoute  = @moduleBaseUrl.replace /^\//, ""
#    @pagesBasePath    = if options.pagesBasePath? then options.pagesBasePath.replace(/\/$/, "") else null
#    @templatePath     = if @pagesBasePath then "#{@pagesBasePath}/#{@moduleBaseRoute}" else @moduleBaseRoute

#    @vent = new Marionette.EventBinder

    # Init different classes of the module
#    initModelClass.call @, options.model
#    initCollectionClass.call @, options.collection
#      initRowViewClass.call @, options.rowView
#      initTableHeaderViewClass.call @, options.tableHeaderView
#      initTableViewClass.call @, options.tableView
#      initToolBarViewClass.call @, options.toolBarView
#      initPagerViewClass.call @, options.pagerView
#    initGridLayoutClass.call @, options.gridLayout
#    initCreateViewClass.call @, options.createView
#    initEditViewClass.call @, options.editView

  # ----------------------
#  getName: ->
#    @name

#  # ----------------------
#  setRouter: (router) ->
#    @router = router
#
#  # ----------------------
#  getRouter: ->
#    @router
#
#  # ----------------------
#  getRoutes: ->
#    # Define the router mappings with this controller
#    routeBindings = {}
#    routeBindings["#{@moduleBaseRoute}"] = "grid"
#    routeBindings["#{@moduleBaseRoute}/new"] = "create"
#    routeBindings["#{@moduleBaseRoute}/:id/edit"] = "edit"
##          "#{@modulePath}/:id": "show"
##          "#{@modulePath}/:id/edit": "edit"
#
#    # TODO: When the lib underscore will be bumped to 1.4+ in Backbone, change this code
#    #@routePaths = _.invert(routeBindings)
#    @routePaths = {}
#    @routePaths["grid"] = @moduleBaseRoute
#    @routePaths["create"] = "#{@moduleBaseRoute}/new"
#    @routePaths["edit"] = "#{@moduleBaseRoute}/:id/edit"
#
#    routeBindings
#
#  # ----------------------
#  getRoute: (routeName) ->
#    @routePaths[routeName]

  # ----------------------
#  initModelClass = (modelClass) ->
#    # Check if a specific model is set
#    if modelClass
#      @modelClass = modelClass
#
#    # Otherwise, use the default one
#    else
#      @modelClass = class extends Backbone.Model
#
#    @modelClass.prototype.controller = @
#
#  # ----------------------
#  initCollectionClass = (collectionClass) ->
#    # Check if a specific collection is set
#    if collectionClass
#      @collectionClass = collectionClass
#
#      # Enforce the presence of a default URL
#      unless @collectionClass.prototype.url
#        @collectionClass.prototype.url = modulePath
#
#      # Enforce the presence of a default model class
#      unless @collectionClass.prototype.model
#        @collectionClass.prototype.model = @modelClass

    # Otherwise create a default collection
#    else
#      @collectionClass = Admin.StatedCollection.extend
#        url: @moduleBaseUrl
#        model: @modelClass
#
#    @collection = new @collectionClass()

#    # ----------------------
#    initRowViewClass = (rowViewClass) ->
#      # Check if there is a view for the rows
#      if rowViewClass
#        @rowViewClass = class extends rowViewClass
#
#        # Check if a model class is defined
#        unless @rowView.prototype.model
#          @rowViewClass.prototype.model = @modelClass
#      else
#        @rowViewClass = Ajadmin.RowView.extend
#          template: "#{@templatePath}/row"
#          tagName: "tr"
#          model: @modelClass
#
#      @rowViewClass.prototype.controller = @

#    # ----------------------
#    initTableHeaderViewClass = (tableHeaderViewClass) ->
#      # Check if a table header is specified
#      if tableHeaderViewClass
#        @tableHeaderViewClass = tableHeaderViewClass
#
#      # Otherwise, create the default one
#      else
#        @tableHeaderViewClass = TableHeaderViewImpl.extend
#          template: "#{@templatePath}/headers"

#    # ----------------------
#    initTableViewClass = (tableViewClass) ->
#      # Check if a table view is specified
#      if tableViewClass
#        @tableViewClass = class extends tableViewClass
#
#        # Check if the row view is correct, otherwise set the default one
#        unless @tableViewClass.prototype.itemView
#          @tableViewClass.protoype.itemView = @rowViewClass
#
#        # Check if the table header view is correct, otherwise set the default one
#        unless @tableViewClass.prototype.tableHeaderView
#          @tableViewClass.protoype.tableHeaderView = @tableHeaderViewClass
#
#      # Otherwise, create the default table view
#      else
#        @tableViewClass = TableView.extend
#          tableHeaderView: @tableHeaderViewClass
#          itemView: @rowViewClass

#    # ----------------------
#    initPagerViewClass = (pagerViewClass) ->
#      # Check if a pager view is specified
#      if pagerViewClass
#        @pagerViewClass = class extends pagerViewClass
#
#      # Otherwise, create the default table view
#      else
#        @pagerViewClass = class extends PagerView
#
#      @pagerViewClass.prototype.controller = @

#    # ----------------------
#    initToolBarViewClass = (toolBarViewClass) ->
#      # Check if a toolbar view is defined
#      if toolBarViewClass
#        @toolBarViewClass = class extends toolBarViewClass
#
#      # Otherwise, create the default one
#      else
#        @toolBarViewClass = class extends ToolBarView
#
#      @toolBarViewClass.prototype.controller = @

  # ----------------------
  initGridLayoutClass = (gridLayoutClass) ->
#      # Check if a grid layout is specified
#      if gridLayoutClass
#        @gridLayoutClass = gridLayoutClass
#
#      # Otherwise, create the default table view
#      else
#        @gridLayoutClass = Ajadmin.GridLayout.extend
#          toolBarView: @toolBarViewClass
#          pagerView: @pagerViewClass
#          tableView: @tableViewClass
#
#      @gridLayoutClass.prototype.controller = @
#
#    # Check if the datagrid library is enabled
#    if Admin.Dg
#      unless gridLayoutClass
#        @gridLayoutClass = Admin.Dg.createDefaultLayout(
#          collection: @collection
#          gridRegions:
#            table:
#              view: Admin.Dg.DefaultTableView.extend
#                itemView: Admin.Dg.createRowView(@modelClass, "#{@templatePath}/row")
#                headerView: Admin.Dg.createTableHeaderView("#{@templatePath}/headers")
#        )
#
#  # ----------------------
#  initCreateViewClass = (createViewClass) ->
#    if createViewClass
#      @createViewClass = createViewClass.extend
#        model: @modelClass
#
#      @createViewClass.prototype.controller = @
#
#  # ----------------------
#  initEditViewClass = (editViewClass) ->
#    if editViewClass
#      @editViewClass = class extends editViewClass
#      @editViewClass.prototype.controller = @
#
#  # ----------------------
#  isTemplateAvailable = (type) ->
#    switch type
#      when "create" then not (@createViewClass.prototype.template is undefined)
#      when "edit" then not (@editViewClass.prototype.template is undefined)
#
#  # ----------------------
#  loadTemplate = (type, callback, options) ->
#    if type == "create"
#      url = "#{@collection.url}/new"
#    else
#      url = "#{@collection.url}/#{options.model.get("id")}/#{type}"
#
#    $.ajax(
#      type: 'GET'
#      dataType: 'html'
#      processData: false
#      url: url
#      success: (response) =>
#        switch type
#          when "create" then @createViewClass.prototype.template = response
#          when "edit" then @editViewClass.prototype.template = response
#
#        callback(getCrudView.call(@, type), type, options)
#    )
#
#  # ----------------------
#  getCrudView = (type) ->
#    switch type
#      when "create" then @createViewClass
#      when "edit" then @editViewClass
#
#  # ----------------------
#  crudView = (type, options) ->
#    callback = (view, type, options) ->
#      mainController.crudView view, type, options
#
#    if isTemplateAvailable.call @, type
#      callback getCrudView.call(@, type), type, options
#
#    else
#      loadTemplate.call @, type, callback, options
#
#  # ----------------------
#  grid: ->
#    mainController.switchModule @name, false
#
#  refresh: ->
#    @collection.refresh()
#
#  # ----------------------
#  create: (model) ->
#    crudView.call @, "create", model: model
#
#  # ----------------------
#  edit: (model) ->
#    crudView.call @, "edit", model: model
