#= demo-data.coffee

DataModel = class extends Backbone.Model
  fields: ["era", "serie", "title", "timeline", "author", "release", "type"]

  match: (quickSearch) ->
    _.reduce(@fields, (sum, attrName) ->
      sum || @attributes[attrName].toString().toLowerCase().indexOf(quickSearch) >= 0
    , false, @)

  getFromIndex: (index) ->
    @get(@fields[index])

models = _.reduce(data, (models, modelData) ->
  models.push new DataModel(modelData)
  models
, [])

dataCollection = class extends Backbone.Collection
  model: DataModel

  initialize: (models, options) ->
    if options is undefined or options.meta is undefined
      customs = {}
    else
      customs = options.meta

    @meta =
      _.defaults customs,
        page: 1
        perPage: 5
        term: ""
        sort: {}

  sync: (method, model, options) ->
    storedSuccess = options.success
    options.success = (collection, response, options) =>
      storedSuccess(collection, response, options)
      @trigger "fetched"

    localData = _.clone(models)

    localData = _.filter localData, (model) =>
      return model.match(@meta.term.toLowerCase())

    # Filtered items
    @meta.items = localData.length

    localData = localData.sort (a, b) =>
      for idx, direction of @meta.sort
        if direction
          left = a.getFromIndex(idx).toString().toLowerCase()
          right = b.getFromIndex(idx).toString().toLowerCase()
          comp = left.localeCompare(right)
          return comp * (if direction == 'A' then 1 else -1) if comp != 0

      return 0

    @meta.pages = Math.ceil(localData.length / @meta.perPage)
    @meta.totalItems = localData.length

    @meta.from = (@meta.page - 1) * @meta.perPage
    @meta.to = @meta.from + @meta.perPage
    localData = localData.slice(@meta.from, @meta.to)
    @meta.from = @meta.from + 1

    options.success(@, localData, update: false)

  refresh: ->
    @reset()
    @fetch()

  getInfo: ->
    @meta

  updateInfo: (options) ->
    @meta = _.defaults options, @meta
    @fetch()

#NavigationView = class extends Admin.NavigationView
#  el: ".menu"
#
#  events:
#    "click a": "handleClick"
#
#  # Handle click on menu item
#  # @param [Event] event The event
#  handleClick: (event) ->
#    event.preventDefault()
#    @switchModule $(event.target).attr("data-module")
#
## Region that implements a transitional change of views
#MainRegion = class extends Backbone.Marionette.Region
#  el: ".content"
#
#  # Open
#  # @param [Backbone.View] view The view to open
#  open: (view) ->
#    @$el.html view.el
#    @$el.show "slide", { direction: "left" }, 1000, =>
#      view.trigger "transition:open"
#
#  # Show
#  # @param [Backbone.View] view The view to show
#  show: (view) ->
#    if @$el
#      $(@el).hide "slide", { direction: "left" }, 1000, =>
#        view.trigger "transition:show"
#        super view
#    else
#      super view

#= modules/books.coffee

#$(document).ready ->
#  Admin.start(
#    navigationView: NavigationView
#    mainRegion: MainRegion
#  )

BooksModule = class extends Admin.Module
  name: "books"
  routableActions: {
    main: "main"
  }

  main: ->
    Test = Backbone.View.extend
      el: ".content"

      render: ->
        $(@el).text("Books")

    new Test()

FruitsModule = class extends Admin.Module
  name: "fruits"
  routableActions: {
    main: "main"
  }

  main: ->
    Test = Backbone.View.extend
      el: ".content"

      render: ->
        $(@el).text("Fruits")

    new Test()

NavigationView = class extends Admin.NavigationView
  el: ".menu"

$(document).ready ->
  appController = new Admin.ApplicationController()

  navigationView = new NavigationView()

  appController.listenTo navigationView, "action", appController.action

  appController.register(new BooksModule())
  appController.register(new FruitsModule())

  new Marionette.Application().start()