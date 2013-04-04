#= ../data/books-data.coffee
###
## BookModel

The book model to handle the book data
###
BookModel = class extends DataModel
  fields: ["era", "serie", "title", "timeline", "author", "release", "type"]

###
The books transformed into models
###
bookModels = _.reduce(booksData, (models, modelData) ->
  models.push new BookModel(modelData)
  models
, [])

###
## BookCollection

The collection of books
###
BookCollection = class extends ModelCollection
  model: BookModel

  getModels: ->
    bookModels

###
The collection used in the views
###
books = new BookCollection(booksData)

###
Template used to render the grid headers for the books
###
bookHeaderTemplate = (data) ->
  "<th class='sorting'>Era</th>" +
  "<th class='sorting'>Serie</th>" +
  "<th class='sorting'>Title</th>" +
  "<th class='sorting'>Timeline</th>" +
  "<th class='sorting'>Author</th>" +
  "<th class='sorting'>Release</th>" +
  "<th class='sorting'>Type</th>"

###
Template used to render the grid rows for the books
###
bookRowTemplate = (data) ->
  "<td>#{data.era}</td>" +
  "<td>#{data.serie}</td>" +
  "<td>#{data.title}</td>" +
  "<td>#{data.timeline}</td>" +
  "<td>#{data.author}</td>" +
  "<td>#{data.release}</td>" +
  "<td>#{data.type}</td>"

###
## BookHeaderView

Header view used in the grid rendering
###
BookHeaderView = class extends Dg.HeaderView
  template: bookHeaderTemplate

###
## BookRowView

Row view used in the grid rendering
###
BookRowView = class extends Dg.RowView
  template: bookRowTemplate

###
## BookGridLayout

This grid layout render the grid for the books
###
BookGridLayout = Dg.createGridLayout(
  collection: books
  gridRegions:
    table:
      view: Dg.TableView.extend
        itemView: BookRowView
        headerView: BookHeaderView
)

###
## BooksModule

The book module that manages the different actions related to the books
###
BooksModule = class extends Admin.Module
  name: "books"

  routeActions:
    main:   ""
    add:    "add"

  main: ->
    {
      r1: new BookGridLayout()
      r2: new BookGridLayout()
    }
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

appController.addInitializer ->
  @registerModule(new BooksModule())