Admin.DeleteView = Marionette.ItemView.extend
  events:
    "click .no": "no"
    "click .yes": "yes"

  initialize: (options) ->
    if options is undefined || options.model is undefined
      throw new Error "No model given for the delete view when it is mandatory"

#  onDoDelete: (event) ->
#    @model.destroy()

  no: (event) ->
    event.preventDefault()
    @triggerMethod "no", event

  yes: (event) ->
    event.preventDefault()

#    @triggerMethod "do:delete", event
    @triggerMethod "yes", event

    @trigger "delete", @model

#    @trigger "deleted"#, @model