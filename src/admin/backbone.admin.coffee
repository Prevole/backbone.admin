###
Backbone.Admin
==============

The `Backbone.Admin` framework based one `Backbone` and `Backbone.Marionette` offers an easy way
to write client side `CRUD` application with a `REST` backend. But, the framework can be used to
write different modules than `CRUD`modules. Custom modules can be handle perfectly by the framework.

Dependencies:

- [jQuery 1.9.0](http://jquery.com)
- [JSON2 2011-10-19](http://www.JSON.org/json2.js)
- [Underscore 1.4.3](http://underscorejs.org)
- [Backbone 0.9.10](http://backbonejs.org)
- [Backbone.Marionette 1.0.0-rc3](http://github.com/marionettejs/backbone.marionette)
- [Backbone.Wreqr 0.1.0](http://github.com/marionettejs/backbone.wreqr)
- [Backbone.Babysitter 0.0.4](http://github.com/marionettejs/backbone.babysitter)

For the demo, the `Backbone.Dg` is used to render the grids

- [Backbone.Dg 0.0.1](http://github.com/prevole/backgone.dg)

By default, a `CRUD` module implementation is available with standards actions like `new`, `edit` and `delete`
operations. The `list` action is the `main` action that will be used by default when no action is specified.

The management of the browser history is done through the `Backbone.history` API. When the `Admin.ApplicationController`
is started, the `History` is also started. Each module registered will also register `routes` in a `Backbone.Router`
handled by the `Admin.ApplicationController`. By default, a `CRUD` module is bind to three `routes`:

- `<moduleName>`: which goes to the main action
- `<moduleName>/new`: which goes to the action that allows creating a new item
- `<moduleName>/edit/:id`: which goes to the edition action to update the item

These routes are `bookmarkable` and then can be reach through a the navigation bar of the browser. For the `delete`
action, this is not the same scenario. Once a record is deleted, the resource is no more available on the server and
then the route to reach should not be available anymore. This is the reason why there is no default route offered for
`delete` action.
###
window.Backbone.Admin = window.Admin = ( (Backbone, Marionette, _, $) ->
  Admin = { version: "0.0.1" }

  applicationStarted = false
  initialized = false

  moduleNamePattern = new RegExp(/[a-z]+(:[a-z]+)*/)

  # Create the event aggregator
#  gvent = new Marionette.EventAggregator()

  authorizator = null


  # backbone.admin.authorizator.coffee
  # backbone.admin.maincontroller.coffee
  # backbone.admin.formview.coffee
  # backbone.admin.modulecontroller.coffee

  #= backbone.admin.action.coffee
  #= backbone.admin.actionfactory.coffee
  #= backbone.admin.appcontroller.coffee
  #= backbone.admin.navigationview.coffee
  #= backbone.admin.module.coffee
  #= backbone.admin.crudmodule.coffee

  #= backbone.admin.mainregion.coffee

  ###
  Defaults i18nKeys used in the translations if `i18n-js` is used.

  You can provide your own i18n keys to match your structure.
  ###
  i18nKeys =
    info: "datagrid.info"
    pager:
      first: "datagrid.pager.first"
      last: "datagrid.pager.last"
      next: "datagrid.pager.next"
      previous: "datagrid.pager.previous"
      filler: "datagrid.pager.filler"

  ###
  Helper function to define part or all the i18n keys
  you want override for all your grids.

  The options are combined with the default ones defined
  by the plugin. Your i18n keys will override the ones
  from the plugins.

  @param {Object} options The i18n keys definition
  ###
  Admin.setupDefaultI18nBindings = (options) ->
    i18nKeys = _.defaults(
      options.i18n || {},
      i18nKeys
    )

#  Admin.createCrudModule = (name, collection, options) ->
#    Admin.createCrudModule(name, collection.prototype.model, collection, options)
#
#  Admin.createCrudModule = (name, model, collection, options) ->
#    class extends Admin.CrudModule
#      name: name
#      collection: collection
#      model: model
#      actions: options.actions
#      routableActions: options.routableActions

# ----------------------------------------------------------------------------------------------------------------------

  # State collection class offers the mechanism to manage the
  # collection manipulated into the admin application
  Admin.StatedCollection = Backbone.Collection.extend

    initialize: (options) ->
      @current =
        _.defaults {},
          page: 1
          ipp: 2
          quickSearch: ""
          sorting: {}

    # @override see Backbone doc
    sync: (method, model, options) ->

      storedSuccess = options.success
      options.success = (collection, response) =>
        storedSuccess(collection, response)
        @trigger "fetched"

      queryOptions = _.extend {}, {
        jsonpCallback: 'callback'
        timeout: 25000
        cache: false
        type: 'GET'
        dataType: 'json'
        processData: false
        url: @url
        headers: { "X-Grid-Parameters": JSON.stringify(@current) }
      }, options

      $.ajax queryOptions

    # @override see Backbone doc
    parse: (response, xhr) ->
      info = response.info
      @current.records = info.records
      @current.pages = info.pages
      @current.filteredRecords = info.filteredRecords
      @current.filteredPages = info.filteredPages
      @current.from = (@current.page - 1) * @current.ipp + 1
      @current.to = @current.from + @current.ipp - 1
      @current.to = @current.filteredRecords if @current.to > @current.filteredRecords

      if @current.page > @current.filteredPages && @current.filteredPages > 0
        @current.page = @current.filteredPages
        @fetch()

      response.data

    refresh: ->
      @reset()
      @fetch()

    getInfo: ->
      @current

    updateInfo: (options) ->
      @current = _.defaults options, @current
      @fetch()

#    setPage: (page) ->
#      currentPage = @current.page
#
#      if not new RegExp(/^[0-9]+/).test(page)
#        switch page
#          when "first"
#            if @current.page != 1
#              @current.page = 1
#
#          when "prev"
#            if @current.page > 1
#              @current.page--
#
#          when "next"
#            if @current.page < @current.filteredPages
#              @current.page++
#
#          when "last"
#            if @current.page != @current.filteredPages
#              @current.page = @current.filteredPages
#
#      else
#        if page > 0 || page <= @current.filteredPages
#          @current.page = page
#
#      @fetch() unless currentPage == @current.page


  Admin.instanciateModule = (options) ->
    if applicationStarted
      throw new Error "Application already started, it is not possible to register more modules."
    else
      module = new ModuleController(options)

#      Router = Marionette.AppRouter.extend
#        controller: module
#        appRoutes:
#          module.getRoutes()
#
#        initialize: ->
#          @on "changeUrl", (type) ->
#            @changeUrl type
#
#        changeUrl: (type, options) ->
#          route = @controller.getRoute(type)
#
#          if options
#            for key, value of options
#              route = route.replace(":#{key}", value)
#
#          @navigate route
#
#      module.setRouter new Router()

      mainController.registerModule module

# ----------------------------------------------------------------------------------------------------------------------

  Admin.init = (options) ->
    initialized = true

    options = options or {}

    if options.authorizator
      authorizator = new options.authorizator()
    else
      authorizator = new Admin.Authorizator()

# ----------------------------------------------------------------------------------------------------------------------

  Admin.start = (options) ->
    Admin.init() unless initialized

    applicationStarted = true

    # Ensure the options are present
    if options is undefined
      throw new Error "No option defined when some are required."

    # Check if a main region class should be used, otherwise use the default one
    if options.mainRegion is undefined
      mainRegion = Admin.MainRegion
    else
      mainRegion = options.mainRegion

    # Check if a main region class should be used, otherwise use the default one
    if options.navigationView?
      navigationViewClass = options.navigationView
    else
      navigationViewClass = Admin.NavigationView

    router = new Backbone.Router()

    switchModule = (moduleName) ->
      router.route(moduleName, moduleName, ->
        alert moduleName
      )

#      alert moduleName
      router.navigate(moduleName, {trigger: true})
#      mainController.switchModule(moduleName)

    CRUDApplication = new Marionette.Application()

    CRUDApplication.on "initialize:after", ->
      Backbone.history.start(pushState: true)

    gvent.on "changeView", (view) ->
      CRUDApplication.mainRegion.show(view)

    CRUDApplication.addInitializer ->
      navigationView = new navigationViewClass()
#      mainController = new MainController()

      navigationView.on "navigate:switchModule", switchModule
#                        mainController.switchModule, mainController

      @addRegions
        mainRegion: mainRegion

    CRUDApplication.start()

# ----------------------------------------------------------------------------------------------------------------------

  Admin.can = (action, subject) ->
    authorizator.can action, subject

  Admin.cannot = (action, subject) ->
    authorizator.cannot action, subject

  return Admin
)(Backbone, Backbone.Marionette, _, $ || window.jQuery || window.Zepto || window.ender)