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

