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

```
# Default options
options:
  deltaPage: 2
  css:
    active: "active"
    disabled: "disabled"
    page: "page"
  texts:
    first: "<<"
    previous: "<"
    next: ">"
    last: ">>"
    filler: "..."
  numbers: true
  firstAndLast: true
  previousAndNext: true
```

- **delatePage**: Number of pages shown before and after the active one (if available)
- **css**: Different style added for link `disabled`, `active` or `page`
- **texts**: Texts used for each link excepted the page numbers
- **numbers**: Enable/Disable page number links
- **firstAndLast**: Enable/Disable first and last links
- **previousAndNext**: Enable/Disable previous and next links

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

  TODO: Complete the documentation with the new additions

  @param {Admin.Action} The action to enrich
  @return {Admin.Action} The action updated
  ###
  onActionCreate: (action) ->
    # Instantiate the create view with an empty model from the collection
    view = new @views.create.view(model: new @collection.model)

    # Ensure the view is listening for validation errors
    view.listenTo @, 'create:invalid', view.error if view.error

    # Listen to the creation of the new model from the view
    @listenTo view, 'create', (modelAttributes) =>
      # Delegates the model creation
      model = @triggerMethod 'create', modelAttributes

      # Check if the creation is done
      if model
        # Notice the model creation
        @trigger 'created', model

        # Go back to the main action
        @trigger 'action:route', 'main'

    # Set the region to update with the create view
    action.updatedRegions[@views.create.region] = _.wrapView view

  ###
  Execute the model creation from the data retrieved from the create view

  By default, the creation is done through a creation of a new `Backbone.Model`
  (or sub class) and the call to the `save` function with the attributes given
  This ensure that the validation of the `Backbone.Model` could be done properly
  and the potential errors could be handled. The `model` will only be added to the
  collection if the validation (client and server) is ok. This will be done through
  the call of `onCreateSuccess`.

  The `Backbone.Model.save` function is called with the `options` enriched
  by `success(model, response, options)` and `error(model, xhr, options)`. If these
  options are already provided, they will be overriden.

  To use the `success` and `error` callbacks, you must override the functions
  `onCreateSuccess` and `onCreateError`. These functions are called in the
  `success` and `error` function givent to the `save` options.

  To use custom options with the `create` and `isValid` functions, you can
  define a `hash` or a `function` called `createOptions` on the `CRUD` module.

  The `sync` function from the model is then used to propagate the
  creation to the backend.

  @param {Object} modelAttributes The model attributes to create the model
  @return {Backbone.Model} The model created or false
  ###
  onCreate: (modelAttributes) ->
    # Create a new model a give the URL from the collection
    model = new @collection.model(modelAttributes, url: @collection.url)

    # Propagate the model invalid event (for the create a view for example)
    @listenTo model, 'invalid', (model, error, options) =>
      @trigger 'create:invalid', model, error, options

    # Retrieve custom options
    options = _.result(@, 'createOptions') || {}

    # Check if the client side validation is ok
    if model.isValid options
      # Force the usage of custom success and error callbacks
      # that cannot be overriden by the options
      return model.save null, _.extend(options, {
        success: (model, response, options) =>
          @triggerMethod 'create:success', model, response, options
        error: (model, xhr, options) =>
          @triggerMethod 'create:error', model, xhr, options
      })
    else
      return false

  ###
  Function called when a `Backbone.Model` has been successfully created
  and synced with the backend.

  The model given will be added to the `CRUD` module `collection`

  @param {Backbone.Model} model The model successfully created
  @param {Object} response The response from the backend
  @param {Object} options The options given when the model is created
  ###
  onCreateSuccess: (model, response, options) ->
    @collection.add model

  ###
  Function called when a `Backbone.Model` cannot be created and the
  backend returned an error

  @param {Backbone.Model} model The model in error
  @param {Xhr} xhr The request object with the response
  @param {Object} options The options given when the model is created
  ###
  onCreateError: (model, xhr, options) ->
    # TODO: Comment the emptyness of the function

  ###
  Execution of the edition action

  @param {Admin.Action} The action to enrich
  @return {Admin.Action} The action updated
  ###
  onActionEdit: (action) ->
    # Instantiate the edit view with an existing model from the collection
    view = new @views.edit.view {model: _.retrieveModel @collection, action}

    # Listen the model to get the validation errors
    view.listenTo view.model, 'invalid', view.error

    # Listen to the edition of a model from the view
    @listenTo view, 'edit', (modelAttributes) ->
      # Delegates the model edition
      if @triggerMethod 'edit', view.model, modelAttributes
        # Notice the model edition
        @trigger 'edited', view.model

        # Go back to the main action
        @trigger 'action:route', 'main'

    action.updatedRegions[@views.edit.region] = _.wrapView view

  ###
  Execute the model edition from the data retrieved from the edit view

  By default, the edition is done through `Backbone.Model.save` which
  update and save the model and also run the `sync` function
  to propagate the edition to the backend.


  By default, the edition is done through a call to `Backbone.Model.set` with the
  attributes given and force the `validate` option to be `true` to ensure the validation
  is done during the `set` function call. The potential errors could be handled by this
  process. The `model` will only be saved if the validation (client and server) is ok.

  The `Backbone.Model.save` function is called with the `options` enriched by
  `success(model, response, options)`, `error(model, xhr, options)` and `validate = false`.
  If these options are already provided, they will be overriden.

  To use the `success` and `error` callbacks, you must override the functions
  `onEditSuccess` and `onEditError`. These functions are called in the
  `success` and `error` function givent to the `save` options.

  The `validate` option set to `false` for the `save` function avoid double
  validation. Since the validation is already done in the `set` function, it is
  not necessary to do it twice.

  To use custom options with the `save` and `validate` functions, you can define
  a `hash` or a `function` called `editOptions` on the `CRUD` module.

  The `sync` function from the model is then used to propagate the
  edition to the backend.

  @param {Backbone.Model} model The model to update
  @param {Object} modelAttributes The model attributes to update the model
  @return {Backbone.Model} The model updated
  ###
  onEdit: (model, modelAttributes) ->
    # Retrieve custom options and force the validation
    options = _.extend(_.result(@, 'editOptions') || {}, validate: true)

    # Check if the client side validation is ok when attributes are set
    if model.set modelAttributes, options
      # Force the usage of custom success and error callbacks
      # that cannot be overriden by the options. Also force to not validate
      # since the validation already occured with the set just done before
      return model.save null, _.extend(options, {
        validate: false
        success: (model, response, options) =>
          @triggerMethod 'edit:success', model, response, options
        error: (model, xhr, options) =>
          @triggerMethod 'edit:error', model, xhr, options
      })
    else
      return false

  ###
  Function called when a `Backbone.Model` has been successfully saved
  and synced with the backend.

  @param {Backbone.Model} model The model successfully edited
  @param {Object} response The response from the backend
  @param {Object} options The options given when the model is edited
  ###
  onEditSuccess: (model, response, options) ->
    # TODO: Comment the emptyness of the function

  ###
  Function called when a `Backbone.Model` cannot be saved and the
  backend returned an error

  @param {Backbone.Model} model The model in error
  @param {Xhr} xhr The request object with the response
  @param {Object} options The options given when the model is edited
  ###
  onEditError: (model, xhr, options) ->
    # TODO: Comment the emptyness of the function

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
      if @triggerMethod 'delete', model
        # Notice the model deletion
        @trigger 'deleted', model

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
    return model.destroy null, _.extend(options, {
      validate: false
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
    # TODO: Comment the emptyness of the function

  ###
  Function called when a `Backbone.Model` cannot be removed and the
  backend returned an error

  @param {Backbone.Model} model The model in error
  @param {Xhr} xhr The request object with the response
  @param {Object} options The options given when the model is destroyed
  ###
  onDeleteError: (model, xhr, options) ->
    # TODO: Comment the emptyness of the function
