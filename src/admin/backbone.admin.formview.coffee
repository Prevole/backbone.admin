###
## Admin.FormView

Represent the basic form to handle creation and/or edition
of a model. Automatically bind events for `create` or `edit`
###
Admin.FormView = Backbone.Marionette.ItemView.extend
  # Define the events for creat and edit
  events:
    'click .create': 'create'
    'click .edit': 'edit'

  ###
  Enforce a way to retrieve the forms values to set to a model.

  By default, this function raise an error. You should override
  this function.

  @return {Object} The model attributes that a model can use
  ###
  modelAttributes: ->
    throw new Error 'Missing method modelAttributes().'

  ###
  Handle the create event from the form

  If an `onBeforeCreate` exists, it will be call. The result should
  be evaluable as `boolean` expression.

  @param {Event} event The form event raised to create a model
  ###
  create: (event) ->
    event.preventDefault()

    # Execute the before create function
    beforeCreateResult = @triggerMethod 'before:create', event

    # Notify the creation if the before function is valid
    @trigger 'create', @modelAttributes() if _.isUndefined(beforeCreateResult) or beforeCreateResult

  ###
  Handle the update event from the form

  @param {Event} event The form event raised to update a model
  ###
  edit: (event) ->
    event.preventDefault()

    # Execute the before create function
    beforeEditResult = @triggerMethod 'before:edit', event

    # Notify the creation if the before function is valid
    @trigger 'edit', @modelAttributes() if _.isUndefined(beforeEditResult) or beforeEditResult

  ###
  Give a way to manage the validation errors from the model
  to the view.

  By default, this function does nothing. You can override it
  if you want to handle the errors properly. They are silently
  ignored by default.

  @param {Backbone.Model} model The model that contains error
  @param {Object} error The validation errors
  @param {Object} options The options used to sync the creation or edition
  ###
  error: (model, error, options) ->