###
Backbone.Admin
==============

The `Backbone.Admin` framework based one `Backbone` and `Backbone.Marionette` offers an easy way
to write client side `CRUD` application with a `REST` backend. But, the framework can be used to
write different modules than `CRUD`modules. Custom modules can be handle perfectly by the framework.

Dependencies:

- [jQuery 1.9.0](http://jquery.com)
- [JSON2 2011-10-19](http://www.JSON.org/json2.js)
- [Underscore 1.4.3](http://underscorejs.org)
- [Backbone 0.9.10](http://backbonejs.org)
- [Backbone.Marionette 1.0.0-rc3](http://github.com/marionettejs/backbone.marionette)
- [Backbone.Wreqr 0.1.0](http://github.com/marionettejs/backbone.wreqr)
- [Backbone.Babysitter 0.0.4](http://github.com/marionettejs/backbone.babysitter)

For the demo, the `Backbone.Dg` is used to render the grids

- [Backbone.Dg 0.0.1](http://github.com/prevole/backgone.dg)

By default, a `CRUD` module implementation is available with standards actions like `new`, `edit` and `delete`
operations. The `list` action is the `main` action that will be used by default when no action is specified.

The management of the browser history is done through the `Backbone.history` API. When the `Admin.ApplicationController`
is started, the `History` is also started. Each module registered will also register `routes` in a `Backbone.Router`
handled by the `Admin.ApplicationController`. By default, a `CRUD` module is bind to three `routes`:

- `<moduleName>`: which goes to the main action
- `<moduleName>/new`: which goes to the action that allows creating a new item
- `<moduleName>/edit/:id`: which goes to the edition action to update the item

These routes are `bookmarkable` and then can be reach through a the navigation bar of the browser. For the `delete`
action, this is not the same scenario. Once a record is deleted, the resource is no more available on the server and
then the route to reach should not be available anymore. This is the reason why there is no default route offered for
`delete` action.
###
window.Backbone.Admin = window.Admin = ( (Backbone, Marionette, _, $) ->
  Admin = { version: "0.0.1" }

  authorizator = null

  # backbone.admin.authorizator.coffee

  #= backbone.admin.mixin.coffee
  #= backbone.admin.action.coffee
  #= backbone.admin.actionfactory.coffee
  #= backbone.admin.appcontroller.coffee
  #= backbone.admin.navigationview.coffee
  #= backbone.admin.module.coffee
  #= backbone.admin.crudmodule.coffee
  #= backbone.admin.formview.coffee
  #= backbone.admin.deleteview.coffee

  #= backbone.admin.mainregion.coffee

  ###
  Defaults i18nKeys used in the translations if `i18n-js` is used.

  You can provide your own i18n keys to match your structure.
  ###
  i18nKeys =
    info: "datagrid.info"
    pager:
      first: "datagrid.pager.first"
      last: "datagrid.pager.last"
      next: "datagrid.pager.next"
      previous: "datagrid.pager.previous"
      filler: "datagrid.pager.filler"

  ###
  Helper function to define part or all the i18n keys
  you want override for all your grids.

  The options are combined with the default ones defined
  by the plugin. Your i18n keys will override the ones
  from the plugins.

  @param {Object} options The i18n keys definition
  ###
  Admin.setupDefaultI18nBindings = (options) ->
    i18nKeys = _.defaults(
      options.i18n || {},
      i18nKeys
    )

# ----------------------------------------------------------------------------------------------------------------------

  Admin.can = (action, subject) ->
    authorizator.can action, subject

  Admin.cannot = (action, subject) ->
    authorizator.cannot action, subject

  return Admin
)(Backbone, Backbone.Marionette, _, $ || window.jQuery || window.Zepto || window.ender)