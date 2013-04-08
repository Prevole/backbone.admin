#= ../data/fruits-data.coffee

###
## FruitModel

The fruit model to handle the fruit data
###
FruitModel = class extends DataModel
  fields: ["id", "name"]

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

###
## CreateFruitView

The view to create a new fruit
###
CreateFruitView = FormFruitView.extend
  template: "#createFruit"

  modelAttributes: ->
    {id: _.random(0, 1000), name: @ui.name.val()}

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

  routeActions:
    main:   ""
    create: "new"
    edit:   "edit/:id"

appController.addInitializer ->
  @registerModule(new FruitsModule())