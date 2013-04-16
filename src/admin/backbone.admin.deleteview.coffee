Admin.DeleteView = Backbone.View.extend
  triggerMethod: Marionette.triggerMethod

  events:
    "click .no": "no"
    "click .yes": "yes"

  initialize: (options) ->
    throw new Error "No model given for the delete view when it is mandatory" if options.model is undefined

    @model = options.model

  no: (event) ->
    event.preventDefault()
    @triggerMethod "no", event
    @remove()

  yes: (event) ->
    event.preventDefault()
    @triggerMethod "yes", event
    @trigger "delete"
    @remove()
