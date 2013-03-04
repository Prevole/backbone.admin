/*
Datagrid
========

The Datagrid plugin for `Bacbkone` gives the possibility to implement
easily a data table into a `Bacbkone` application. It uses `Backbone.Marionette`
and its different views to reach the features of the data table.

Dependencies:

- [jQuery 1.8.2](http://jquery.com)
- [JSON2 2011-10-19](http://www.JSON.org/json2.js)
- [Underscore 1.4.2](http://underscorejs.org)
- [Backbone 0.9.2](http://backbonejs.org)
- [Backbone.Marionette 1.0.0-beta1](http://github.com/marionettejs/backbone.marionette)
- [Backbone.EventBinder 0.0.0](http://github.com/marionettejs/backbone.eventbinder)
- [Backbone.Wreqr 0.0.0](http://github.com/marionettejs/backbone.wreqr)

By default, a complete implementation based on `<table />` HTML tag is
provided but all the views can be overrided quickly and easily to create
an implementation based on other views and tags.

A default collection is also provided to work with the `Dg` plugin.
*/

var Admin,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone.Admin = Admin = (function(Backbone, Marionette, _, $) {
  var applicationStarted, authorizator, gvent, i18nKeys, initialized, moduleNamePattern;
  Admin = {
    version: "0.0.1"
  };
  applicationStarted = false;
  initialized = false;
  moduleNamePattern = new RegExp(/[a-z]+(:[a-z]+)*/);
  gvent = new Marionette.EventAggregator();
  authorizator = null;
  Admin.ApplicationController = (function() {

    _Class.prototype.modules = {};

    _Class.prototype.regions = {};

    function _Class() {
      _.extend(this, Backbone.Events);
    }

    _Class.prototype.action = function(name) {
      var key, module, result, _i, _len, _ref, _results,
        _this = this;
      module = this.modules[name];
      result = module[module.getRoutableActions()["main"]]();
      _ref = _.keys(result);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push((function(key) {
          if (_this.regions[key] !== void 0) {
            if (result[key] instanceof String) {
              return _this.regions[key][result[key]]();
            } else {
              return _this.regions[key].show(result[key]);
            }
          }
        })(key));
      }
      return _results;
    };

    _Class.prototype.registerModule = function(module) {
      if (module === void 0) {
        throw new Error("The module cannot be undefined");
      }
      if (!(module instanceof Admin.Module)) {
        throw new Error("The module must be from Admin.Module type");
      }
      if (this.modules[module.name] !== void 0) {
        throw new Error("The module is already registered");
      }
      return this.modules[module.name] = module;
    };

    _Class.prototype.registerRegion = function(name, region) {
      if (this.regions[name] !== void 0) {
        throw new Error("The region " + name + " is already registered");
      }
      return this.regions[name] = region;
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
      if (this.baseUrl === void 0) {
        this.baseUrl = "/" + (this.name.replace(/:/g, "/"));
      }
      if (this.routableActions === void 0) {
        throw new Error("At least one routable action must be defined");
      }
    }

    _Class.prototype.getRoutableActions = function() {
      return this.routableActions;
    };

    _Class.prototype.getActions = function() {
      if (this.actions === void 0) {
        throw new Error("No action are defined");
      }
      return this.actions;
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

    _Class.prototype.getRoutableActions = function() {
      return this.routableActions;
    };

    _Class.prototype.getActions = function() {
      if (this.actions === void 0) {
        throw new Error("No action are defined");
      }
      return this.actions;
    };

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
