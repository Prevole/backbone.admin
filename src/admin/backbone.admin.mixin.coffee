_.mixin
  ###
  From a simple view object, create a complex object
  like: `{view: viewObject}`

  @param {Object} view The view to wrap into an object
  @return {Object} The view wrapped in an object
  ###
  wrapView: (view) ->
    _.object ["view"], [view]

  retrieveModel: (collection, action) ->
    throw new Error "Action must be defined" if action is undefined
    throw new Error "Options in action must be defined" if action.options is undefined

    if action.options.model is undefined
      collection.get action.options.id
    else
      action.options.model

  slice: Function.prototype.call.bind(Array.prototype.slice)

