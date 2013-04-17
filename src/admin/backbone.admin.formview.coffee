Admin.FormView = Backbone.Marionette.ItemView.extend
  events:
    "click .create": "create"
    "click .edit": "edit"

  modelAttributes: ->
    throw new Error "Missing method getAttributes()."

  createOrUpdate: ->
    @model.save @modelAttributes()

  onDoCreate: (event) ->
    @createOrUpdate()

  onDoEdit: (event) ->
    @createOrUpdate()

  create: (event) ->
    event.preventDefault()

    @triggerMethod "do:create", event

    @trigger "created"#, @modelAttributes()

  edit: (event) ->
    event.preventDefault()

    @triggerMethod "do:edit", event

    @trigger "updated"#, @modelAttributes()