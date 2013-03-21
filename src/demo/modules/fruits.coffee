#= ../data/fruits-data.coffee

###
## FruitModel

The fruit model to handle the fruit data
###
FruitModel = class extends DataModel
  fields: ["id", "name"]

###
The fruits data transformed to models
###
fruitModels = _.reduce(fruitsData, (models, modelData) ->
  models.push new FruitModel(modelData)
  models
, [])

###
## FruitCollection

The fruit collection
###
FruitCollection = class extends ModelCollection
  model: FruitModel

  getModels: ->
    fruitModels

###
The collection used in the views
###
fruits = new FruitCollection(fruitsData)

###
Template used to render the grid headers for the fruits
###
fruitHeaderTemplate = (data) ->
  "<th class='sorting'>Name</th>" +
  "<th>Action</th>"

###
Template used to render the grid rows for the fruits
###
fruitRowTemplate = (data) ->
  "<td>#{data.name}</td>" +
  "<td><button class=\"edit btn btn-small\">Update</button>&nbsp;" +
  "<button class=\"delete btn btn-small\">Delete</button></td>"

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
  collection: fruits
  gridRegions:
    table:
      view: Dg.TableView.extend
        itemView: FruitRowView
        headerView: FruitHeaderView
)

###
## FruitsModule

The book module that manages the different actions related to the fruits
###
FruitsModule = class extends Admin.Module
  name: "fruits"

  routableActions:
    main:   "fruits"
    add:    "fruits/add"
    edit:   "fruits/edit/:id"

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

        self.routableAction("main")

    r1: new AddFruitView()

  edit: (options) ->
    self = @

    if options.model is undefined
      model = fruits.get options[0]
    else
      model = options.model

    EditFruitView = Marionette.ItemView.extend
      template: "#editFruitForm"
      model: model

      events:
        "click button": "editFruit"

      ui:
        fruitName: "#fruitName"

      editFruit: (event) ->
        event.preventDefault()

        options.model.set("name", @ui.fruitName.val())
#        fruitModels.push new FruitModel({name: @ui.fruitName.val()})

        self.routableAction("main")

      onRender: ->
        @ui.fruitName.val(@model.get("name"))

    r1: new EditFruitView()

  delete: (options) ->
    fruitModels = _.reject fruitModels, (fruit) ->
      fruit.get("id") == options.model.get("id")

    fruits.refresh()
#    @action "main"

  main: ->
    fruitLayout = new FruitGridLayout()

    @listenTo fruitLayout, "new", =>
      @routableAction "add"

    @listenTo fruitLayout, "edit", (model) =>
      @routableAction "edit", {id: model.get("id")}, {model: model}

    @listenTo fruitLayout, "delete", (model) =>
      self = @

      if @deleteView is undefined
        @deleteView = new (Backbone.View.extend
          tagName: "div"

          events:
            "click .no": "no"
            "click .yes": "yes"

          no: (event) ->
            event.preventDefault()
            @$el.modal("hide")

          yes: (event) ->
            @no(event)
            self.action "delete", {model: @model}

          setModel: (model) ->
            @model = model
            @

          render: ->
            @$el = $("#deleteModal")
            @delegateEvents()
            @$el.modal(show: true)
            @
        )()

      @deleteView.setModel(model).render()

#      $("#deleteModal").modal(show: true)
#      @action "delete", {model: model}

    r1: fruitLayout

appController.addInitializer ->
  @registerModule(new FruitsModule())