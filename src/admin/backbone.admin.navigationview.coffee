# Manage the navigation menu
Admin.NavigationView = class extends Marionette.View
#  switchModule: (moduleName) ->
#    @trigger "navigate:switchModule", moduleName

  events:
    "click a": "action"

  action: (event) ->
    alert $(event.target).attr("data-module")