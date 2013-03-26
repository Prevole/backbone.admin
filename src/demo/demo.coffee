#NavigationView = class extends Admin.NavigationView
#  el: ".menu"
#
#  events:
#    "click a": "handleClick"
#
#  # Handle click on menu item
#  # @param [Event] event The event
#  handleClick: (event) ->
#    event.preventDefault()
#    @switchModule $(event.target).attr("data-module")
#
## Region that implements a transitional change of views
#MainRegion = class extends Backbone.Marionette.Region
#  el: ".content"
#
#  # Open
#  # @param [Backbone.View] view The view to open
#  open: (view) ->
#    @$el.html view.el
#    @$el.show "slide", { direction: "left" }, 1000, =>
#      view.trigger "transition:open"
#
#  # Show
#  # @param [Backbone.View] view The view to show
#  show: (view) ->
#    if @$el
#      $(@el).hide "slide", { direction: "left" }, 1000, =>
#        view.trigger "transition:show"
#        super view
#    else
#      super view

#$(document).ready ->
#  Admin.start(
#    navigationView: NavigationView
#    mainRegion: MainRegion
#  )

#Layout2 = class extends Marionette.Layout
##  el: ".content2"
#  template: "#test",
#
#  regions:
#    a1:
#      selector: "#a1"
#      regionType: class extends Marionette.Region
#    a2:
#      selector: "#a2"
#      regionType: class extends Marionette.Region



#    Test = Backbone.View.extend
##      el: ".content"
#
#      render: ->
#        $(@el).text("Fruits: #{Date.now()}")
#
#    Test2 = Backbone.View.extend
#      render: ->
#        $(@el).text("Vegetables: #{Date.now()}")
#
#     {
#      r2: new Test2()
#    }
#    r2: new Layout2()

appController = new Admin.ApplicationController()

#= modules/commons.coffee
#= modules/books.coffee
#= modules/fruits.coffee

NavigationView = class extends Admin.NavigationView
  applicationController: appController
  el: ".menu"

Region1 = class extends Marionette.Region
  el: ".content1"

Region2 = class extends Marionette.Region
  el: ".content2"

$(document).ready ->
  new NavigationView()

  appController.registerRegion("r1", new Region1())
  appController.registerRegion("r2", new Region2())

  appController.start()