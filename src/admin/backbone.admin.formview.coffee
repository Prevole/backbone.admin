Admin.FormView = Backbone.Marionette.ItemView.extend
  events:
    "click .create": "create"
    "click .edit": "edit"

  modelAttributes: ->
    throw new Error "Missing method getAttributes()."

  createOrUpdate: ->
    @model.save @modelAttributes()

  onCreate: (event) ->
    @createOrUpdate()

  onEdit: (event) ->
    @createOrUpdate()

  create: (event) ->
    event.preventDefault()

    @triggerMethod "create", event

    @trigger "created"#, @modelAttributes()

  edit: (event) ->
    event.preventDefault()

    @triggerMethod "edit", event

    @trigger "updated"#, @modelAttributes()