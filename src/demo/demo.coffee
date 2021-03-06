Backbone.sync = (method, model, options) ->
  model.set(id: _.random(0, 1000)) unless model.has('id')

  success = _.debounce(options.success, 100)
  success(model, null, options)

  model

appController = new Admin.ApplicationController()

#= modules/commons.coffee
#= modules/books.coffee
#= modules/fruits.coffee

NavigationView = class extends Admin.NavigationView
  applicationController: appController
  el: ".menu"

Region = class extends Marionette.Region
  el: ".content"

$(document).ready ->
  new NavigationView()

  appController.registerRegion("mainRegion", new Region())

  appController.start()