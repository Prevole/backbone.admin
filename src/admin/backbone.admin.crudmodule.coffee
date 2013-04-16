Admin.CrudModule = Admin.Module.extend
  constructor: () ->
    args = Array.prototype.slice.apply arguments
    Admin.Module.prototype.constructor.apply @, args

    throw new Error "The collection must be specified" if @collection is undefined

    if _.isFunction @collection
      @model = @collection.prototype.model if @model is undefined and not (@collection.prototype.model is undefined)
    else
      @model = @collection.model

    throw new Error "The model must be specified" if @model is undefined

    throw new Error "Views must be defined" if @views is undefined

    # TODO: Compare the route actions with the list of views

  onMain: (action) ->
    view = new @views.main.view

    view.on "new", =>
      @trigger "action:route", "create"

    view.on "edit", (model) =>
      @trigger "action:route", "edit", {id: model.get("id")}, {model: model}

    view.on "delete", (model) =>
      @trigger "action:noroute", "delete", {model: model}

    action.updatedRegions[@views.main.region] = _.view view

  onCreate: (action) ->
    view = new @views.create.view()

    view.on "create", (modelAttributes) =>
      @collection.create modelAttributes
      @trigger "action:route", "main"

    action.updatedRegions[@views.create.region] = _.view view

  onEdit: (action) ->
    view = new @views.edit.view(model: _.model @collection, action)

    view.on "edit", (modelAttributes) =>
      view.model.save(modelAttributes)
      @trigger "action:route", "main"

    action.updatedRegions[@views.edit.region] = _.view view

  onDelete: (action) ->
    view = new @views.delete.view(model: _.model(@collection, action))

    view.on "delete", =>
      view.model.destroy()
#      @collection.fetch()
      @trigger "action:noroute", "main"

    view.render()