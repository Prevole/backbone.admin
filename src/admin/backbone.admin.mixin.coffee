_.mixin
  view: (view) ->
    _.object ["view"], [view]

  model: (collection, action) ->
    throw new Error "Action must be defined" if action is undefined
    throw new Error "Options in action must be defined" if action.options is undefined

    if action.options.model is undefined
      collection.get action.options.id
    else
      action.options.model
