
sortByValue = (object) ->
  tuples = _.map object, (value, key) -> [key, value]
  _.sortBy tuples, (tuple) -> tuple[1]