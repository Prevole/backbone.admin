var BookCollection, BookGridLayout, BookHeaderView, BookModel, BookRowView, BooksModule, DataModel, FruitCollection, FruitGridLayout, FruitHeaderView, FruitModel, FruitRowView, FruitsModule, ModelCollection, NavigationView, Region1, Region2, bookHeaderTemplate, bookModels, bookRowTemplate, booksData, fruitHeaderTemplate, fruitModels, fruitRowTemplate, fruitsData,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

booksData = [
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

fruitsData = [
  {
    name: "Banana"
  }, {
    name: "Apple"
  }, {
    name: "Peach"
  }, {
    name: "Grape"
  }, {
    name: "Grapefruits"
  }, {
    name: "Lemon"
  }, {
    name: "Orange"
  }, {
    name: "Tomato"
  }, {
    name: "Apricot"
  }, {
    name: "Avocado"
  }, {
    name: "Cherry"
  }, {
    name: "Clementine"
  }, {
    name: "Coconut"
  }, {
    name: "Kumquat"
  }, {
    name: "Lychee"
  }, {
    name: "Melon"
  }, {
    name: "Pear"
  }, {
    name: "Pineapple"
  }, {
    name: "Watermelon"
  }
];

DataModel = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

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

BookModel = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.fields = ["era", "serie", "title", "timeline", "author", "release", "type"];

  return _Class;

})(DataModel);

FruitModel = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.fields = ["name"];

  return _Class;

})(DataModel);

bookModels = _.reduce(booksData, function(models, modelData) {
  models.push(new BookModel(modelData));
  return models;
}, []);

fruitModels = _.reduce(fruitsData, function(models, modelData) {
  models.push(new FruitModel(modelData));
  return models;
}, []);

ModelCollection = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

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
    localData = _.clone(this.getModels());
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

BookCollection = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.model = BookModel;

  _Class.prototype.getModels = function() {
    return bookModels;
  };

  return _Class;

})(ModelCollection);

FruitCollection = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.model = BookModel;

  _Class.prototype.getModels = function() {
    return fruitModels;
  };

  return _Class;

})(ModelCollection);

bookHeaderTemplate = function(data) {
  return "<th class='sorting'>Era</th>" + "<th class='sorting'>Serie</th>" + "<th class='sorting'>Title</th>" + "<th class='sorting'>Timeline</th>" + "<th class='sorting'>Author</th>" + "<th class='sorting'>Release</th>" + "<th class='sorting'>Type</th>";
};

bookRowTemplate = function(data) {
  return ("<td>" + data.era + "</td>") + ("<td>" + data.serie + "</td>") + ("<td>" + data.title + "</td>") + ("<td>" + data.timeline + "</td>") + ("<td>" + data.author + "</td>") + ("<td>" + data.release + "</td>") + ("<td>" + data.type + "</td>");
};

fruitHeaderTemplate = function(data) {
  return "<th class='sorting'>Name</th>";
};

fruitRowTemplate = function(data) {
  return "<td>" + data.name + "</td>";
};

BookHeaderView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.template = bookHeaderTemplate;

  return _Class;

})(Dg.HeaderView);

BookRowView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.template = bookRowTemplate;

  return _Class;

})(Dg.RowView);

FruitHeaderView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.template = fruitHeaderTemplate;

  return _Class;

})(Dg.HeaderView);

FruitRowView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.template = fruitRowTemplate;

  return _Class;

})(Dg.RowView);

BookGridLayout = Dg.createGridLayout({
  collection: new BookCollection(booksData),
  gridRegions: {
    table: {
      view: Dg.TableView.extend({
        itemView: BookRowView,
        headerView: BookHeaderView
      })
    }
  }
});

FruitGridLayout = Dg.createGridLayout({
  collection: new FruitCollection(fruitsData),
  gridRegions: {
    table: {
      view: Dg.TableView.extend({
        itemView: FruitRowView,
        headerView: FruitHeaderView
      })
    }
  }
});

BooksModule = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.name = "books";

  _Class.prototype.routableActions = {
    defaultAction: "defaultAction",
    add: "add"
  };

  _Class.prototype.defaultAction = function() {
    return {
      r1: new BookGridLayout()
    };
  };

  _Class.prototype.add = function() {
    var F1, F2;
    F1 = Backbone.View.extend({
      render: function() {
        return $(this.el).text("From books: Fruits: " + (Date.now()));
      }
    });
    F2 = Backbone.View.extend({
      render: function() {
        return $(this.el).text("From books: Vegetables: " + (Date.now()));
      }
    });
    return {
      r1: new F1(),
      r2: new F2()
    };
  };

  return _Class;

})(Admin.Module);

FruitsModule = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.name = "fruits";

  _Class.prototype.routableActions = {
    defaultAction: "defaultAction"
  };

  _Class.prototype.defaultAction = function() {
    return {
      r1: new FruitGridLayout()
    };
  };

  return _Class;

})(Admin.Module);

NavigationView = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.el = ".menu";

  return _Class;

})(Admin.NavigationView);

Region1 = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.el = ".content1";

  return _Class;

})(Marionette.Region);

Region2 = (function(_super) {

  __extends(_Class, _super);

  function _Class() {
    return _Class.__super__.constructor.apply(this, arguments);
  }

  _Class.prototype.el = ".content2";

  return _Class;

})(Marionette.Region);

$(document).ready(function() {
  var appController, navigationView, region1, region2;
  appController = new Admin.ApplicationController(new Marionette.Application());
  navigationView = new NavigationView();
  appController.listenTo(navigationView, "action", appController.action);
  appController.registerModule(new BooksModule());
  appController.registerModule(new FruitsModule());
  region1 = new Region1();
  region2 = new Region2();
  appController.registerRegion("r1", region1);
  appController.registerRegion("r2", region2);
  return appController.start();
});
