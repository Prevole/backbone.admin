#= ../data/books-data.coffee

###
## BookModel

The book model to handle the book data
###
BookModel = class extends DataModel
  fields: ["era", "serie", "title", "timeline", "author", "release", "type"]

###
## BookCollection

The collection of books
###
BookCollection = class extends ModelCollection
  model: BookModel

###
The collection used in the views
###
bookCollection = new BookCollection(_.collectionize(BookModel, booksData))

###
Template used to render the grid headers for the books
###
bookHeaderTemplate = (data) ->
  '<th class="sorting">Era</th>' +
  '<th class="sorting">Serie</th>' +
  '<th class="sorting">Title</th>' +
  '<th class="sorting">Timeline</th>' +
  '<th class="sorting">Author</th>' +
  '<th class="sorting">Release</th>' +
  '<th class="sorting">Type</th>' +
  '<th>Action</th>'

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
  "<td>#{data.type}</td>" +
  '<td><button class="edit btn btn-small">Update</button>&nbsp;' +
  '<button class="delete btn btn-small">Delete</button></td>'

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
  collection: bookCollection
  gridRegions:
    table:
      view: Dg.TableView.extend
        itemView: BookRowView
        headerView: BookHeaderView
)

###
## FormBookView

Base view to build create/edit form views
###
FormBookView = Admin.FormView.extend
  ui:
    title: "#title"

###
## CreateBookView

The view to create a new book
###
CreateBookView = FormBookView.extend
  template: "#createBook"

  modelAttributes: ->
    {id: _.random(0, 1000), title: @ui.title.val()}

###
## EditBookView

The view to edit an existing book
###
EditBookView = FormBookView.extend
  template: "#editBook"

  modelAttributes: ->
    {title: @ui.title.val()}

  onRender: ->
    @ui.title.val(@model.get("title"))

###
## BooksModule

The book module that manages the different actions related to the books
###
BooksModule = class extends Admin.CrudModule
  name: "books"
  collection: bookCollection

  views:
    main:
      view: BookGridLayout
      region: "mainRegion"
    create:
      view: CreateBookView
      region: "mainRegion"
    edit:
      view: EditBookView
      region: "mainRegion"
    delete:
      view: DeleteView

  routeActions:
    main:   ""
    create: "new"
    edit:   "edit/:id"

appController.addInitializer ->
  @registerModule(new BooksModule())