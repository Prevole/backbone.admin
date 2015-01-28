/*
 * Backbone.Admin - v0.0.9
 * Copyright (c) 2014-01-07 Laurent Prevost (prevole) <prevole@prevole.ch>
 * Distributed under MIT license
 * https://github.com/prevole/backbone.admin
 */

/*
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
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Backbone.Admin = window.Admin = (function(Backbone, Marionette, _, $) {
    var Action, ActionFactory, Admin, authorizator, i18nKeys;
    Admin = {
      version: "0.0.9"
    };
    authorizator = null;
    _.mixin({
      /*
      From a simple view object, create a complex object
      like: `{view: viewObject}`
        
      @param {Object} view The view to wrap into an object
      @return {Object} The view wrapped in an object
      */

      wrapView: function(view) {
        return _.object(["view"], [view]);
      },
      retrieveModel: function(collection, action) {
        if (action === void 0) {
          throw new Error("Action must be defined");
        }
        if (action.options === void 0) {
          throw new Error("Options in action must be defined");
        }
        if (action.options.model === void 0) {
          return collection.get(action.options.id);
        } else {
          return action.options.model;
        }
      },
      slice: Function.prototype.call.bind(Array.prototype.slice)
    });
    Action = (function() {

      function _Class(isRoutable, module, name, options) {
        if (module === void 0) {
          throw new Error("The module must be defined");
        }
        this.module = module || null;
        this.moduleName = this.module.name;
        this.name = name || "main";
        this.options = options || {};
        this.isRoutable = isRoutable || false;
        this.updatedRegions = {};
      }

      _Class.prototype.route = function() {
        var key, route, value, _ref;
        if (this.module.routeActions[this.name] === void 0) {
          return;
        }
        route = this.module.route(this.name);
        _ref = this.options;
        for (key in _ref) {
          value = _ref[key];
          route = route.replace(":" + key, value);
        }
        return route;
      };

      return _Class;

    })();
    ActionFactory = new ((function() {

      function _Class() {}

      _Class.prototype.action = function(module, name, options) {
        return new Action(false, module, name, options);
      };

      _Class.prototype.routeAction = function(module, name, options) {
        return new Action(true, module, name, options);
      };

      _Class.prototype.outsideAction = function(changeRoute, module, name, options) {
        if (changeRoute) {
          return this.routeAction(module, name, options);
        } else {
          return this.action(module, name, options);
        }
      };

      return _Class;

    })())();
    /*
    ## Admin.ApplicationController
    
    The `application controller` manage the different module of the application
    to offer the one page application experience.
    
    The routes are gather from the different modules to manage the browser history
    and the actions related to the modules.
    */

    Admin.ApplicationController = (function() {
      var action, actionExecuted, actionFromOutside, actionFromRouter;

      _Class.prototype.initializers = new Marionette.Callbacks();

      _Class.prototype.triggerMethod = Marionette.triggerMethod;

      _Class.prototype.modules = {};

      _Class.prototype.regionNames = [];

      _Class.prototype.router = null;

      _Class.prototype.started = false;

      /*
      Constructor
        
      @param {Object} options The options to configure the application controller. Recognized options:
        
      ```
      options:
        		router: Boolean | Router class | Router instance
      ```
        
      - `router`: Could be a boolean to enable or disable the router. Could be a class to instanciate a new router or
      could be an instanciated router.
      */


      function _Class(options) {
        var _this = this;
        _.extend(this, Backbone.Events);
        options = _.defaults(options || {}, {
          router: Backbone.Router
        });
        if (_.isBoolean(options.router) && options.router) {
          this.router = new Backbone.Router();
        } else if (_.isFunction(options.router)) {
          this.router = new options.router(options);
        } else {
          this.router = options.router;
        }
        this.on("action:outside:route", function(actionName, parameters) {
          return actionFromOutside.call(_this, actionName, true, parameters);
        });
        this.on("action:outside:noroute", function(actionName, parameters) {
          return actionFromOutside.call(_this, actionName, false, parameters);
        });
        if (!_.isNull(this.router)) {
          this.listenTo(this.router, "route", function(actionName, options) {
            return actionFromRouter.call(_this, actionName, options);
          });
        }
      }

      /*
      Add an initializer to execute when the application will start
        
      @param {Function} initializer The initializer to add
      */


      _Class.prototype.addInitializer = function(initializer) {
        return this.initializers.add(initializer);
      };

      /*
      Like the `Marionette.Application.start(options)`, this method
      start the `ApplicationController`.
        
      @param {Object} options The options given to every initializer
      */


      _Class.prototype.start = function(options) {
        if (this.started) {
          return console.log("Application controller already started.");
        } else {
          this.triggerMethod("before:start", options);
          this.initializers.run(options, this);
          if (!(_.isNull(this.router) && !Backbone.history.started)) {
            Backbone.history.start({
              pushState: true
            });
          }
          return this.triggerMethod("after:start", options);
        }
      };

      /*
      Manage an action from the outside of the application controller or any of the modules
      in the application controller.
        
      For example, a navigation bar can trigger an action like ´<moduleName>:<actionName>´ and this
      method will retrieve the module and the action to run. Once done, an `Admin.Action` is created
      to represent the action to run.
        
      @param {String} actionName The name of the action with the format: `<moduleName>:<actionName>`
      @param {Boolean} changeRoute Define if the route in the navigation bar must change or not
      @param {Object} options A set of options to complete the path in the navigation bar
                              and/or used by the action execution
      */


      actionFromOutside = function(actionName, changeRoute, options) {
        var actionMethod, actionParts, module;
        actionParts = actionName.split(":");
        module = this.modules[actionParts[0]];
        actionMethod = actionParts[1] === void 0 ? "main" : actionParts[1];
        if (module !== void 0) {
          return action.call(this, ActionFactory.outsideAction(changeRoute, module, actionMethod, options));
        }
      };

      /*
      Manage an action triggered by `Backbone.History` events. This kind of action
      required to execute an action from a module but not to change the route in
      the navigation bar. The navigation bar is already up to date.
        
      The action name correspond to the route name regisered in the `Backbone.Router`
      object and the options is an array corresponding to the parameters contained in
      the `URL`.
        
      When it's possible, the options given to the action are mapped to parameter names
      if there are some matching. The remaining option, are given in an array inside the
      `options` object. The name associated to these remainings options is: ´_params´
        
      @param {String} actionName The name of the action with the format: `<moduleName>.<actionName>`
      @param {Array} options The list of options from the `URL`
      */


      actionFromRouter = function(actionName, options) {
        var actionMethod, actionParts, index, module, namedOptions, parameterName, parameterNames, route, _i, _ref;
        actionParts = actionName.split(":");
        module = this.modules[actionParts[0]];
        actionMethod = actionParts[1] === void 0 ? "main" : actionParts[1];
        if (module !== void 0) {
          namedOptions = {};
          route = module.route(actionMethod);
          if (route !== void 0) {
            parameterNames = route.match(/(\(\?)?:\w+/g);
            if (!_.isNull(parameterNames)) {
              for (index = _i = 0, _ref = parameterNames.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; index = 0 <= _ref ? ++_i : --_i) {
                parameterName = parameterNames[index].slice(1);
                namedOptions[parameterName] = options[index];
                options[index] = null;
              }
            }
          }
          namedOptions["_params"] = _.filter(options, function(value) {
            return !_.isNull(value);
          });
          return action.call(this, ActionFactory.action(module, actionMethod, namedOptions));
        }
      };

      action = function(action) {
        if (!(action === void 0 || action.module === void 0)) {
          return action.module.trigger("action:execute", action);
        }
      };

      actionExecuted = function(action) {
        var key, _i, _len, _ref;
        if (!_.isNull(action.updatedRegions)) {
          _ref = _.keys(action.updatedRegions);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            if (this[key] !== void 0) {
              this[key].close();
              this[key].show(action.updatedRegions[key].view);
            }
          }
          if (!_.isNull(this.router) && action.isRoutable) {
            return this.router.navigate(action.route());
          }
        }
      };

      /*
      Allow to register a module. When this function is called, the action that can be routed
      are gathered and registered in the `ApplicationController` router. Validations are done
      to enforce that the module is valid
        
      @param {Backbone.Admin.Module} module The module to register
      */


      _Class.prototype.registerModule = function(module) {
        var actionName, path, _ref,
          _this = this;
        if (module === void 0) {
          throw new Error("The module cannot be undefined");
        }
        if (!(module instanceof Admin.Module)) {
          throw new Error("The module must be from Admin.Module type");
        }
        if (this.modules[module.name] !== void 0) {
          throw new Error("The module is already registered");
        }
        this.modules[module.name] = module;
        if (!_.isNull(this.router)) {
          _ref = module.routes();
          for (actionName in _ref) {
            path = _ref[actionName];
            this.router.route(path, "" + module.name + ":" + actionName);
          }
        }
        this.listenTo(module, "action:module", function(moduleAction) {
          return action.call(_this, moduleAction);
        });
        return this.listenTo(module, "action:executed", function(moduleAction) {
          return actionExecuted.call(_this, moduleAction);
        });
      };

      _Class.prototype.registerRegion = function(name, region) {
        if (this[name] !== void 0) {
          throw new Error("The region " + name + " is already registered");
        }
        this[name] = region;
        return this.regionNames.push(name);
      };

      return _Class;

    })();
    Admin.NavigationView = (function(_super) {

      __extends(_Class, _super);

      function _Class() {
        return _Class.__super__.constructor.apply(this, arguments);
      }

      _Class.prototype.events = {
        "click [data-action]": "action"
      };

      _Class.prototype.initialize = function(options) {
        if (this.applicationController === void 0) {
          if (options.applicationController === void 0) {
            throw new Error("An application controller must be defined");
          } else {
            return this.applicationController = options.applicationController;
          }
        }
      };

      _Class.prototype.action = function(event) {
        event.preventDefault();
        return this.applicationController.trigger("action:outside:route", $(event.target).attr("data-action"));
      };

      return _Class;

    })(Marionette.View);
    Admin.Module = Marionette.Controller.extend({
      constructor: function() {
        Marionette.Controller.prototype.constructor.apply(this, _.slice(arguments));
        if (this.name === void 0) {
          throw new Error('The name of the module must be defined');
        }
        if (this.routeActions === void 0) {
          throw new Error('At least one route action must be defined');
        }
        if (this.basePath === void 0) {
          this.basePath = "" + (this.name.replace(/:/g, '/'));
        }
        this.basePath = _.str.endsWith(this.basePath, '/') ? this.basePath : "" + this.basePath + "/";
        this.on('action:route', function(actionName, pathParameters, options) {
          return this.trigger('action:module', ActionFactory.routeAction(this, actionName, pathParameters), options);
        });
        this.on('action:noroute', function(actionName, options) {
          return this.trigger('action:module', ActionFactory.action(this, actionName, options));
        });
        return this.on('action:execute', function(action) {
          this.triggerMethod("action:" + action.name, action);
          return this.trigger('action:executed', action);
        });
      },
      routes: function() {
        var fReduce,
          _this = this;
        fReduce = function(memo, value, key) {
          memo[key] = _this.route(key);
          return memo;
        };
        return _.chain(_.reduce(this.routeActions, fReduce, {})).pairs().sortBy(1).object().value();
      },
      route: function(actionName) {
        var route;
        route = this.routeActions[actionName];
        if (route === '') {
          return _.str.rtrim(this.basePath, '/');
        } else {
          return "" + this.basePath + (_.str.ltrim(route, '/'));
        }
      }
    });
    /*
    ## Admin.CrudModule
    
    Default implementation of `CRUD` module. The four main actions are define like this:
    
    - `Create`: Create action for the creation of new records
    - `Read`: List of the records
    - `Update`: Edition of any existing record
    - `Delete`: Deletion of any existing record
    
    For the `Create`, `Read` and `Update` actions, they are supposed to be backed by an `URL` that exists and
    that could be called at any time. The purpose is to offer the possibility to bookmark the page.
    
    In the case of `Delete` action, it's a little different. Once a record is deleted, the resource is no more
    existing and then the `Delete` cannot be called twice. In consequence, the `Delete` action is not expected
    to have an `URL` that we could calle twice. It's more supposed to be handled by a confirmation popup or
    something equivalent.
    */

    Admin.CrudModule = Admin.Module.extend({
      /*
      Constructor
        
      ```
      # Options
      options:
        collection:
        model:
        views:
        
      ```
      - **collection**: The collection that is managed by the module
      - **model**: The model is mandatory if the collection does not contain one
      - **views**: A list of views managed by the `CRUD` module. The views exptect to contain the following
        ```
        # Minimum views
        views:
          main:
            view: ListViewClass
            region: "regionToShowTheListView"
          create:
            view: CreateViewClass
            region: "regionToShowTheCreateView"
          edit:
            view: EditViewClass
            region: "regionToShowTheEditView"
          delete:
            view: DeleteViewClass
        ```
        
        - **main**: Correspond to the principal view and acts as entry point for the module
        - **create**: Allows creating new records
        - **edit**: Allows editing existing records
        - **delete**: Allows deleting existing views. As it's expected to be something like a popup, no region is required.
        
      @params {Object} options A list of options
      */

      constructor: function(options) {
        Admin.Module.prototype.constructor.apply(this, _.slice(arguments));
        if (this.collection === void 0) {
          throw new Error('The collection must be specified');
        }
        if (_.isFunction(this.collection)) {
          if (this.model === void 0 && !(this.collection.prototype.model === void 0)) {
            this.model = this.collection.prototype.model;
          }
        } else {
          this.model = this.collection.model;
        }
        if (this.model === void 0) {
          throw new Error('The model must be specified');
        }
        if (this.views === void 0) {
          throw new Error('Views must be defined');
        }
      },
      /*
      Execution of the main action
        
      @param {Admin.Action} action The action to enrich
      @return {Admin.Action} The action updated
      */

      onActionMain: function(action) {
        var view;
        view = new this.views.main.view;
        this.listenTo(view, 'new', function() {
          return this.trigger('action:route', 'create');
        });
        this.listenTo(view, 'edit', function(model) {
          return this.trigger('action:route', 'edit', {
            id: model.get('id')
          }, {
            model: model
          });
        });
        this.listenTo(view, 'delete', function(model) {
          return this.trigger('action:noroute', 'delete', {
            model: model
          });
        });
        return action.updatedRegions[this.views.main.region] = _.wrapView(view);
      },
      /*
      Execution of the create action
        
      @see The documentation of `_createOrEditAction` function
      @param {Admin.Action} The action to enrich
      @return {Admin.Action} The action updated
      */

      onActionCreate: function(action) {
        return this._createOrEditAction('create', action, new this.collection.model({}, {
          url: this.collection.url
        }));
      },
      /*
      Execute the model creation from the data retrieved from the create view
        
      @see The documentation of `_saveOrCreate` function
      @param {Backbone.Model} model The model to create or update
      @param {Object} modelAttributes The attributes to set to the model
      @return {Boolean} True if the client validation succeed, failed otherwise
      */

      onCreate: function(model, modelAttributes) {
        return this._saveOrCreate('create', model, modelAttributes);
      },
      /*
      Function called when a `Backbone.Model` has been successfully created
      and synced with the backend.
        
      @param {Backbone.Model} model The model successfully created
      @param {Object} response The response from the backend
      @param {Object} options The options given when the model is created
      */

      onCreateSuccess: function(model, response, options) {
        this.trigger('created', model);
        return this.trigger('action:route', 'main');
      },
      /*
      Function called when a `Backbone.Model` cannot be created and the
      backend returned an error
        
      @param {Backbone.Model} model The model in error
      @param {Xhr} xhr The request object with the response
      @param {Object} options The options given when the model is created
      */

      onCreateError: function(model, xhr, options) {
        return console.log("Unable to create the model on the backend. Implement the error handler there.");
      },
      /*
      Execution of the edition action
        
      @see The documentation of `_createOrEditAction` function
      @param {Admin.Action} The action to enrich
      @return {Admin.Action} The action updated
      */

      onActionEdit: function(action) {
        return this._createOrEditAction('edit', action, _.retrieveModel(this.collection, action));
      },
      /*
      Execute the model edition from the data retrieved from the edit view
        
      @see The documentation of `_saveOrCreate` function
      @param {Backbone.Model} model The model to create or update
      @param {Object} modelAttributes The attributes to set to the model
      @return {Boolean} True if the client validation succeed, failed otherwise
      */

      onEdit: function(model, modelAttributes) {
        return this._saveOrCreate('edit', model, modelAttributes);
      },
      /*
      Function called when a `Backbone.Model` has been successfully saved
      and synced with the backend.
        
      @param {Backbone.Model} model The model successfully edited
      @param {Object} response The response from the backend
      @param {Object} options The options given when the model is edited
      */

      onEditSuccess: function(model, response, options) {
        this.trigger('edited', model);
        return this.trigger('action:route', 'main');
      },
      /*
      Function called when a `Backbone.Model` cannot be saved and the
      backend returned an error
        
      @param {Backbone.Model} model The model in error
      @param {Xhr} xhr The request object with the response
      @param {Object} options The options given when the model is edited
      */

      onEditError: function(model, xhr, options) {
        return console.log("Unable to update the model on the backend. Implement the error handler there.");
      },
      /*
      Execution of the deletion action.
        
      @param {Admin.Action} The action to enrich
      */

      onActionDelete: function(action) {
        var view,
          _this = this;
        view = new this.views["delete"].view({
          model: _.retrieveModel(this.collection, action)
        });
        this.listenTo(view, 'delete', function(model) {
          return _this.triggerMethod('delete', model);
        });
        view.render();
      },
      /*
      Execute the model deletion of the model
        
      By default, the deletion is done through `Backbone.Model.destroy` which
      delete the model, clear the model from the collection and also run the
      `sync` function to propagate the deletion to the backend.
        
      The `Backbone.Model.destroy` function is called with the `options` enriched by
      `success(model, response, options)`, `error(model, xhr, options)`. If these options
      are already provided, they will be overriden.
        
      To use the `success` and `error` callbacks, you must override the functions
      `onDeleteSuccess` and `onDeleteError`. These functions are called in the
      `success` and `error` function givent to the `save` options.
        
      To use custom options with the `destroy` function, you can define
      a `hash` or a `function` called `deleteOptions` on the `CRUD` module.
        
      The `sync` function from the model is then used to propagate the
      deletion to the backend.
        
      @param {Backbone.Model} model The model to delete
      @return {Backbone.Model} The model deleted
      */

      onDelete: function(model) {
        var options,
          _this = this;
        options = _.result(this, 'deleteOptions') || {};
        return model.destroy(_.extend(options, {
          success: function(model, response, options) {
            return _this.triggerMethod('delete:success', model, response, options);
          },
          error: function(model, xhr, options) {
            return _this.triggerMethod('delete:error', model, xhr, options);
          }
        }));
      },
      /*
      Function called when a `Backbone.Model` has been successfully removed
      on the backend.
        
      @param {Backbone.Model} model The model successfully destroyed
      @param {Object} response The response from the backend
      @param {Object} options The options given when the model is destroyed
      */

      onDeleteSuccess: function(model, response, options) {
        return this.trigger('deleted', model);
      },
      /*
      Function called when a `Backbone.Model` cannot be removed and the
      backend returned an error
        
      @param {Backbone.Model} model The model in error
      @param {Xhr} xhr The request object with the response
      @param {Object} options The options given when the model is destroyed
      */

      onDeleteError: function(model, xhr, options) {
        return console.log("Unable to delete the model on the backend. Implement the error handler there.");
      },
      /*
      Create or edit action handling. Create the proper view, set the
      model, add the right listeners to handle the validation errors if
      any `error` function is defined on the view.
        
      Also bind the action of creation or edition on the view to trigger
      the realization of the action (saving the attributes).
        
      And finally, prepare the region to update.
        
      @param {String} actionType The action type of the operation
      @param {Admin.Action} action The action to update
      @param {Backbone.Model} model The model to handle in the operation
      @return {Admin.Action} The action updated
      */

      _createOrEditAction: function(actionType, action, model) {
        var view,
          _this = this;
        view = new this.views[actionType].view({
          model: model
        });
        if (view.error) {
          view.listenTo(model, "invalid", view.error);
        }
        this.listenTo(view, actionType, function(modelAttributes) {
          return _this.triggerMethod(actionType, view.model, modelAttributes);
        });
        return action.updatedRegions[this.views[actionType].region] = _.wrapView(view);
      },
      /*
      Save or create a new model by setting the attributes after they are validated
        
      By default, the create or update is done through a call to `Backbone.Model.set` with the
      attributes given and force the `validate` option to be `true` to ensure the validation
      is done during the `set` function call. The client side validation can be handled by this.
      The `model` will only be saved if the validation (client and server) is ok.
        
      The `Backbone.Model.save` function is called with the `options` enriched by
      `success(model, response, options)`, `error(model, xhr, options)` and `validate = false`.
      If these options are already provided, they will be overriden.
        
      To use the `success` and `error` callbacks, you must override the functions
      `on(Create|Edit)Success` and `on(Create|Edit)Error`. These functions are called in the
      `success` and `error` function given to the `save` options.
        
      The `validate` option set to `false` for the `save` function avoid double
      validation. Since the validation is already done in the `set` function.
        
      To use custom options with the `save` and `validate` functions, you can define
      a `hash` or a `function` called `(create|edit)Options` on the `CRUD` module.
        
      The `sync` function from the model is then used to propagate the creation
      or edition to the backend.
        
      @param {String} action The action type of the operation (create or edit)
      @param {Backbone.Model} model The model to create or update
      @param {Object} modelAttributes The attributes to set to the model
      @return {Boolean} True if the client validation succeed, failed otherwise
      */

      _saveOrCreate: function(action, model, modelAttributes) {
        var options,
          _this = this;
        options = _.extend(_.result(this, "" + action + "Options") || {}, {
          validate: true
        });
        if (model.set(modelAttributes, options)) {
          return model.save(null, _.extend(options, {
            validate: false,
            success: function(model, response, options) {
              return _this.triggerMethod("" + action + ":success", model, response, options);
            },
            error: function(model, xhr, options) {
              return _this.triggerMethod("" + action + ":error", model, xhr, options);
            }
          }));
        } else {
          return false;
        }
      }
    });
    /*
    ## Admin.FormView
    
    Represent the basic form to handle creation and/or edition
    of a model. Automatically bind events for `create` or `edit`
    */

    Admin.FormView = Backbone.Marionette.ItemView.extend({
      events: {
        'click .create': 'create',
        'click .edit': 'edit'
      },
      /*
      Enforce a way to retrieve the forms values to set to a model.
        
      By default, this function raise an error. You should override
      this function.
        
      @return {Object} The model attributes that a model can use
      */

      modelAttributes: function() {
        throw new Error('Missing method modelAttributes().');
      },
      /*
      Handle the create event from the form
        
      If an `onBeforeCreate` exists, it will be call. The result should
      be evaluable as `boolean` expression.
        
      @param {Event} event The form event raised to create a model
      */

      create: function(event) {
        var beforeCreateResult;
        event.preventDefault();
        beforeCreateResult = this.triggerMethod('before:create', event);
        if (_.isUndefined(beforeCreateResult) || beforeCreateResult) {
          return this.trigger('create', this.modelAttributes());
        }
      },
      /*
      Handle the update event from the form
        
      @param {Event} event The form event raised to update a model
      */

      edit: function(event) {
        var beforeEditResult;
        event.preventDefault();
        beforeEditResult = this.triggerMethod('before:edit', event);
        if (_.isUndefined(beforeEditResult) || beforeEditResult) {
          return this.trigger('edit', this.modelAttributes());
        }
      },
      /*
      Give a way to manage the validation errors from the model
      to the view.
        
      By default, this function does nothing. You can override it
      if you want to handle the errors properly. They are silently
      ignored by default.
        
      @param {Backbone.Model} model The model that contains error
      @param {Object} error The validation errors
      @param {Object} options The options used to sync the creation or edition
      */

      error: function(model, error, options) {}
    });
    Admin.DeleteView = Marionette.ItemView.extend({
      events: {
        "click .no": "no",
        "click .yes": "yes"
      },
      initialize: function(options) {
        if (options === void 0 || options.model === void 0) {
          throw new Error("No model given for the delete view when it is mandatory");
        }
      },
      no: function(event) {
        event.preventDefault();
        return this.triggerMethod("no", event);
      },
      yes: function(event) {
        event.preventDefault();
        this.triggerMethod("yes", event);
        return this.trigger("delete", this.model);
      }
    });
    Admin.MainRegion = (function(_super) {

      __extends(_Class, _super);

      function _Class() {
        return _Class.__super__.constructor.apply(this, arguments);
      }

      _Class.prototype.el = ".content";

      return _Class;

    })(Marionette.Region);
    /*
    Defaults i18nKeys used in the translations if `i18n-js` is used.
    
    You can provide your own i18n keys to match your structure.
    */

    i18nKeys = {
      info: "datagrid.info",
      pager: {
        first: "datagrid.pager.first",
        last: "datagrid.pager.last",
        next: "datagrid.pager.next",
        previous: "datagrid.pager.previous",
        filler: "datagrid.pager.filler"
      }
    };
    /*
    Helper function to define part or all the i18n keys
    you want override for all your grids.
    
    The options are combined with the default ones defined
    by the plugin. Your i18n keys will override the ones
    from the plugins.
    
    @param {Object} options The i18n keys definition
    */

    Admin.setupDefaultI18nBindings = function(options) {
      return i18nKeys = _.defaults(options.i18n || {}, i18nKeys);
    };
    Admin.can = function(action, subject) {
      return authorizator.can(action, subject);
    };
    Admin.cannot = function(action, subject) {
      return authorizator.cannot(action, subject);
    };
    return Admin;
  })(Backbone, Backbone.Marionette, _, $ || window.jQuery || window.Zepto || window.ender);

}).call(this);
