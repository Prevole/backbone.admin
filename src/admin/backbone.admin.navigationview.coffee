Admin.NavigationView = class extends Marionette.View
  events:
    "click [data-action]": "action"

  action: (event) ->
    event.preventDefault()

    @trigger "action", $(event.target).attr("data-action")
