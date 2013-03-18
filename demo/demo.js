(function() {
  var BookCollection, BookGridLayout, BookHeaderView, BookModel, BookRowView, BooksModule, DataModel, FruitCollection, FruitGridLayout, FruitHeaderView, FruitModel, FruitRowView, FruitsModule, ModelCollection, NavigationView, Region1, Region2, bookHeaderTemplate, bookModels, bookRowTemplate, books, booksData, fruitHeaderTemplate, fruitModels, fruitRowTemplate, fruits, fruitsData,
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
      id: 1,
      name: "Banana"
    }, {
      id: 2,
      name: "Apple"
    }, {
      id: 3,
      name: "Peach"
    }, {
      id: 4,
      name: "Grape"
    }, {
      id: 5,
      name: "Grapefruits"
    }, {
      id: 6,
      name: "Lemon"
    }, {
      id: 7,
      name: "Orange"
    }, {
      id: 8,
      name: "Tomato"
    }, {
      id: 9,
      name: "Apricot"
    }, {
      id: 10,
      name: "Avocado"
    }, {
      id: 11,
      name: "Cherry"
    }, {
      id: 12,
      name: "Clementine"
    }, {
      id: 13,
      name: "Coconut"
    }, {
      id: 14,
      name: "Kumquat"
    }, {
      id: 15,
      name: "Lychee"
    }, {
      id: 16,
      name: "Melon"
    }, {
      id: 17,
      name: "Pear"
    }, {
      id: 18,
      name: "Pineapple"
    }, {
      id: 19,
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

    _Class.prototype.fields = ["id", "name"];

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

  books = new BookCollection(booksData);

  FruitCollection = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.model = FruitModel;

    _Class.prototype.getModels = function() {
      return fruitModels;
    };

    return _Class;

  })(ModelCollection);

  fruits = new FruitCollection(fruitsData);

  bookHeaderTemplate = function(data) {
    return "<th class='sorting'>Era</th>" + "<th class='sorting'>Serie</th>" + "<th class='sorting'>Title</th>" + "<th class='sorting'>Timeline</th>" + "<th class='sorting'>Author</th>" + "<th class='sorting'>Release</th>" + "<th class='sorting'>Type</th>";
  };

  bookRowTemplate = function(data) {
    return ("<td>" + data.era + "</td>") + ("<td>" + data.serie + "</td>") + ("<td>" + data.title + "</td>") + ("<td>" + data.timeline + "</td>") + ("<td>" + data.author + "</td>") + ("<td>" + data.release + "</td>") + ("<td>" + data.type + "</td>");
  };

  fruitHeaderTemplate = function(data) {
    return "<th class='sorting'>Name</th>" + "<th>Action</th>";
  };

  fruitRowTemplate = function(data) {
    return ("<td>" + data.name + "</td>") + "<td><button class=\"edit btn btn-small\">Update</button>&nbsp;" + "<button class=\"delete btn btn-small\">Delete</button></td>";
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
    collection: books,
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
    collection: fruits,
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
      main: "books",
      add: "books/add"
    };

    _Class.prototype.main = function() {
      return {
        r1: new BookGridLayout(),
        r2: new BookGridLayout()
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
      main: "fruits",
      add: "fruits/add",
      edit: "fruits/edit/:id"
    };

    _Class.prototype.add = function() {
      var AddFruitView, self;
      self = this;
      AddFruitView = Marionette.ItemView.extend({
        template: "#fruitForm",
        collection: fruits,
        events: {
          "click button": "addFruit"
        },
        ui: {
          fruitName: "#fruitName"
        },
        addFruit: function(event) {
          event.preventDefault();
          fruitModels.push(new FruitModel({
            name: this.ui.fruitName.val()
          }));
          return self.routableAction("main");
        }
      });
      return {
        r1: new AddFruitView()
      };
    };

    _Class.prototype.edit = function(options) {
      var EditFruitView, model, self;
      self = this;
      if (options.model === void 0) {
        model = fruits.get(options[0]);
      } else {
        model = options.model;
      }
      EditFruitView = Marionette.ItemView.extend({
        template: "#editFruitForm",
        model: model,
        events: {
          "click button": "editFruit"
        },
        ui: {
          fruitName: "#fruitName"
        },
        editFruit: function(event) {
          event.preventDefault();
          options.model.set("name", this.ui.fruitName.val());
          return self.routableAction("main");
        },
        onRender: function() {
          return this.ui.fruitName.val(this.model.get("name"));
        }
      });
      return {
        r1: new EditFruitView()
      };
    };

    _Class.prototype["delete"] = function(options) {
      fruitModels = _.reject(fruitModels, function(fruit) {
        return fruit.get("id") === options.model.get("id");
      });
      return fruits.refresh();
    };

    _Class.prototype.main = function() {
      var fruitLayout,
        _this = this;
      fruitLayout = new FruitGridLayout();
      this.listenTo(fruitLayout, "new", function() {
        return _this.routableAction("add");
      });
      this.listenTo(fruitLayout, "edit", function(model) {
        return _this.routableAction("edit", {
          id: model.get("id")
        }, {
          model: model
        });
      });
      this.listenTo(fruitLayout, "delete", function(model) {
        return _this.action("delete", {
          model: model
        });
      });
      return {
        r1: fruitLayout
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
    appController.listenTo(navigationView, "action", appController.routeAction);
    appController.registerModule(new BooksModule());
    appController.registerModule(new FruitsModule());
    region1 = new Region1();
    region2 = new Region2();
    appController.registerRegion("r1", region1);
    appController.registerRegion("r2", region2);
    return appController.start();
  });

}).call(this);
