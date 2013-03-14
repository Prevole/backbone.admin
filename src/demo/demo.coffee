#= books-data.coffee
#= fruits-data.coffee

DataModel = class extends Backbone.Model
  match: (quickSearch) ->
    _.reduce(@fields, (sum, attrName) ->
      sum || @attributes[attrName].toString().toLowerCase().indexOf(quickSearch) >= 0
    , false, @)

  getFromIndex: (index) ->
    @get(@fields[index])

# -----

BookModel = class extends DataModel
  fields: ["era", "serie", "title", "timeline", "author", "release", "type"]

# -----

FruitModel = class extends DataModel
  fields: ["id", "name"]

# -----

bookModels = _.reduce(booksData, (models, modelData) ->
  models.push new BookModel(modelData)
  models
, [])

# -----

fruitModels = _.reduce(fruitsData, (models, modelData) ->
  models.push new FruitModel(modelData)
  models
, [])

# -----

ModelCollection = class extends Backbone.Collection
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

    localData = _.clone @getModels()

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

# -----

BookCollection = class extends ModelCollection
  model: BookModel

  getModels: ->
    bookModels

books = new BookCollection(booksData)

# -----

FruitCollection = class extends ModelCollection
  model: FruitModel

  getModels: ->
    fruitModels

fruits = new FruitCollection(fruitsData)

# -----

bookHeaderTemplate = (data) ->
  "<th class='sorting'>Era</th>" +
  "<th class='sorting'>Serie</th>" +
  "<th class='sorting'>Title</th>" +
  "<th class='sorting'>Timeline</th>" +
  "<th class='sorting'>Author</th>" +
  "<th class='sorting'>Release</th>" +
  "<th class='sorting'>Type</th>"

# -----

bookRowTemplate = (data) ->
  "<td>#{data.era}</td>" +
  "<td>#{data.serie}</td>" +
  "<td>#{data.title}</td>" +
  "<td>#{data.timeline}</td>" +
  "<td>#{data.author}</td>" +
  "<td>#{data.release}</td>" +
  "<td>#{data.type}</td>"

# -----

fruitHeaderTemplate = (data) ->
  "<th class='sorting'>Name</th>" +
  "<th>Action</th>"

# -----

fruitRowTemplate = (data) ->
  "<td>#{data.name}</td>" +
  "<td><button class=\"edit btn btn-small\">Update</button></td>"

# -----

BookHeaderView = class extends Dg.HeaderView
  template: bookHeaderTemplate

# -----

BookRowView = class extends Dg.RowView
  template: bookRowTemplate

# -----

FruitHeaderView = class extends Dg.HeaderView
  template: fruitHeaderTemplate

# -----

FruitRowView = class extends Dg.RowView
  template: fruitRowTemplate

# -----

BookGridLayout = Dg.createGridLayout(
  collection: books
  gridRegions:
    table:
      view: Dg.TableView.extend
        itemView: BookRowView
        headerView: BookHeaderView
)

# -----

FruitGridLayout = Dg.createGridLayout(
  collection: fruits
  gridRegions:
    table:
      view: Dg.TableView.extend
        itemView: FruitRowView
        headerView: FruitHeaderView
)

# -----

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
  modelIdentifier: "id"

  actions: {
    main:   "books"
    add:    "books/add"
  }

  main: ->
    r1: new BookGridLayout()

#    Test = Backbone.View.extend
#      events:
#        "click [data-action]": "action"
#
#      action: (event) =>
#        event.preventDefault()
#
#        @action $(event.target).attr("data-action")
#
#      render: ->
#        $(@el).html("Books: #{Date.now()} | <a href=\"books/add\" data-action=\"books:add\">Add book</a>")
#
#    r1: new Test()

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
  modelIdentifier: "id"

#  routableActions: {
#    defaultAction: "defaultAction"
#    add: "add"
#    edit: "edit"
#  }

  actions:
    main:   "fruits"
    add:    "fruits/add"
    edit:   "fruits/edit/:id"


#  routes: [
#    {name: "default", url: "fruits"},
#    {name: "add", url: "fruits/new"},
#    {name: "edit", url: "fruits/edit/:id"}
#  ]

  add: ->
    self = @
    AddFruitView = Marionette.ItemView.extend
      template: "#fruitForm"
      collection: fruits

      events:
        "click button": "addFruit"

      ui:
        fruitName: "#fruitName"

      addFruit: (event) ->
        event.preventDefault()

        fruitModels.push new FruitModel({name: @ui.fruitName.val()})

        self.action("fruits")

    r1: new AddFruitView()

  edit: (options) ->
    self = @
    EditFruitView = Marionette.ItemView.extend
      template: "#editFruitForm"
      model: options.model
#      collection: fruits

      events:
        "click button": "editFruit"

      ui:
        fruitName: "#fruitName"

      editFruit: (event) ->
        event.preventDefault()

        options.model.set("name", @ui.fruitName.val())
#        fruitModels.push new FruitModel({name: @ui.fruitName.val()})

        self.action("fruits")

      onRender: ->
        @ui.fruitName.val(@model.get("name"))

    r1: new EditFruitView()

  main: ->
    fruitLayout = new FruitGridLayout()

    @listenTo fruitLayout, "new", =>
      @action "fruits:add"

    @listenTo fruitLayout, "edit", (model) =>
      @action "fruits:edit", {model: model}

    r1: fruitLayout

#    Test = Backbone.View.extend
##      el: ".content"
#
#      render: ->
#        $(@el).text("Fruits: #{Date.now()}")
#
#    Test2 = Backbone.View.extend
#      render: ->
#        $(@el).text("Vegetables: #{Date.now()}")
#
#     {
#      r2: new Test2()
#    }
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