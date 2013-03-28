Admin.NavigationView = class extends Marionette.View
  events:
    "click [data-action]": "action"

  initialize: (options) ->
    if @applicationController is undefined
      if options.applicationController is undefined
        throw new Error "An application controller must be defined"
      else
        @applicationController = options.applicationController

  action: (event) ->
    event.preventDefault()

    @applicationController.trigger "action:outside:route", $(event.target).attr("data-action")
