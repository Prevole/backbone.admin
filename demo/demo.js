var CreateView, DataModel, EditView, MainRegion, NavigationView, Test, data, dataCollection, models, t2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

data = [
  {
    era: "Pre Republic",
    title: "Into the Void",
    author: "Tim Lebbon",
    release: 2013,
    serie: "Dawn of the Jedi",
    timeline: -25793,
    type: "Book"
  }, {
    era: "Old Republic",
    title: "Precipice",
    author: "John Jackson Miller",
    release: 2009,
    serie: "Lost Tribe of the Sith",
    timeline: -5000,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Skyborn",
    author: "John Jackson Miller",
    release: 2009,
    serie: "Lost Tribe of the Sith",
    timeline: -5000,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Paragon",
    author: "John Jackson Miller",
    release: 2010,
    serie: "Lost Tribe of the Sith",
    timeline: -4985,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Savior",
    author: "John Jackson Miller",
    release: 2010,
    serie: "Lost Tribe of the Sith",
    timeline: -4975,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Purgatory",
    author: "John Jackson Miller",
    release: 2010,
    serie: "Lost Tribe of the Sith",
    timeline: -3960,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Revan",
    author: "Drew Karpyshyn",
    release: 2011,
    serie: "The Old Republic",
    timeline: -3954,
    type: "Book"
  }, {
    era: "Old Republic",
    title: "Deceived",
    author: "Paul S. Kemp",
    release: 2011,
    serie: "The Old Republic",
    timeline: -3953,
    type: "Book"
  }, {
    era: "Old Republic",
    title: "Revan",
    author: "Drew Karpyshyn",
    release: 2011,
    serie: "The Old Republic",
    timeline: -3954,
    type: "Book"
  }, {
    era: "Old Republic",
    title: "Pantheon",
    author: "John Jackson Miller",
    release: 2011,
    serie: "Lost Tribe of the Sith",
    timeline: -3000,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Secrets",
    author: "John Jackson Miller",
    release: 2012,
    serie: "Lost Tribe of the Sith",
    timeline: -3000,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Pandemonium",
    author: "John Jackson Miller",
    release: 2012,
    serie: "Lost Tribe of the Sith",
    timeline: -2975,
    type: "E-book"
  }, {
    era: "Old Republic",
    title: "Red Harvest",
    author: "Joe Schreiber",
    release: 2010,
    serie: "-",
    timeline: -3645,
    type: "Book"
  }
];

DataModel = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.fields = ["era", "serie", "title", "timeline", "author", "release", "type"];

  _Class.prototype.match = function(quickSearch) {
    return _.reduce(this.fields, function(sum, attrName) {
      return sum || this.attributes[attrName].toString().toLowerCase().indexOf(quickSearch) >= 0;
    }, false, this);
  };

  _Class.prototype.getFromIndex = function(index) {
    return this.get(this.fields[index]);
  };

  return _Class;

})(Backbone.Model);

models = _.reduce(data, function(models, modelData) {
  models.push(new DataModel(modelData));
  return models;
}, []);

dataCollection = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.model = DataModel;

  _Class.prototype.initialize = function(models, options) {
    var customs;
    if (options === void 0 || options.meta === void 0) {
      customs = {};
    } else {
      customs = options.meta;
    }
    return this.meta = _.defaults(customs, {
      page: 1,
      perPage: 5,
      term: "",
      sort: {}
    });
  };

  _Class.prototype.sync = function(method, model, options) {
    var localData, storedSuccess,
      _this = this;
    storedSuccess = options.success;
    options.success = function(collection, response, options) {
      storedSuccess(collection, response, options);
      return _this.trigger("fetched");
    };
    localData = _.clone(models);
    localData = _.filter(localData, function(model) {
      return model.match(_this.meta.term.toLowerCase());
    });
    this.meta.items = localData.length;
    localData = localData.sort(function(a, b) {
      var comp, direction, idx, left, right, _ref;
      _ref = _this.meta.sort;
      for (idx in _ref) {
        direction = _ref[idx];
        if (direction) {
          left = a.getFromIndex(idx).toString().toLowerCase();
          right = b.getFromIndex(idx).toString().toLowerCase();
          comp = left.localeCompare(right);
          if (comp !== 0) {
            return comp * (direction === 'A' ? 1 : -1);
          }
        }
      }
      return 0;
    });
    this.meta.pages = Math.ceil(localData.length / this.meta.perPage);
    this.meta.totalItems = localData.length;
    this.meta.from = (this.meta.page - 1) * this.meta.perPage;
    this.meta.to = this.meta.from + this.meta.perPage;
    localData = localData.slice(this.meta.from, this.meta.to);
    this.meta.from = this.meta.from + 1;
    return options.success(this, localData, {
      update: false
    });
  };

  _Class.prototype.refresh = function() {
    this.reset();
    return this.fetch();
  };

  _Class.prototype.getInfo = function() {
    return this.meta;
  };

  _Class.prototype.updateInfo = function(options) {
    this.meta = _.defaults(options, this.meta);
    return this.fetch();
  };

  return _Class;

})(Backbone.Collection);

NavigationView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.el = ".menu";

  _Class.prototype.events = {
    "click a": "handleClick"
  };

  _Class.prototype.handleClick = function(event) {
    event.preventDefault();
    return this.switchModule($(event.target).attr("data-module"));
  };

  return _Class;

})(Admin.NavigationView);

MainRegion = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.el = ".content";

  _Class.prototype.open = function(view) {
    var _this = this;
    this.$el.html(view.el);
    return this.$el.show("slide", {
      direction: "left"
    }, 1000, function() {
      return view.trigger("transition:open");
    });
  };

  _Class.prototype.show = function(view) {
    var _this = this;
    if (this.$el) {
      return $(this.el).hide("slide", {
        direction: "left"
      }, 1000, function() {
        view.trigger("transition:show");
        return _Class.__super__.show.call(_this, view);
      });
    } else {
      return _Class.__super__.show.call(this, view);
    }
  };

  return _Class;

})(Backbone.Marionette.Region);

CreateView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.ui = {
    name: "#books"
  };

  _Class.prototype.getAttributes = function() {
    return {
      name: this.ui.name.val()
    };
  };

  return _Class;

})(Admin.FormView);

EditView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.ui = {
    name: "#books"
  };

  _Class.prototype.onRender = function() {
    return this.ui.name.val(this.model.get("name"));
  };

  _Class.prototype.getAttributes = function() {
    return {
      name: this.ui.name.val()
    };
  };

  return _Class;

})(Admin.FormView);

Admin.instanciateModule({
  moduleName: "books",
  createView: CreateView,
  editView: EditView
});

Test = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.name = "Name test";

  _Class.prototype.routes = {};

  return _Class;

})(Admin.CrudModule);

t2 = new Test();

t2.getRoutes();
