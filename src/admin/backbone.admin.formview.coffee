Admin.FormView = Backbone.Marionette.ItemView.extend
  events:
    "click .cancel": "cancel"
    "click .create": "create"
    "click .edit": "edit"

  modelAttributes: ->
    throw new Error "Missing method getAttributes()."

  create: (event) ->
    event.preventDefault()

    @trigger "create", @modelAttributes()

  edit: (event) ->
    event.preventDefault()

    @trigger "edit", @modelAttributes()

  cancel: (event) ->
    event.preventDefault()

    @trigger "cancel"

#    fruitModels.push new FruitModel({id: _.random(0, 1000), name: @ui.fruitName.val()})
#
#    @trigger "add:done"


#  create: (event) ->
#    event.preventDefault()
#
#    @model.set @getAttributes.call(@)
#
#    @controller.collection.create @model,
#      wait: true
#      success: (model, response) =>
#        mainController.switchModule(@controller.name)
#      error: (model, response) =>
#        @handleErrors model, response

#  update: (event) ->
#    event.preventDefault()
#
#    @model.save @getAttributes.call(@),
#      success: (model, response) =>
#        mainController.switchModule(@controller.name)
#      error: (model, response) =>
#        @handleErrors model, response
#
#  # Cancel the actual creation started
#  # @param [Event] event The event
#  cancel: (event) ->
#    event.preventDefault()
#    mainController.switchModule(@controller.name)

#  handleErrors: (model, response) ->
#    console.log("Server side validation failed.")
#      $(".control-group").each ->
#        $(@).removeClass("error")
#        $(".alert-error", $(@)).remove()
#
#      for key, errors of response
#        # TODO: Find a way to do that
#        control = $("##{key}", @$el).parent().parent().parent()
#        control.removeClass("success").addClass("error")
#
#        div = $("<div />").addClass("alert alert-block alert-error error-block").hide()
#        ul = $("<ul />")
#        div.append(ul)
#
#        for message in errors
#          li = $("<li>").html("#{message}")
#          ul.append(li)
#
#        $(".controls", control).append(div)
#        div.show("slide", direction: "up", "slow")
