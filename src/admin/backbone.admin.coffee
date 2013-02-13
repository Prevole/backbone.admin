###
Datagrid
========

The Datagrid plugin for `Bacbkone` gives the possibility to implement
easily a data table into a `Bacbkone` application. It uses `Backbone.Marionette`
and its different views to reach the features of the data table.

Dependencies:

- [jQuery 1.8.2](http://jquery.com)
- [JSON2 2011-10-19](http://www.JSON.org/json2.js)
- [Underscore 1.4.2](http://underscorejs.org)
- [Backbone 0.9.2](http://backbonejs.org)
- [Backbone.Marionette 1.0.0-beta1](http://github.com/marionettejs/backbone.marionette)
- [Backbone.EventBinder 0.0.0](http://github.com/marionettejs/backbone.eventbinder)
- [Backbone.Wreqr 0.0.0](http://github.com/marionettejs/backbone.wreqr)

By default, a complete implementation based on `<table />` HTML tag is
provided but all the views can be overrided quickly and easily to create
an implementation based on other views and tags.

A default collection is also provided to work with the `Dg` plugin.
###
Backbone.Admin = Admin = ( (Backbone, Marionette, _, $) ->
  Admin = { version: "0.0.1" }

  applicationStarted = false
  initialized = false

  moduleNamePattern = new RegExp(/[a-z]+(:[a-z]+)*/)

  # Create the event aggregator
  gvent = new Marionette.EventAggregator()

  authorizator = null


  # backbone.admin.utils.coffee
  #= backbone.admin.authorizator.coffee
  #= backbone.admin.mainregion.coffee
  #= backbone.admin.maincontroller.coffee
  #= backbone.admin.formview.coffee
  #= backbone.admin.modulecontroller.coffee
  #= backbone.admin.navigationview.coffee

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

      Router = Marionette.AppRouter.extend
        controller: module
        appRoutes:
          module.getRoutes()

        initialize: ->
          @on "changeUrl", (type) ->
            @changeUrl type

        changeUrl: (type, options) ->
          route = @controller.getRoute(type)

          if options
            for key, value of options
              route = route.replace(":#{key}", value)

          @navigate route

      module.setRouter new Router()

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

    vent = new Marionette.EventBinder()

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

    CRUDApplication = new Marionette.Application()

    CRUDApplication.on "initialize:after", ->
      Backbone.history.start(pushState: true)

    gvent.on "changeView", (view) ->
      CRUDApplication.mainRegion.show(view)

    CRUDApplication.addInitializer ->
      navigationView = new navigationViewClass()
#      mainController = new MainController()

      vent.bindTo navigationView, "navigate:switchModule", mainController.switchModule, mainController

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