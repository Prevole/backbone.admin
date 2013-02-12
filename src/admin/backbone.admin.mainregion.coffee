  # Region that implements a transitional change of views
  Admin.MainRegion = class extends Marionette.Region
    el: ".content"

    # Open
    # @param [Backbone.View] view The view to open
    open: (view) ->
     @$el.html view.el
     @$el.show "slide", { direction: "up" }, 1000, =>
       view.trigger "transition:open"

    # Show
    # @param [Backbone.View] view The view to show
    show: (view) ->
     if @$el
       $(@el).hide "slide", { direction: "up" }, 1000, =>
         view.trigger "transition:show"
         super view
     else
       super view
