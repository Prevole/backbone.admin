###
## Admin.CrudModule

Default implementation of `CRUD` module. The four main actions are define like this:

- `Create`: Create action for the creation of new records
- `Read`: List of the records
- `Update`: Edition of any existing record
- `Delete`: Deletion of any existing record

For the `Create`, `Read` and `Update` actions, they are supposed to be backed by an `URL` that exists and
that could be called at any time. The purpose is to offer the possibility to bookmark the page.

In the case of `Delete` action, it's a little different. Once a record is deleted, the resource is no more
existing and then the `Delete` cannot be called twice. In consequence, the `Delete` action is not expected
to have an `URL` that we could calle twice. It's more supposed to be handled by a confirmation popup or
something equivalent.
###
Admin.CrudModule = Admin.Module.extend
  ###
  Constructor

  ```
  # Options
  options:
    collection:
    model:
    views:

  ```
  - **collection**: The collection that is managed by the module
  - **model**: The model is mandatory if the collection does not contain one
  - **views**: A list of views managed by the `CRUD` module. The views exptect to contain the following
    ```
    # Minimum views
    views:
      main:
        view: ListViewClass
        region: "regionToShowTheListView"
      create:
        view: CreateViewClass
        region: "regionToShowTheCreateView"
      edit:
        view: EditViewClass
        region: "regionToShowTheEditView"
      delete:
        view: DeleteViewClass
    ```

    - **main**: Correspond to the principal view and acts as entry point for the module
    - **create**: Allows creating new records
    - **edit**: Allows editing existing records
    - **delete**: Allows deleting existing views. As it's expected to be something like a popup, no region is required.

  @params {Object} options A list of options
  ###
  constructor: (options) ->
    Admin.Module.prototype.constructor.apply @, _.slice(arguments)

    # Check if the collection is there
    throw new Error 'The collection must be specified' if @collection is undefined

    # Try to find a model class
    if _.isFunction @collection
      @model = @collection.prototype.model if @model is undefined and not (@collection.prototype.model is undefined)
    else
      @model = @collection.model

    # Check if a model is finally defined
    throw new Error 'The model must be specified' if @model is undefined

    # Check if there is an object views defined
    throw new Error 'Views must be defined' if @views is undefined

    # TODO: Compare the route actions with the list of views

  ###
  Execution of the main action

  @param {Admin.Action} action The action to enrich
  @return {Admin.Action} The action updated
  ###
  onActionMain: (action) ->
    view = new @views.main.view

    # Bind the three main actions to the view of the main action
    @listenTo view, 'new', ->
      @trigger 'action:route', 'create'

    @listenTo view, 'edit', (model) ->
      @trigger 'action:route', 'edit', {id: model.get('id')}, {model: model}

    @listenTo view, 'delete', (model) ->
      @trigger 'action:noroute', 'delete', {model: model}

    # Set the region to update with the view
    action.updatedRegions[@views.main.region] = _.wrapView view

  ###
  Execution of the create action

  @see The documentation of `_createOrEditAction` function
  @param {Admin.Action} The action to enrich
  @return {Admin.Action} The action updated
  ###
  onActionCreate: (action) ->
    @_createOrEditAction 'create', action, new @collection.model

  ###
  Execute the model creation from the data retrieved from the create view

  @see The documentation of `_saveOrCreate` function
  @param {Backbone.Model} model The model to create or update
  @param {Object} modelAttributes The attributes to set to the model
  @return {Boolean} True if the client validation succeed, failed otherwise
  ###
  onCreate: (model, modelAttributes) ->
    @_saveOrCreate 'create', model, modelAttributes

  ###
  Function called when a `Backbone.Model` has been successfully created
  and synced with the backend.

  @param {Backbone.Model} model The model successfully created
  @param {Object} response The response from the backend
  @param {Object} options The options given when the model is created
  ###
  onCreateSuccess: (model, response, options) ->
    # Notice the model creation
    @trigger 'created', model

    # Go back to the main action
    @trigger 'action:route', 'main'

  ###
  Function called when a `Backbone.Model` cannot be created and the
  backend returned an error

  @param {Backbone.Model} model The model in error
  @param {Xhr} xhr The request object with the response
  @param {Object} options The options given when the model is created
  ###
  onCreateError: (model, xhr, options) ->
    console.log("Unable to create the model on the backend. Implement the error handler there.")

  ###
  Execution of the edition action

  @see The documentation of `_createOrEditAction` function
  @param {Admin.Action} The action to enrich
  @return {Admin.Action} The action updated
  ###
  onActionEdit: (action) ->
    @_createOrEditAction 'edit', action, _.retrieveModel(@collection, action)

  ###
  Execute the model edition from the data retrieved from the edit view

  @see The documentation of `_saveOrCreate` function
  @param {Backbone.Model} model The model to create or update
  @param {Object} modelAttributes The attributes to set to the model
  @return {Boolean} True if the client validation succeed, failed otherwise
  ###
  onEdit: (model, modelAttributes) ->
    @_saveOrCreate 'edit', model, modelAttributes

  ###
  Function called when a `Backbone.Model` has been successfully saved
  and synced with the backend.

  @param {Backbone.Model} model The model successfully edited
  @param {Object} response The response from the backend
  @param {Object} options The options given when the model is edited
  ###
  onEditSuccess: (model, response, options) ->
    # Notice the model edition
    @trigger 'edited', model

    # Go back to the main action
    @trigger 'action:route', 'main'

  ###
  Function called when a `Backbone.Model` cannot be saved and the
  backend returned an error

  @param {Backbone.Model} model The model in error
  @param {Xhr} xhr The request object with the response
  @param {Object} options The options given when the model is edited
  ###
  onEditError: (model, xhr, options) ->
    console.log("Unable to update the model on the backend. Implement the error handler there.")

  ###
  Execution of the deletion action.

  @param {Admin.Action} The action to enrich
  ###
  onActionDelete: (action) ->
    # Instantiate the delete view with an existing model from the collection
    view = new @views.delete.view {model: _.retrieveModel(@collection, action)}

    # Listen to the deletion of a model from the view
    @listenTo view, 'delete', (model) =>
      # Delegates the model deletion
      @triggerMethod 'delete', model

    # Render the view as it is not part of the normal flow of actions
    view.render()

    return

  ###
  Execute the model deletion of the model

  By default, the deletion is done through `Backbone.Model.destroy` which
  delete the model, clear the model from the collection and also run the
  `sync` function to propagate the deletion to the backend.

  The `Backbone.Model.destroy` function is called with the `options` enriched by
  `success(model, response, options)`, `error(model, xhr, options)`. If these options
  are already provided, they will be overriden.

  To use the `success` and `error` callbacks, you must override the functions
  `onDeleteSuccess` and `onDeleteError`. These functions are called in the
  `success` and `error` function givent to the `save` options.

  To use custom options with the `destroy` function, you can define
  a `hash` or a `function` called `deleteOptions` on the `CRUD` module.

  The `sync` function from the model is then used to propagate the
  deletion to the backend.

  @param {Backbone.Model} model The model to delete
  @return {Backbone.Model} The model deleted
  ###
  onDelete: (model) ->
    # Retrieve custom options
    options = _.result(@, 'deleteOptions') || {}

    # Force the usage of custom success and error callbacks
    # that cannot be overriden by the options. Also force to not validate
    # since the validation already occured with the set just done before
    return model.destroy _.extend(options, {
      success: (model, response, options) =>
        @triggerMethod 'delete:success', model, response, options
      error: (model, xhr, options) =>
        @triggerMethod 'delete:error', model, xhr, options
    })

  ###
  Function called when a `Backbone.Model` has been successfully removed
  on the backend.

  @param {Backbone.Model} model The model successfully destroyed
  @param {Object} response The response from the backend
  @param {Object} options The options given when the model is destroyed
  ###
  onDeleteSuccess: (model, response, options) ->
    # Notice the model deletion
    @trigger 'deleted', model

  ###
  Function called when a `Backbone.Model` cannot be removed and the
  backend returned an error

  @param {Backbone.Model} model The model in error
  @param {Xhr} xhr The request object with the response
  @param {Object} options The options given when the model is destroyed
  ###
  onDeleteError: (model, xhr, options) ->
    console.log("Unable to delete the model on the backend. Implement the error handler there.")

  ###
  Create or edit action handling. Create the proper view, set the
  model, add the right listeners to handle the validation errors if
  any `error` function is defined on the view.

  Also bind the action of creation or edition on the view to trigger
  the realization of the action (saving the attributes).

  And finally, prepare the region to update.

  @param {String} actionType The action type of the operation
  @param {Admin.Action} action The action to update
  @param {Backbone.Model} model The model to handle in the operation
  @return {Admin.Action} The action updated
  ###
  _createOrEditAction: (actionType, action, model) ->
    # Instantiate the create view with an empty model from the collection
    view = new @views[actionType].view model: model

    # Ensure the view is listening for validation errors
    view.listenTo model, "invalid", view.error if view.error

    # Listen to the creation of the new model from the view
    @listenTo view, actionType, (modelAttributes) =>
      # Delegates the model creation
      @triggerMethod actionType, view.model, modelAttributes

    # Set the region to update with the create view
    action.updatedRegions[@views[actionType].region] = _.wrapView view

  ###
  Save or create a new model by setting the attributes after they are validated

  By default, the create or update is done through a call to `Backbone.Model.set` with the
  attributes given and force the `validate` option to be `true` to ensure the validation
  is done during the `set` function call. The client side validation can be handled by this.
  The `model` will only be saved if the validation (client and server) is ok.

  The `Backbone.Model.save` function is called with the `options` enriched by
  `success(model, response, options)`, `error(model, xhr, options)` and `validate = false`.
  If these options are already provided, they will be overriden.

  To use the `success` and `error` callbacks, you must override the functions
  `on(Create|Edit)Success` and `on(Create|Edit)Error`. These functions are called in the
  `success` and `error` function given to the `save` options.

  The `validate` option set to `false` for the `save` function avoid double
  validation. Since the validation is already done in the `set` function.

  To use custom options with the `save` and `validate` functions, you can define
  a `hash` or a `function` called `(create|edit)Options` on the `CRUD` module.

  The `sync` function from the model is then used to propagate the creation
  or edition to the backend.

  @param {String} action The action type of the operation (create or edit)
  @param {Backbone.Model} model The model to create or update
  @param {Object} modelAttributes The attributes to set to the model
  @return {Boolean} True if the client validation succeed, failed otherwise
  ###
  _saveOrCreate: (action, model, modelAttributes) ->
    # Retrieve custom options and force the validation
    options = _.extend(_.result(@, "#{action}Options") || {}, validate: true)

    # Check if the client side validation is ok when attributes are set
    if model.set modelAttributes, options
      # Force the usage of custom success and error callbacks
      # that cannot be overriden by the options. Also force to not validate
      # since the validation already occured with the set just done before
      return model.save null, _.extend(options, {
        validate: false
        success: (model, response, options) =>
          @triggerMethod "#{action}:success", model, response, options
        error: (model, xhr, options) =>
          @triggerMethod "#{action}:error", model, xhr, options
      })
    else
      return false
