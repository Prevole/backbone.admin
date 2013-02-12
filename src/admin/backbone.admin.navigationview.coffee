# Manage the navigation menu
Admin.NavigationView = class extends Marionette.View
  switchModule: (moduleName) ->
    @trigger "navigate:switchModule", moduleName
