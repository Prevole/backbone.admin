Admin.NavigationView = class extends Marionette.View
  events:
    "click [data-action]": "action"

  initialize: (options) ->
    options.applicationController.listenTo @, "action", options.applicationController.routeAction

  action: (event) ->
    event.preventDefault()

    @trigger "action", $(event.target).attr("data-action")
