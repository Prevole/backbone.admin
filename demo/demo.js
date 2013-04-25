(function() {
  var BookCollection, BookGridLayout, BookHeaderView, BookModel, BookRowView, BooksModule, CreateBookView, CreateFruitView, DataModel, DeleteView, EditBookView, EditFruitView, FormBookView, FormFruitView, FruitCollection, FruitGridLayout, FruitHeaderView, FruitModel, FruitRowView, FruitsModule, ModelCollection, NavigationView, Region, appController, bookCollection, bookHeaderTemplate, bookRowTemplate, booksData, fruitCollection, fruitHeaderTemplate, fruitRowTemplate, fruitsData,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone.sync = function(method, model, options) {
    var success;
    if (!model.has('id')) {
      model.set({
        id: _.random(0, 1000)
      });
    }
    success = _.debounce(options.success, 100);
    success(model, null, options);
    return model;
  };

  appController = new Admin.ApplicationController();

  _.mixin({
    collectionize: function(model, rawModels) {
      var id;
      id = 0;
      return _.reduce(rawModels, function(models, modelData) {
        models.push(new model(_.extend(modelData, {
          id: id++
        })));
        return models;
      }, []);
    }
  });

  /*
  ## DataModel
  
  The model class used in this demo
  */


  DataModel = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    /*
    Allow to do a quick search in a collection for the `Backbone.Dg`
    
    @param {String} quickSearch The term to lookup in the model
    */


    _Class.prototype.match = function(quickSearch) {
      return _.reduce(this.fields, function(sum, attrName) {
        return sum || this.attributes[attrName].toString().toLowerCase().indexOf(quickSearch) >= 0;
      }, false, this);
    };

    /*
    Get the value of an attribute based on an index
    
    @param {Integer} index The attribute index to convert in an attribute name
    */


    _Class.prototype.getFromIndex = function(index) {
      return this.get(this.fields[index]);
    };

    return _Class;

  })(Backbone.Model);

  /*
  ## ModelCollection
  
  The model collection specially written for this demo. It simulates
  the asynchronous calls to a server and apply the different manipulation
  to the data for the `Backbone.Dg` grid
  */


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
      this.meta = _.defaults(customs, {
        page: 1,
        perPage: 5,
        term: "",
        sort: {}
      });
      return this.originalModels = _.clone(models);
    };

    _Class.prototype.addToOriginal = function(model) {
      return this.originalModels.push(model);
    };

    _Class.prototype.removeFromOriginal = function(model) {
      return this.originalModels = _.reject(this.originalModels, function(currentModel) {
        return currentModel.id === model.id;
      });
    };

    _Class.prototype.sync = function(method, model, options) {
      var localData, storedSuccess,
        _this = this;
      storedSuccess = options.success;
      options.success = function(models) {
        storedSuccess(models);
        return _this.trigger("fetched");
      };
      localData = _.clone(this.originalModels);
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
      return options.success(localData);
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

  /*
  ## DeleteView
  
  The view to delete a record
  */


  DeleteView = Admin.DeleteView.extend({
    template: function(data) {
      return '<div id="deleteModal" class="modal hide fade" tabindex="1" role="dialog">' + '<div class="modal-header">' + '<button class="close no" type="button">x</button>' + '<h3 id="modalLabel">Delete configuration</h3>' + '</div>' + '<div class="modal-body">' + '<p>Do you really want to delete this record?</p>' + '</div>' + '<div class="modal-footer">' + '<button class="btn no">No</button>' + '<button class="btn btn-primary yes">Yes</button>' + '</div>' + '</div>';
    },
    ui: {
      modal: "#deleteModal"
    },
    onNo: function(event) {
      return this.ui.modal.modal("hide");
    },
    onYes: function(event) {
      return this.ui.modal.modal("hide");
    },
    onRender: function() {
      var _this = this;
      $("body").append(this.$el);
      this.ui.modal.on('hidden', function() {
        return _this.remove();
      });
      return this.ui.modal.modal({
        show: true
      });
    }
  });

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

  /*
  ## BookModel
  
  The book model to handle the book data
  */


  BookModel = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.fields = ["era", "serie", "title", "timeline", "author", "release", "type"];

    return _Class;

  })(DataModel);

  /*
  ## BookCollection
  
  The collection of books
  */


  BookCollection = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.model = BookModel;

    return _Class;

  })(ModelCollection);

  /*
  The collection used in the views
  */


  bookCollection = new BookCollection(_.collectionize(BookModel, booksData));

  /*
  Template used to render the grid headers for the books
  */


  bookHeaderTemplate = function(data) {
    return '<th class="sorting">Era</th>' + '<th class="sorting">Serie</th>' + '<th class="sorting">Title</th>' + '<th class="sorting">Timeline</th>' + '<th class="sorting">Author</th>' + '<th class="sorting">Release</th>' + '<th class="sorting">Type</th>' + '<th>Action</th>';
  };

  /*
  Template used to render the grid rows for the books
  */


  bookRowTemplate = function(data) {
    return ("<td>" + data.era + "</td>") + ("<td>" + data.serie + "</td>") + ("<td>" + data.title + "</td>") + ("<td>" + data.timeline + "</td>") + ("<td>" + data.author + "</td>") + ("<td>" + data.release + "</td>") + ("<td>" + data.type + "</td>") + '<td><button class="edit btn btn-small">Update</button>&nbsp;' + '<button class="delete btn btn-small">Delete</button></td>';
  };

  /*
  ## BookHeaderView
  
  Header view used in the grid rendering
  */


  BookHeaderView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = bookHeaderTemplate;

    return _Class;

  })(Dg.HeaderView);

  /*
  ## BookRowView
  
  Row view used in the grid rendering
  */


  BookRowView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = bookRowTemplate;

    return _Class;

  })(Dg.RowView);

  /*
  ## BookGridLayout
  
  This grid layout render the grid for the books
  */


  BookGridLayout = Dg.createGridLayout({
    collection: bookCollection,
    gridRegions: {
      table: {
        view: Dg.TableView.extend({
          itemView: BookRowView,
          headerView: BookHeaderView
        })
      }
    }
  });

  /*
  ## FormBookView
  
  Base view to build create/edit form views
  */


  FormBookView = Admin.FormView.extend({
    ui: {
      title: "#title"
    }
  });

  /*
  ## CreateBookView
  
  The view to create a new book
  */


  CreateBookView = FormBookView.extend({
    template: "#createBook",
    modelAttributes: function() {
      return {
        id: _.random(0, 1000),
        title: this.ui.title.val()
      };
    }
  });

  /*
  ## EditBookView
  
  The view to edit an existing book
  */


  EditBookView = FormBookView.extend({
    template: "#editBook",
    modelAttributes: function() {
      return {
        title: this.ui.title.val()
      };
    },
    onRender: function() {
      return this.ui.title.val(this.model.get("title"));
    }
  });

  /*
  ## BooksModule
  
  The book module that manages the different actions related to the books
  */


  BooksModule = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.name = "books";

    _Class.prototype.collection = bookCollection;

    _Class.prototype.views = {
      main: {
        view: BookGridLayout,
        region: "mainRegion"
      },
      create: {
        view: CreateBookView,
        region: "mainRegion"
      },
      edit: {
        view: EditBookView,
        region: "mainRegion"
      },
      "delete": {
        view: DeleteView
      }
    };

    _Class.prototype.routeActions = {
      main: "",
      create: "new",
      edit: "edit/:id"
    };

    return _Class;

  })(Admin.CrudModule);

  appController.addInitializer(function() {
    return this.registerModule(new BooksModule());
  });

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

  /*
  ## FruitModel
  
  The fruit model to handle the fruit data
  */


  FruitModel = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.fields = ["id", "name"];

    _Class.prototype.regexName = /^[a-zA-Z]+$/;

    _Class.prototype.validate = function(attrs, options) {
      console.log("There");
      if (!attrs.name.match(this.regexName)) {
        return {
          name: 'The name can contain only lower and upercase letters and must contain at least one letter.'
        };
      }
    };

    return _Class;

  })(DataModel);

  /*
  ## FruitCollection
  
  The fruit collection
  */


  FruitCollection = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.model = FruitModel;

    return _Class;

  })(ModelCollection);

  /*
  The collection used in the views
  */


  fruitCollection = new FruitCollection(_.collectionize(FruitModel, fruitsData));

  /*
  Template used to render the grid headers for the fruits
  */


  fruitHeaderTemplate = function(data) {
    return '<th class="sorting">Name</th>' + '<th>Action</th>';
  };

  /*
  Template used to render the grid rows for the fruits
  */


  fruitRowTemplate = function(data) {
    return ("<td>" + data.name + "</td>") + '<td><button class="edit btn btn-small">Update</button>&nbsp;' + '<button class="delete btn btn-small">Delete</button></td>';
  };

  /*
  ## FruitHeaderView
  
  Header view used in the grid rendering
  */


  FruitHeaderView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = fruitHeaderTemplate;

    return _Class;

  })(Dg.HeaderView);

  /*
  ## FruitRowView
  
  Row view used in the grid rendering
  */


  FruitRowView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = fruitRowTemplate;

    return _Class;

  })(Dg.RowView);

  /*
  ## FruitGridLayout
  
  This grid layout render the grid for the fruits
  */


  FruitGridLayout = Dg.createGridLayout({
    collection: fruitCollection,
    gridRegions: {
      table: {
        view: Dg.TableView.extend({
          itemView: FruitRowView,
          headerView: FruitHeaderView
        })
      }
    }
  });

  /*
  ## FormFruitView
  
  Base view to build create/edit form views
  */


  FormFruitView = Admin.FormView.extend({
    ui: {
      name: "#name"
    },
    error: function(model, error, options) {
      var field;
      field = this.ui.name.closest('.control-group');
      field.addClass('error');
      if (field.find('.help-inline').length === 0) {
        return field.append($('<span class="help-inline"></span>').text(error.name));
      }
    }
  });

  /*
  ## CreateFruitView
  
  The view to create a new fruit
  */


  CreateFruitView = FormFruitView.extend({
    template: "#createFruit",
    modelAttributes: function() {
      return {
        name: this.ui.name.val()
      };
    }
  });

  /*
  ## EditFruitView
  
  The view to edit an existing fruit
  */


  EditFruitView = FormFruitView.extend({
    template: "#editFruit",
    modelAttributes: function() {
      return {
        name: this.ui.name.val()
      };
    },
    onRender: function() {
      return this.ui.name.val(this.model.get("name"));
    }
  });

  /*
  ## FruitsModule
  
  The book module that manages the different actions related to the fruits
  */


  FruitsModule = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.name = "fruits";

    _Class.prototype.collection = fruitCollection;

    _Class.prototype.views = {
      main: {
        view: FruitGridLayout,
        region: "mainRegion"
      },
      create: {
        view: CreateFruitView,
        region: "mainRegion"
      },
      edit: {
        view: EditFruitView,
        region: "mainRegion"
      },
      "delete": {
        view: DeleteView
      }
    };

    _Class.prototype.onCreateSuccess = function(model, response, options) {
      fruitCollection.addToOriginal(model);
      return Admin.CrudModule.prototype.onCreateSuccess.apply(this, model, response, options);
    };

    _Class.prototype.onDeleteSuccess = function(model, response, options) {
      fruitCollection.removeFromOriginal(model);
      fruitCollection.fetch();
      return Admin.CrudModule.prototype.onDeleteSuccess.apply(this, model, response, options);
    };

    _Class.prototype.routeActions = {
      main: "",
      create: "new",
      edit: "edit/:id"
    };

    return _Class;

  })(Admin.CrudModule);

  appController.addInitializer(function() {
    var fruitModule;
    fruitModule = new FruitsModule();
    return this.registerModule(fruitModule);
  });

  NavigationView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.applicationController = appController;

    _Class.prototype.el = ".menu";

    return _Class;

  })(Admin.NavigationView);

  Region = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.el = ".content";

    return _Class;

  })(Marionette.Region);

  $(document).ready(function() {
    new NavigationView();
    appController.registerRegion("mainRegion", new Region());
    return appController.start();
  });

}).call(this);
