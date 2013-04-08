Admin.DeleteView = Backbone.View.extend
  triggerMethod: Marionette.triggerMethod

  events:
    "click .no": "no"
    "click .yes": "yes"

  no: (event) ->
    event.preventDefault()
    @triggerMethod "no", event

  yes: (event) ->
    event.preventDefault()
    @triggerMethod "yes", event
    @trigger "delete", @model
