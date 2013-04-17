Admin.DeleteView = Marionette.ItemView.extend
  events:
    "click .no": "no"
    "click .yes": "yes"

  initialize: (options) ->
    if options is undefined || options.model is undefined
      throw new Error "No model given for the delete view when it is mandatory"

  onYes: (event) ->
    @model.destroy()

  no: (event) ->
    event.preventDefault()
    @triggerMethod "no", event

  yes: (event) ->
    event.preventDefault()

    @triggerMethod "yes", event

    @trigger "deleted"#, @model