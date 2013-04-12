Admin.FormView = Backbone.Marionette.ItemView.extend
  events:
    "click .create": "create"
    "click .edit": "edit"

  modelAttributes: ->
    throw new Error "Missing method getAttributes()."

  create: (event) ->
    event.preventDefault()

    @trigger "create", @modelAttributes()

  edit: (event) ->
    event.preventDefault()

    @trigger "edit", @modelAttributes()