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
    add: "add"
  }

  main: ->
    Test = Backbone.View.extend
      events:
        "click [data-action]": "action"

      action: (event) ->
        event.preventDefault()

        @trigger "action", "add"

#      el: ".content"

      render: ->
        link = $("a").attr("href", "books/add").text("Add book")
        $(@el).text("Books: #{Date.now()}")
        $(@el).append($("br")).append(link)

    r1: new Test()

  add: ->
    F1 = Backbone.View.extend
#      el: ".content"

      render: ->
        $(@el).text("From books: Fruits: #{Date.now()}")

    F2 = Backbone.View.extend
      render: ->
        $(@el).text("From books: Vegetables: #{Date.now()}")

    {
      r1: new F1()
      r2: new F2()
    }

#Layout2 = class extends Marionette.Layout
##  el: ".content2"
#  template: "#test",
#
#  regions:
#    a1:
#      selector: "#a1"
#      regionType: class extends Marionette.Region
#    a2:
#      selector: "#a2"
#      regionType: class extends Marionette.Region

FruitsModule = class extends Admin.Module
  name: "fruits"
  routableActions: {
    main: "main"
  }

  main: ->
    Test = Backbone.View.extend
#      el: ".content"

      render: ->
        $(@el).text("Fruits: #{Date.now()}")

    Test2 = Backbone.View.extend
      render: ->
        $(@el).text("Vegetables: #{Date.now()}")

    {
      r1: new Test()
      r2: new Test2()
    }
#    r2: new Layout2()

NavigationView = class extends Admin.NavigationView
  el: ".menu"

Region1 = class extends Marionette.Region
  el: ".content1"

Region2 = class extends Marionette.Region
  el: ".content2"

$(document).ready ->
  appController = new Admin.ApplicationController(new Marionette.Application())

  navigationView = new NavigationView()

  appController.listenTo navigationView, "action", appController.action

  appController.registerModule(new BooksModule())
  appController.registerModule(new FruitsModule())

  region1 = new Region1()
  region2 = new Region2()

  appController.registerRegion("r1", region1)
  appController.registerRegion("r2", region2)

  appController.start()