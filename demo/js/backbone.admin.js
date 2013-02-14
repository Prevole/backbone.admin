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
  var MainController, ModuleController, applicationStarted, authorizator, gvent, i18nKeys, initialized, mainController, moduleNamePattern;
  Admin = {
    version: "0.0.1"
  };
  applicationStarted = false;
  initialized = false;
  moduleNamePattern = new RegExp(/[a-z]+(:[a-z]+)*/);
  gvent = new Marionette.EventAggregator();
  authorizator = null;
  /*
  */

  Admin.Authorizator = (function() {

    function _Class() {}

    /*
        Check if an action is authorized for the user or not.
      
        @param {String} action The action to check
        @param {Object} subject Can represent the user to check if he can do the action or not
        @return {Boolean} True/False depending the result of the authorization process
    */


    _Class.prototype.can = function(action, subject) {
      return true;
    };

    /*
        Convenient method to apply the inverse of can method
      
        @param {String} action The action to check
        @param {Object} subject Can represent the user to check if he can do the action or not
        @return {Boolean} True/False depending the result of the authorization process
    */


    _Class.prototype.cannot = function(action, subject) {
      return !this.can(action, subject);
    };

    return _Class;

  })();
  Admin.MainRegion = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.el = ".content";

    _Class.prototype.open = function(view) {
      var _this = this;
      this.$el.html(view.el);
      return this.$el.show("slide", {
        direction: "up"
      }, 1000, function() {
        return view.trigger("transition:open");
      });
    };

    _Class.prototype.show = function(view) {
      var _this = this;
      if (this.$el) {
        return $(this.el).hide("slide", {
          direction: "up"
        }, 1000, function() {
          view.trigger("transition:show");
          return _Class.__super__.show.call(_this, view);
        });
      } else {
        return _Class.__super__.show.call(this, view);
      }
    };

    return _Class;

  })(Marionette.Region);
  MainController = (function() {
    var retrieveModule;

    function _Class(options) {
      this.modules = {};
    }

    _Class.prototype.registerModule = function(module) {
      if (module === void 0 || !(module instanceof ModuleController)) {
        throw new Error("The module is not defined or not an instance of Module class");
      }
      if (this.modules[module.getName()] !== void 0) {
        throw new Error("The module " + (module.getName()) + " is already instanciated.");
      } else {
        return this.modules[module.getName()] = module;
      }
    };

    _Class.prototype.switchModule = function(moduleName, changeUrl) {
      var module;
      if (changeUrl == null) {
        changeUrl = true;
      }
      alert(moduleName);
      module = retrieveModule.call(this, moduleName);
      if (changeUrl) {
        module.getRouter().changeUrl("grid");
      }
      return gvent.trigger("changeView", new module.gridLayoutClass());
    };

    _Class.prototype.crudView = function(view, type, options) {
      var module;
      module = view.prototype.controller;
      switch (type) {
        case "create":
          module.getRouter().changeUrl(type);
          break;
        case "edit":
          module.getRouter().changeUrl(type, {
            id: options.model.get("id")
          });
      }
      return gvent.trigger("changeView", new view(options));
    };

    retrieveModule = function(moduleName) {
      if (this.modules[moduleName]) {
        return this.modules[moduleName];
      } else {
        throw new Error("The module " + moduleName + " is not registered.");
      }
    };

    return _Class;

  })();
  mainController = new MainController();
  Admin.FormView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.events = {
      "click .cancel": "cancel",
      "click .create": "create",
      "click .update": "update"
    };

    _Class.prototype.serializeData = function() {
      return this.template;
    };

    _Class.prototype.getAttributes = function() {
      throw new Error("Missing method getAttributes().");
    };

    _Class.prototype.create = function(event) {
      var _this = this;
      event.preventDefault();
      this.model.set(this.getAttributes.call(this));
      return this.controller.collection.create(this.model, {
        wait: true,
        success: function(model, response) {
          return mainController.switchModule(_this.controller.name);
        },
        error: function(model, response) {
          return _this.handleErrors(model, response);
        }
      });
    };

    _Class.prototype.update = function(event) {
      var _this = this;
      event.preventDefault();
      return this.model.save(this.getAttributes.call(this), {
        success: function(model, response) {
          return mainController.switchModule(_this.controller.name);
        },
        error: function(model, response) {
          return _this.handleErrors(model, response);
        }
      });
    };

    _Class.prototype.cancel = function(event) {
      event.preventDefault();
      return mainController.switchModule(this.controller.name);
    };

    _Class.prototype.handleErrors = function(model, response) {
      return console.log("Server side validation failed.");
    };

    return _Class;

  })(Backbone.Marionette.ItemView);
  ModuleController = (function() {
    var crudView, getCrudView, initCollectionClass, initCreateViewClass, initEditViewClass, initGridLayoutClass, initModelClass, isTemplateAvailable, loadTemplate;

    function _Class(options) {
      if (options === void 0) {
        throw new Error("No option defined when some are required.");
      }
      if (!(options.moduleName != null)) {
        throw new Error("No module defined or not a string.");
      } else if (!moduleNamePattern.test(options.moduleName)) {
        throw new Error("The module name is incorect.");
      }
      this.name = options.moduleName;
      this.moduleBaseUrl = "/" + (this.name.replace(/:/g, "/"));
      this.moduleBaseRoute = this.moduleBaseUrl.replace(/^\//, "");
      this.pagesBasePath = options.pagesBasePath != null ? options.pagesBasePath.replace(/\/$/, "") : null;
      this.templatePath = this.pagesBasePath ? "" + this.pagesBasePath + "/" + this.moduleBaseRoute : this.moduleBaseRoute;
      this.vent = new Marionette.EventBinder;
      initModelClass.call(this, options.model);
      initCollectionClass.call(this, options.collection);
      initGridLayoutClass.call(this, options.gridLayout);
      initCreateViewClass.call(this, options.createView);
      initEditViewClass.call(this, options.editView);
    }

    _Class.prototype.getName = function() {
      return this.name;
    };

    _Class.prototype.setRouter = function(router) {
      return this.router = router;
    };

    _Class.prototype.getRouter = function() {
      return this.router;
    };

    _Class.prototype.getRoutes = function() {
      var routeBindings;
      routeBindings = {};
      routeBindings["" + this.moduleBaseRoute] = "grid";
      routeBindings["" + this.moduleBaseRoute + "/new"] = "create";
      routeBindings["" + this.moduleBaseRoute + "/:id/edit"] = "edit";
      this.routePaths = {};
      this.routePaths["grid"] = this.moduleBaseRoute;
      this.routePaths["create"] = "" + this.moduleBaseRoute + "/new";
      this.routePaths["edit"] = "" + this.moduleBaseRoute + "/:id/edit";
      return routeBindings;
    };

    _Class.prototype.getRoute = function(routeName) {
      return this.routePaths[routeName];
    };

    initModelClass = function(modelClass) {
      if (modelClass) {
        this.modelClass = modelClass;
      } else {
        this.modelClass = (function(_super) {

          __extends(_Class, _super);

          function _Class() {
            return _Class.__super__.constructor.apply(this, arguments);
          }

          return _Class;

        })(Backbone.Model);
      }
      return this.modelClass.prototype.controller = this;
    };

    initCollectionClass = function(collectionClass) {
      if (collectionClass) {
        this.collectionClass = collectionClass;
        if (!this.collectionClass.prototype.url) {
          this.collectionClass.prototype.url = modulePath;
        }
        if (!this.collectionClass.prototype.model) {
          this.collectionClass.prototype.model = this.modelClass;
        }
      } else {
        this.collectionClass = Ajadmin.StatedCollection.extend({
          url: this.moduleBaseUrl,
          model: this.modelClass
        });
      }
      return this.collection = new this.collectionClass();
    };

    initGridLayoutClass = function(gridLayoutClass) {
      if (Ajadmin.Dg) {
        if (!gridLayoutClass) {
          return this.gridLayoutClass = Ajadmin.Dg.createDefaultLayout({
            collection: this.collection,
            gridRegions: {
              table: {
                view: Ajadmin.Dg.DefaultTableView.extend({
                  itemView: Ajadmin.Dg.createRowView(this.modelClass, "" + this.templatePath + "/row"),
                  headerView: Ajadmin.Dg.createTableHeaderView("" + this.templatePath + "/headers")
                })
              }
            }
          });
        }
      }
    };

    initCreateViewClass = function(createViewClass) {
      if (createViewClass) {
        this.createViewClass = createViewClass.extend({
          model: this.modelClass
        });
        return this.createViewClass.prototype.controller = this;
      }
    };

    initEditViewClass = function(editViewClass) {
      if (editViewClass) {
        this.editViewClass = (function(_super) {

          __extends(_Class, _super);

          function _Class() {
            return _Class.__super__.constructor.apply(this, arguments);
          }

          return _Class;

        })(editViewClass);
        return this.editViewClass.prototype.controller = this;
      }
    };

    isTemplateAvailable = function(type) {
      switch (type) {
        case "create":
          return !(this.createViewClass.prototype.template === void 0);
        case "edit":
          return !(this.editViewClass.prototype.template === void 0);
      }
    };

    loadTemplate = function(type, callback, options) {
      var url,
        _this = this;
      if (type === "create") {
        url = "" + this.collection.url + "/new";
      } else {
        url = "" + this.collection.url + "/" + (options.model.get("id")) + "/" + type;
      }
      return $.ajax({
        type: 'GET',
        dataType: 'html',
        processData: false,
        url: url,
        success: function(response) {
          switch (type) {
            case "create":
              _this.createViewClass.prototype.template = response;
              break;
            case "edit":
              _this.editViewClass.prototype.template = response;
          }
          return callback(getCrudView.call(_this, type), type, options);
        }
      });
    };

    getCrudView = function(type) {
      switch (type) {
        case "create":
          return this.createViewClass;
        case "edit":
          return this.editViewClass;
      }
    };

    crudView = function(type, options) {
      var callback;
      callback = function(view, type, options) {
        return mainController.crudView(view, type, options);
      };
      if (isTemplateAvailable.call(this, type)) {
        return callback(getCrudView.call(this, type), type, options);
      } else {
        return loadTemplate.call(this, type, callback, options);
      }
    };

    _Class.prototype.grid = function() {
      return mainController.switchModule(this.name, false);
    };

    _Class.prototype.refresh = function() {
      return this.collection.refresh();
    };

    _Class.prototype.create = function(model) {
      return crudView.call(this, "create", {
        model: model
      });
    };

    _Class.prototype.edit = function(model) {
      return crudView.call(this, "edit", {
        model: model
      });
    };

    return _Class;

  })();
  Admin.NavigationView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.switchModule = function(moduleName) {
      return this.trigger("navigate:switchModule", moduleName);
    };

    return _Class;

  })(Marionette.View);
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
    var Router, module;
    if (applicationStarted) {
      throw new Error("Application already started, it is not possible to register more modules.");
    } else {
      module = new ModuleController(options);
      Router = Marionette.AppRouter.extend({
        controller: module,
        appRoutes: module.getRoutes(),
        initialize: function() {
          return this.on("changeUrl", function(type) {
            return this.changeUrl(type);
          });
        },
        changeUrl: function(type, options) {
          var key, route, value;
          route = this.controller.getRoute(type);
          if (options) {
            for (key in options) {
              value = options[key];
              route = route.replace(":" + key, value);
            }
          }
          return this.navigate(route);
        }
      });
      module.setRouter(new Router());
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
    var CRUDApplication, mainRegion, navigationViewClass;
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
      navigationView.listenTo(navigationView, "navigate:switchModule", mainController.switchModule);
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
