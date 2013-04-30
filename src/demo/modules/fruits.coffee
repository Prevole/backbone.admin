#= ../data/fruits-data.coffee

###
## FruitModel

The fruit model to handle the fruit data
###
FruitModel = class extends DataModel
  fields: ["id", "name"]

  regexName: /^[a-zA-Z]+$/

  validate: (attrs, options) ->
    unless attrs.name.match @regexName
      return {name: 'The name can contain only lower and upercase letters and must contain at least one letter.'}

###
## FruitCollection

The fruit collection
###
FruitCollection = class extends ModelCollection
  model: FruitModel

###
The collection used in the views
###
fruitCollection = new FruitCollection(_.collectionize(FruitModel, fruitsData))

###
Template used to render the grid headers for the fruits
###
fruitHeaderTemplate = (data) ->
  '<th class="sorting">Name</th>' +
  '<th>Action</th>'

###
Template used to render the grid rows for the fruits
###
fruitRowTemplate = (data) ->
  "<td>#{data.name}</td>" +
  '<td><button class="edit btn btn-small">Update</button>&nbsp;' +
  '<button class="delete btn btn-small">Delete</button></td>'

###
## FruitHeaderView

Header view used in the grid rendering
###
FruitHeaderView = class extends Dg.HeaderView
  template: fruitHeaderTemplate

###
## FruitRowView

Row view used in the grid rendering
###
FruitRowView = class extends Dg.RowView
  template: fruitRowTemplate

###
## FruitGridLayout

This grid layout render the grid for the fruits
###
FruitGridLayout = Dg.createGridLayout(
  collection: fruitCollection
  gridRegions:
    table:
      view: Dg.TableView.extend
        itemView: FruitRowView
        headerView: FruitHeaderView
)

###
## FormFruitView

Base view to build create/edit form views
###
FormFruitView = Admin.FormView.extend
  ui:
    name: "#name"

  error: (model, error, options) ->
    field = @ui.name.closest '.control-group'
    field.addClass 'error'

    if (field).find('.help-inline').length == 0
      field.append($('<span class="help-inline"></span>').text(error.name))

###
## CreateFruitView

The view to create a new fruit
###
CreateFruitView = FormFruitView.extend
  template: "#createFruit"

  modelAttributes: ->
    {name: @ui.name.val()}

###
## EditFruitView

The view to edit an existing fruit
###
EditFruitView = FormFruitView.extend
  template: "#editFruit"

  modelAttributes: ->
    {name: @ui.name.val()}

  onRender: ->
    @ui.name.val(@model.get("name"))

###
## FruitsModule

The book module that manages the different actions related to the fruits
###
FruitsModule = class extends Admin.CrudModule
  name: "fruits"
  collection: fruitCollection

  views:
    main:
      view: FruitGridLayout
      region: "mainRegion"
    create:
      view: CreateFruitView
      region: "mainRegion"
    edit:
      view: EditFruitView
      region: "mainRegion"
    delete:
      view: DeleteView

  onCreateSuccess: (model, response, options) ->
    fruitCollection.addToOriginal model
    Admin.CrudModule.prototype.onCreateSuccess.apply @, arguments

  onDeleteSuccess: (model, response, options) ->
    fruitCollection.removeFromOriginal model
    fruitCollection.fetch()
    Admin.CrudModule.prototype.onDeleteSuccess.apply @, arguments

  routeActions:
    main:   ""
    create: "new"
    edit:   "edit/:id"

appController.addInitializer ->
  fruitModule = new FruitsModule()

  @registerModule(fruitModule)