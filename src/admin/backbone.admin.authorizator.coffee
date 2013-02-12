###

###
Admin.Authorizator = class
  ###
  Check if an action is authorized for the user or not.

  @param {String} action The action to check
  @param {Object} subject Can represent the user to check if he can do the action or not
  @return {Boolean} True/False depending the result of the authorization process
  ###
  can: (action, subject) ->
    true

  ###
  Convenient method to apply the inverse of can method

  @param {String} action The action to check
  @param {Object} subject Can represent the user to check if he can do the action or not
  @return {Boolean} True/False depending the result of the authorization process
  ###
  cannot: (action, subject) ->
    not @can(action, subject)
