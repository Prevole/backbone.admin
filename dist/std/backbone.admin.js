
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
    var Action, ActionFactory, Admin, applicationStarted, authorizator, gvent, i18nKeys, initialized, moduleNamePattern;
    Admin = {
      version: "0.0.1"
    };
    applicationStarted = false;
    initialized = false;
    moduleNamePattern = new RegExp(/[a-z]+(:[a-z]+)*/);
    gvent = new Marionette.EventAggregator();
    authorizator = null;
    Action = (function() {

      _Class.prototype.module = null;

      _Class.prototype.actionName = "main";

      _Class.prototype.pathParameters = {};

      _Class.prototype.isRoutable = false;

      function _Class(isRoutable, module, actionName, pathParameters) {
        this.isRoutable = isRoutable;
        this.module = module;
        if (this.module === void 0) {
          throw new Error("The module must be defined");
        }
        this.moduleName = this.module.name;
        if (actionName !== void 0) {
          this.actionName = actionName;
        }
        if (pathParameters !== void 0) {
          this.pathParameters = pathParameters;
        }
      }

      _Class.prototype.path = function() {
        var key, path, value, _ref;
        if (this.module.routableActions[this.actionName] === void 0) {
          return;
        }
        path = this.module.routableActions[this.actionName];
        _ref = this.pathParameters;
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

      _Class.prototype.routableAction = function(module, actionName, pathParameters) {
        return new Action(true, module, actionName, pathParameters);
      };

      _Class.prototype.action = function(module, actionName) {
        return new Action(false, module, actionName, {});
      };

      return _Class;

    })())();
    Admin.ApplicationController = (function() {

      _Class.prototype.modules = {};

      _Class.prototype.regionNames = [];

      _Class.prototype.router = new Backbone.Router();

      _Class.prototype.started = false;

      function _Class(application) {
        if (application === void 0) {
          throw new Error("An application must be defined");
        }
        if (!(application instanceof Marionette.Application)) {
          throw new Error("Application should be Marionnette.Application");
        }
        this.application = application;
        _.extend(this, Backbone.Events);
        this.on("action:done", this.actionDone);
        this.listenTo(this.router, "route", this.routedAction);
      }

      _Class.prototype.routedAction = function(action, params) {
        var actionParts, module;
        actionParts = action.split(":");
        module = this.modules[actionParts[0]];
        if (module === void 0) {
          return;
        }
        return this.action(ActionFactory.action(module, actionParts[1]), params);
      };

      _Class.prototype.routeAction = function(action, params) {
        var actionParts, module;
        actionParts = action.split(":");
        module = this.modules[actionParts[0]];
        if (module === void 0) {
          return;
        }
        return this.action(ActionFactory.routableAction(module, actionParts[1]), params);
      };

      _Class.prototype.action = function(action, options) {
        var key, name, result, _i, _j, _len, _len1, _ref, _ref1;
        result = action.module[action.actionName](options);
        _ref = this.regionNames;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          this.application[name].close();
        }
        _ref1 = _.keys(result);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          key = _ref1[_j];
          if (this.application[key] !== void 0) {
            this.application[key].show(result[key]);
          }
        }
        return this.trigger("action:done", action, options);
      };

      _Class.prototype.actionDone = function(action, options) {
        if (action.isRoutable) {
          return this.router.navigate(action.path());
        }
      };

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
        for (actionName in actions) {
          path = actions[actionName];
          moduleActionName = "" + module.name + ":" + actionName;
          this.router.route(path, moduleActionName);
        }
        return this.listenTo(module, "action", this.action);
      };

      _Class.prototype.registerRegion = function(name, region) {
        if (this.application[name] !== void 0) {
          throw new Error("The region " + name + " is already registered");
        }
        this.application[name] = region;
        return this.regionNames.push(name);
      };

      _Class.prototype.start = function() {
        if (this.started) {
          return console.log("Application controller already started.");
        } else {
          this.application.start();
          return Backbone.history.start({
            pushState: true
          });
        }
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

      _Class.prototype.action = function(event) {
        event.preventDefault();
        return this.trigger("action", $(event.target).attr("data-action"));
      };

      return _Class;

    })(Marionette.View);
    Admin.Module = (function() {
      var initGridLayoutClass;

      function _Class(options) {
        if (this.name === void 0) {
          throw new Error("The name of the module must be defined");
        }
        if (this.routableActions === void 0) {
          throw new Error("At least one routable action must be defined");
        }
        if (this.baseUrl === void 0) {
          this.baseUrl = "/" + (this.name.replace(/:/g, "/"));
        }
        _.extend(this, Backbone.Events);
      }

      _Class.prototype.routableAction = function(actionName, pathParameters, options) {
        return this.trigger("action", ActionFactory.routableAction(this, actionName, pathParameters), options);
      };

      _Class.prototype.action = function(actionName, options) {
        return this.trigger("action", ActionFactory.action(this, actionName), options);
      };

      initGridLayoutClass = function(gridLayoutClass) {};

      return _Class;

    })();
    Admin.CrudModule = (function(_super) {
      var initGridLayoutClass;

      __extends(_Class, _super);

      function _Class(options) {
        _Class.__super__.constructor.call(this, options);
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

      initGridLayoutClass = function(gridLayoutClass) {};

      return _Class;

    })(Admin.Module);
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
