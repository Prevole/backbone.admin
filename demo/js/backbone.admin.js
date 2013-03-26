
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
    var Action, ActionFactory, Admin, applicationStarted, authorizator, i18nKeys, initialized, moduleNamePattern;
    Admin = {
      version: "0.0.1"
    };
    applicationStarted = false;
    initialized = false;
    moduleNamePattern = new RegExp(/[a-z]+(:[a-z]+)*/);
    authorizator = null;
    Action = (function() {

      _Class.prototype.module = null;

      _Class.prototype.actionName = "main";

      _Class.prototype.options = {};

      _Class.prototype.isRoutable = false;

      function _Class(isRoutable, module, actionName, options) {
        this.isRoutable = isRoutable;
        this.module = module;
        if (this.module === void 0) {
          throw new Error("The module must be defined");
        }
        this.moduleName = this.module.name;
        if (actionName !== void 0) {
          this.actionName = actionName;
        }
        if (options !== void 0) {
          this.options = options;
        }
      }

      _Class.prototype.path = function() {
        var key, path, value, _ref;
        if (this.module.routableActions[this.actionName] === void 0) {
          return;
        }
        path = this.module.routableActions[this.actionName];
        _ref = this.options;
        for (key in _ref) {
          value = _ref[key];
          path = path.replace(":" + key, value);
        }
        return path;
      };

      return _Class;

    })();
    ActionFactory = new ((function() {

      function _Class() {}

      _Class.prototype.routableAction = function(module, actionName, options) {
        return new Action(true, module, actionName, options);
      };

      _Class.prototype.action = function(module, actionName, options) {
        return new Action(false, module, actionName, options);
      };

      _Class.prototype.outsideAction = function(changeRoute, module, actionName, options) {
        if (changeRoute) {
          return this.routableAction(module, actionName, options);
        } else {
          return this.action(module, actionName, options);
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
      var actionFromOutside, actionFromRouter;

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
        this.on("action:name", function(actionName, changeRoute, parameters) {
          return actionFromOutside.call(_this, actionName, changeRoute, parameters);
        });
        this.on("action:done", this.actionDone);
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
        var action, actionParts, module;
        actionParts = actionName.split(":");
        module = this.modules[actionParts[0]];
        action = actionParts[1] === void 0 ? "main" : actionParts[1];
        if (module !== void 0) {
          return this.action(ActionFactory.outsideAction(changeRoute, module, action, options));
        }
      };

      actionFromRouter = function(actionName, options) {
        var action, actionParts, module;
        actionParts = actionName.split(":");
        module = this.modules[actionParts[0]];
        action = actionParts[1] === void 0 ? "main" : actionParts[1];
        if (module !== void 0) {
          return this.action(ActionFactory.action(module, action, options));
        }
      };

      _Class.prototype.action = function(action) {
        var key, result, _i, _len, _ref;
        result = action.module[action.actionName](action.options);
        _ref = _.keys(result);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          if (this[key] !== void 0) {
            this[key].show(result[key]);
          }
        }
        return this.trigger("action:done", action);
      };

      _Class.prototype.actionDone = function(action) {
        if (!_.isNull(this.router) && action.isRoutable) {
          return this.router.navigate(action.path());
        }
      };

      /*
      Allow to register a module. When this function is called, the action that can be routed
      are gathered and registered in the `ApplicationController` router. Validations are done
      to enforce that the module is valid
        
      @param {Backbone.Admin.Module} module The module to register
      */


      _Class.prototype.registerModule = function(module) {
        var actionName, actions, moduleActionName, path;
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
        actions = _.chain(module.routableActions).pairs().sortBy(1).object().value();
        if (!_.isNull(this.router)) {
          for (actionName in actions) {
            path = actions[actionName];
            moduleActionName = "" + module.name + ":" + actionName;
            this.router.route(path, moduleActionName);
          }
        }
        return this.listenTo(module, "action", this.action);
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
        return this.applicationController.trigger("action:name", $(event.target).attr("data-action"), true);
      };

      return _Class;

    })(Marionette.View);
    Admin.Module = Marionette.Controller.extend({
      initialize: function(options) {
        if (this.name === void 0) {
          throw new Error("The name of the module must be defined");
        }
        if (this.routableActions === void 0) {
          throw new Error("At least one routable action must be defined");
        }
        if (this.baseUrl === void 0) {
          return this.baseUrl = "/" + (this.name.replace(/:/g, "/"));
        }
      },
      routableAction: function(actionName, pathParameters, options) {
        return this.trigger("action", ActionFactory.routableAction(this, actionName, pathParameters), options);
      },
      action: function(actionName, options) {
        return this.trigger("action", ActionFactory.action(this, actionName), options);
      }
    });
    Admin.CrudModule = Admin.Module.extend({
      initialize: function(options) {
        this["super"](options);
        if (this.collection === void 0) {
          throw new Error("The collection must be specified");
        }
        if (this.model === void 0 && !(this.collection.prototype.model === void 0)) {
          this.model = this.collection.prototype.model;
        }
        if (this.model === void 0) {
          throw new Error("The model must be specified");
        }
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
    Admin.StatedCollection = Backbone.Collection.extend({
      initialize: function(options) {
        return this.current = _.defaults({}, {
          page: 1,
          ipp: 2,
          quickSearch: "",
          sorting: {}
        });
      },
      sync: function(method, model, options) {
        var queryOptions, storedSuccess,
          _this = this;
        storedSuccess = options.success;
        options.success = function(collection, response) {
          storedSuccess(collection, response);
          return _this.trigger("fetched");
        };
        queryOptions = _.extend({}, {
          jsonpCallback: 'callback',
          timeout: 25000,
          cache: false,
          type: 'GET',
          dataType: 'json',
          processData: false,
          url: this.url,
          headers: {
            "X-Grid-Parameters": JSON.stringify(this.current)
          }
        }, options);
        return $.ajax(queryOptions);
      },
      parse: function(response, xhr) {
        var info;
        info = response.info;
        this.current.records = info.records;
        this.current.pages = info.pages;
        this.current.filteredRecords = info.filteredRecords;
        this.current.filteredPages = info.filteredPages;
        this.current.from = (this.current.page - 1) * this.current.ipp + 1;
        this.current.to = this.current.from + this.current.ipp - 1;
        if (this.current.to > this.current.filteredRecords) {
          this.current.to = this.current.filteredRecords;
        }
        if (this.current.page > this.current.filteredPages && this.current.filteredPages > 0) {
          this.current.page = this.current.filteredPages;
          this.fetch();
        }
        return response.data;
      },
      refresh: function() {
        this.reset();
        return this.fetch();
      },
      getInfo: function() {
        return this.current;
      },
      updateInfo: function(options) {
        this.current = _.defaults(options, this.current);
        return this.fetch();
      }
    });
    Admin.instanciateModule = function(options) {
      var module;
      if (applicationStarted) {
        throw new Error("Application already started, it is not possible to register more modules.");
      } else {
        module = new ModuleController(options);
        return mainController.registerModule(module);
      }
    };
    Admin.init = function(options) {
      initialized = true;
      options = options || {};
      if (options.authorizator) {
        return authorizator = new options.authorizator();
      } else {
        return authorizator = new Admin.Authorizator();
      }
    };
    Admin.start = function(options) {
      var CRUDApplication, mainRegion, navigationViewClass, router, switchModule;
      if (!initialized) {
        Admin.init();
      }
      applicationStarted = true;
      if (options === void 0) {
        throw new Error("No option defined when some are required.");
      }
      if (options.mainRegion === void 0) {
        mainRegion = Admin.MainRegion;
      } else {
        mainRegion = options.mainRegion;
      }
      if (options.navigationView != null) {
        navigationViewClass = options.navigationView;
      } else {
        navigationViewClass = Admin.NavigationView;
      }
      router = new Backbone.Router();
      switchModule = function(moduleName) {
        router.route(moduleName, moduleName, function() {
          return alert(moduleName);
        });
        return router.navigate(moduleName, {
          trigger: true
        });
      };
      CRUDApplication = new Marionette.Application();
      CRUDApplication.on("initialize:after", function() {
        return Backbone.history.start({
          pushState: true
        });
      });
      gvent.on("changeView", function(view) {
        return CRUDApplication.mainRegion.show(view);
      });
      CRUDApplication.addInitializer(function() {
        var navigationView;
        navigationView = new navigationViewClass();
        navigationView.on("navigate:switchModule", switchModule);
        return this.addRegions({
          mainRegion: mainRegion
        });
      });
      return CRUDApplication.start();
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
