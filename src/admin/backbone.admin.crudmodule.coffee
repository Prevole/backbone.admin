Admin.CrudModule = Admin.Module.extend
  initialize: (options) ->
    @super(options)

    if @collection is undefined
      throw new Error "The collection must be specified"

    if @model is undefined and not (@collection.prototype.model is undefined)
      @model = @collection.prototype.model

    if @model is undefined
      throw new Error "The model must be specified"

