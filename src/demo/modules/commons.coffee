_.mixin
  collectionize: (model, rawModels) ->
    id = 0

    _.reduce(rawModels, (models, modelData) ->
      models.push new model(_.extend(modelData, {id: id++}))
      models
    , [])

###
## DataModel

The model class used in this demo
###
DataModel = class extends Backbone.Model
  ###
  Allow to do a quick search in a collection for the `Backbone.Dg`

  @param {String} quickSearch The term to lookup in the model
  ###
  match: (quickSearch) ->
    _.reduce(@fields, (sum, attrName) ->
      sum || @attributes[attrName].toString().toLowerCase().indexOf(quickSearch) >= 0
    , false, @)

  ###
  Get the value of an attribute based on an index

  @param {Integer} index The attribute index to convert in an attribute name
  ###
  getFromIndex: (index) ->
    @get(@fields[index])

###
## ModelCollection

The model collection specially written for this demo. It simulates
the asynchronous calls to a server and apply the different manipulation
to the data for the `Backbone.Dg` grid
###
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

    @originalModels = _.clone models

  addToOriginal: (model) ->
    @originalModels.push model

  removeFromOriginal: (model) ->
    @originalModels = _.reject @originalModels, (currentModel) ->
      currentModel.id == model.id

  sync: (method, model, options) ->
    storedSuccess = options.success
    options.success = (models) =>
      storedSuccess(models)
      @trigger "fetched"

    localData = _.clone @originalModels

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

    options.success(localData)

  refresh: ->
    @reset()
    @fetch()

  getInfo: ->
    @meta

  updateInfo: (options) ->
    @meta = _.defaults options, @meta
    @fetch()

###
## DeleteView

The view to delete a record
###
DeleteView = Admin.DeleteView.extend
  template: (data) ->
    '<div id="deleteModal" class="modal hide fade" tabindex="1" role="dialog">' +
      '<div class="modal-header">' +
        '<button class="close no" type="button">x</button>' +
        '<h3 id="modalLabel">Delete configuration</h3>' +
      '</div>' +
      '<div class="modal-body">' +
        '<p>Do you really want to delete this record?</p>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn no">No</button>' +
        '<button class="btn btn-primary yes">Yes</button>' +
      '</div>' +
    '</div>'

  ui:
    modal: "#deleteModal"

  onNo: (event) ->
    @ui.modal.modal "hide"

  onYes: (event) ->
    @ui.modal.modal "hide"

  onRender: ->
    $("body").append(@$el)

    @ui.modal.on 'hidden', =>
      @remove()

    @ui.modal.modal(show: true)