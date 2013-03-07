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

var Dg,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Backbone.Dg = Dg = (function(Backbone, Marionette, _, $) {
  var EmptyView, LoadingView, defaults, gridRegions, i18nKeys, infoKeys, isI18n, mandatoryOptions, reject, templates;
  Dg = {
    version: "0.0.1"
  };
  /*
    defaults
    
    In the same idea of `_.defaults(object, *defaults)`, this function
    will recurse the object structure to use defaults values at any
    depth of the object.
    
    @param {Object} object The objet to get the overriden values
    @param {Object} defs Defaults to apply when no value is provided
    @return {Object} Object enriched
  */

  defaults = function(object, defs) {
    var key, value;
    if (object === void 0) {
      object = {};
    }
    for (key in defs) {
      value = defs[key];
      if (object[key] === void 0 || object[key] === null) {
        object[key] = defs[key];
      } else if (_.isObject(defs[key]) && _.isObject(object[key])) {
        object[key] = defaults(object[key], defs[key]);
      }
    }
    return object;
  };
  /*
    reject
    
    Like `_.reject(list, iterator, [context])`, this function reject entries
    that satisfies the iterator function.
    
    @param {Object} object The objet that contains entries to reject
    @param {Function} filter The function to reject unwanted entries
    @return {Object} Object that contains only elements wanted
  */

  reject = function(object, filter) {
    var key, newObject, value;
    newObject = {};
    for (key in object) {
      value = object[key];
      if (!filter(object, key, value)) {
        newObject[key] = value;
      }
    }
    return newObject;
  };
  /*
    Check if the options given contains the options wanted
    
    @param {Object} options The options to check
    @param {Array(String)} optionNames The array of option names expected to be there
    @return {Boolean} True if the options are correct, false otherwise
  */

  mandatoryOptions = function(options, optionNames) {
    var optionName, _i, _len;
    if (!(options && _.isObject(options))) {
      return false;
    }
    for (_i = 0, _len = optionNames.length; _i < _len; _i++) {
      optionName = optionNames[_i];
      if (options[optionName] === void 0) {
        return false;
      }
    }
    return true;
  };
  /*
    Check if the I18n library is available or not
    
    @return {Boolean} True if the lib is available
  */

  isI18n = function() {
    return !(window.I18n === void 0);
  };
  /*
    The templates provided are used to offer a simple and default
    implementation that could be used out of the box to render
    a DataGrid.
    
    The templates to render a `Row` or `Headers` are not offered as
    they really depends on what you want to show your data
  */

  templates = {
    empty: function(data) {
      return "<td class='empty'>No Data</td>";
    },
    grid: function(data) {
      return "<div class='dgGrid'>" + "<div class='clearfix'>" + "<div class='dgPerPage' />" + "<div class='dgToolbar' />" + "<div class='dgQuickSearch' />" + "</div>" + "<div class='dgTable' />" + "<div class='clearfix'>" + "<div class='dgInfo pull-left' />" + "<div class='dgPager pull-right' />" + "</div>" + "</div>";
    },
    gridempty: function(data) {
      return "<div class='dgLoading'>" + "<div class='progress progress-striped active'>" + "<div class='bar' style='width:100%'>Loading data</div>" + "</div>" + "</div>";
    },
    info: function(data) {
      return "<span class='info' />";
    },
    pager: function(data) {
      return "<div class='pagination pagination-right' />";
    },
    perpage: function(data) {
      return "<div class='form-inline pull-left'>" + "<label class='checkbox'>Item per page:&nbsp;</label>" + "<select class='per-page input-mini'>" + "<option>2</option>" + "<option>5</option>" + "<option>10</option>" + "<option>25</option>" + "<option>50</option>" + "<option>100</option>" + "</select>" + "</div>";
    },
    quicksearch: function(data) {
      return "<div class='form-inline pull-right qs'>" + "<label class='checkbox'>Quick search:&nbsp;</label>" + "<input type='text' />" + "</div>";
    },
    table: function(data) {
      return "<table class='table table-striped table-hover table-condensed'>" + "<tbody/>" + "</table>";
    },
    toolbar: function(data) {
      return "<div class='form-inline pull-right buttons btn-group'>" + "<button class='btn refresh'>" + "<i class='icon-refresh'/>" + "</button>" + "<button class='btn create'>" + "<i class='icon-plus'/>" + "</button>" + "</div>";
    }
  };
  /*
    ## registerTemplate
    
    Utility function to add a new template entry and/or replacing
    an existing one.
    
    @param {String} templateName The name of the template
    @param {Function,String} template The template to register
  */

  Dg.registerTemplate = function(templateName, template) {
    return templates[templateName] = template;
  };
  /*
    ## ItemView
    
    This is the general view used in the `DataGrid` plugin to ensure
    the rendering and the update of information arround the collection
    rendered. The view is based on the `Marionette.ItemView`.
    
    The both methods `refreshView` and `update` are mandatory. The `refreshView`
    raise an error if not overriden while the `update` has a default implementation.
    
    This view expect to have an event aggregator given from the datagrid layout. If not given,
    an error is raised.
  */

  Dg.ItemView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    /*
        Constructor to enforce the presence of the event aggregator
        used accross the datagrid.
      
        The refreshView method is directly bind to the event `view:refresh`
        from the event aggregator.
      
        @param {Object} options The options that should at least contain `vent` object
    */


    _Class.prototype.initialize = function(options) {
      if (!options.vent) {
        throw new Error("No event aggregator given.");
      }
      this.vent = options.vent;
      return this.vent.on("view:refresh", this.refreshView, this);
    };

    /*
        Override the default render method from `Marionette.ItemView`
        to trigger the event "item:rendered" once the render method
        finished.
      
        The `render` function is called on the `Marionette.ItemView` to
        manage the technical rendering part. The addition comes from
        the event triggered after the rendering is done.
      
        @return {Dg.ItemView} This
    */


    _Class.prototype.render = function() {
      _Class.__super__.render.apply(this, arguments);
      this.vent.trigger("item:rendered", this);
      return this;
    };

    /*
        Refresh the view based on the info comming from the collection state.
      
        By default, this function raised an exception as she must be implemented.
      
        @param {Object} info The metadata that describe the collection current state
    */


    _Class.prototype.refreshView = function(info) {
      throw new Error("The method refreshView(info) must be defined.");
    };

    /*
        Every time the metadata of the datagrid is updated, an
        event is triggered to request a refresh of the data contained
        in the collection.
      
        As the responsability of the metadata processing is given to
        the collection itself, you can set anything you want as metadata.
      
        There is a default metadata format expected that you can see. This
        default format should be configured for the default implementation
        of the different table views.
      
        @param {Object} info The metadata updated by the table views
    */


    _Class.prototype.update = function(info) {
      return this.vent.trigger("update", info);
    };

    /*
        Overrides the `close` function from `Backbone.Marionette.ItemView` to
        ensure that the event binding is correctly unbinded when the view
        is closed.
    */


    _Class.prototype.close = function() {
      this.vent.off("view:refresh", this.refreshView);
      return _Class.__super__.close.apply(this, arguments);
    };

    return _Class;

  })(Marionette.ItemView);
  /*
    ## DefaultItemView
    
    Use the `Dg.DefaultItemView` is a specialized view from `Dg.ItemView`. It is designed
    to be used to generate views that are not wrapped in a `<div />` tag.
    
    The specialization comes from the fact that all the view extending this one will not
    create the `el` tag based on view configuration but create the `el` directly from
    the template rendering. Therefore, setting the `className`, `tagName` or `el` directly
    must not be used directly.
  */

  Dg.DefaultItemView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    /*
        Override the default render method from `Dg.TableItemView` to
        set the element to the result of template rendering. This will
        suppress the additional `<div />` element.
      
        Take care that using this `Dg.DefaultItemView` will not allow to specify
        any selector or tag as el.
      
        The code is based on the `Backbone.Marionette.ItemView` render method with
        two main differences. The element is set from the template rendering and
        an additional `item:rendered` event is triggered.
    */


    _Class.prototype.render = function() {
      if (this.beforeRender) {
        this.beforeRender();
      }
      this.trigger("before:render", this);
      this.trigger("item:before:render", this);
      this.setElement($(Marionette.Renderer.render(this.getTemplate(), this.serializeData())), true);
      this.bindUIElements();
      if (this.onRender) {
        this.onRender();
      }
      this.trigger("render", this);
      this.trigger("item:rendered", this);
      this.vent.trigger("item:rendered", this);
      return this;
    };

    return _Class;

  })(Dg.ItemView);
  /*
    ## Dg.InfoView
    
    Default implementation to present general information about the collection
    currently displayed.
    
    The following information are shown:
    
      - from: The number of the first entry shown
      - to: The number of the last entry shown
      - total: The total number of entries shown
    
    A translation is done for the message shown through `I18n-js` if present. Otherwise,
    the default message is used:
    
      - default message: `Showing ${from} to ${to} of ${total} entries`
  */

  Dg.InfoView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["info"];

    /*
        Show the metadata that describes the collection currently shown
        to the user such the number of entries, the first record, the last
        record.
      
        @param {Object} info The metadata to collect the data to show
    */


    _Class.prototype.refreshView = function(info) {
      if (isI18n()) {
        return this.$el.text(I18n.t(i18nKeys.info, {
          from: info[infoKeys.from],
          to: info[infoKeys.to],
          total: info[infoKeys.items]
        }));
      } else {
        return this.$el.text("Showing " + info[infoKeys.from] + " to " + info[infoKeys.to] + " of " + info[infoKeys.items] + " entries");
      }
    };

    return _Class;

  })(Dg.DefaultItemView);
  /*
    ## Dg.QuickSearch
    
    Default implementation for the quick search accross the collection. A text field
    is used to get the search term and the filtering happens on the `keyup` event
    from the text field.
    
    The refresh of the collection happens in a delayed function to allow writing
    more than one caracter before triggering the refresh. This will avoid strange behavior
    and brings a better user experience.
  */

  Dg.QuickSearchView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["quicksearch"];

    _Class.prototype.events = {
      "keyup input": "search"
    };

    _Class.prototype.ui = {
      term: "input"
    };

    /*
        Intialize the view and prepare the delayed search function
      
        @param {Object} options The options to pass to the parent constructor
    */


    _Class.prototype.initialize = function(options) {
      var _this = this;
      _Class.__super__.initialize.call(this, options);
      return this.searchInternal = _.debounce(function(event) {
        return _this.update(_.object([infoKeys.term], [_this.ui.term.val().trim()]));
      }, 300);
    };

    /*
        Refresh the view by setting the search term into the field.
      
        This could be quite strange but it is useful when you want the
        `Dg.QuickSearchView` on top and on bottom of your datagrid. Therfore,
        the quick search fields seems to be synced together as each field
        will be updated when one of them changed.
      
        @param {Object} info The metadata to retrieve the search term
    */


    _Class.prototype.refreshView = function(info) {
      return this.ui.term.val(info[infoKeys.term]);
    };

    /*
        Handle the quick search field changes to process
        the search query
      
        @param {Event} event The event triggered on `keyup`
    */


    _Class.prototype.search = function(event) {
      return this.searchInternal(event);
    };

    return _Class;

  })(Dg.DefaultItemView);
  /*
    ## Dg.PerPageView
    
    Default implementation for the region which allow changing the number of lines
    shown in the table. The implementation is based on a select box.
  */

  Dg.PerPageView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["perpage"];

    _Class.prototype.events = {
      "change .per-page": "perPage"
    };

    _Class.prototype.ui = {
      perPage: ".per-page"
    };

    /*
        Refresh the view by setting the number of entries per page to the select box.
      
        As the `refresh` function from `Dg.QuickSearchView`, this function is used to
        synchronize multiple views.
      
        @param {Object} info The metadata to get the number of lines per page
    */


    _Class.prototype.refreshView = function(info) {
      return this.ui.perPage.val(info[infoKeys.perPage]);
    };

    /*
        Manage the changes occured to change the number of entries
        shown on a page.
      
        @param {Event} event The event triggered on `change`
    */


    _Class.prototype.perPage = function(event) {
      return this.update(_.object([infoKeys.perPage], [parseInt(this.ui.perPage.val())]));
    };

    return _Class;

  })(Dg.DefaultItemView);
  /*
    ## Dg.ToolbarView
    
    In general, a table is quite often used to manipulate data. Therefore,
    some buttons are required to manage the data such an add button or a
    refresh button.
  */

  Dg.ToolbarView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["toolbar"];

    _Class.prototype.events = {
      "click .refresh": "refresh",
      "click .create": "create"
    };

    _Class.prototype.ui = {
      create: ".create",
      refresh: ".refresh"
    };

    /*
        When the refresh of the view occured, the buttons deactived are
        restored to their initial status as active button.
      
        @param {Object} info The metadata to get information about the collection
    */


    _Class.prototype.refreshView = function(info) {
      this.ui.refresh.removeClass("disabled");
      return this.ui.create.removeClass("disabled");
    };

    /*
        Manage the create button and the management of the button
        state.
      
        When the button is cliked, an event is triggered to delegate
        the creation operation to another component that listen for
        the event.
      
        @param {Event} event Create button event triggered
    */


    _Class.prototype.create = function(event) {
      event.preventDefault();
      if (!this.ui.create.hasClass("disabled")) {
        return this.ui.create.addClass("disabled");
      }
    };

    /*
        Manage the refresh button and the management of the
        button state.
      
        Delegate the update request of the collection to
        the `Dg.ItemView`.
      
        @param {Event} event Refresh button event triggered
    */


    _Class.prototype.refresh = function(event) {
      event.preventDefault();
      if (!this.ui.refresh.hasClass("disabled")) {
        this.ui.refresh.addClass("disabled");
        return this.update({});
      }
    };

    return _Class;

  })(Dg.DefaultItemView);
  /*
    ## Dg.PagerView
    
    The `Dg.PagerView` is probably one of the most complicated view
    as the numbering paging require calculation to render correctly.
    
    The pager includes numbers and page first/last, previous/next
    controlls. A delta of number of pages shown is used to render
    the number controls.
    
    Last and First keywords are converted to the real number of last
    and first page corresponding to the collection.
    
    Previous and Next keywords are converted to +1 and -1 based on
    the current page number.
    
    Checks are done to correct bad page numbers or out of bounds in
    regards of the collection metadata.
  */

  Dg.PagerView = (function(_super) {
    var createLink;

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["pager"];

    _Class.prototype.events = {
      "click a": "pagging"
    };

    /*
        Create a default configuration to start calculation on
        first rendering such number of pages and actual page.
      
        @param {Object} options The options to configure the view
      
        ```
        # Default options
        options:
          deltaPage: 2
          css:
            active: "active"
            disabled: "disabled"
            page: "page"
          texts:
            first: "<<"
            previous: "<"
            next: ">"
            last: ">>"
            filler: "..."
          numbers: true
          firstAndLast: true
          previousAndNext: true
        ```
      
        - **delatePage**: Number of pages shown before and after the active one (if available)
        - **css**: Different style added for link `disabled`, `active` or `page`
        - **texts**: Texts used for each link excepted the page numbers
        - **numbers**: Enable/Disable page number links
        - **firstAndLast**: Enable/Disable first and last links
        - **previousAndNext**: Enable/Disable previous and next links
    */


    _Class.prototype.initialize = function(options) {
      _Class.__super__.initialize.call(this, options);
      this.deltaPage = options.deltaPage || 2;
      this.css = _.defaults(options.css || {}, {
        active: "active",
        disabled: "disabled",
        page: "page"
      });
      if (isI18n()) {
        this.texts = _.defaults(options.texts || {}, {
          first: I18n.t(i18nKeys.pager.first),
          previous: I18n.t(i18nKeys.pager.previous),
          next: I18n.t(i18nKeys.pager.next),
          last: I18n.t(i18nKeys.pager.last),
          filler: I18n.t(i18nKeys.pager.filler)
        });
      } else {
        this.texts = _.defaults(options.texts || {}, {
          first: "<<",
          previous: "<",
          next: ">",
          last: ">>",
          filler: "..."
        });
      }
      this.numbers = true;
      if (options.numbers !== void 0) {
        this.numbers = options.numbers;
      }
      this.firstAndLast = true;
      if (options.firstAndLast !== void 0) {
        this.firstAndLast = options.firstAndLast;
      }
      this.previousAndNext = true;
      if (options.previousAndNext !== void 0) {
        this.previousAndNext = options.previousAndNext;
      }
      this.info = {};
      this.info[infoKeys.page] = 0;
      return this.info[infoKeys.pages] = 0;
    };

    /*
        Render the pager component based on the metadata given. Calculation
        is done to know how to render the actual page, first/last, next/previous
        links.
      
        The pagger is done through a list of element:
      
        ```
        <ul>
          <li><a href="...">...</a></li>
          ...
        </ul>
        ```
        @param {Object} info The metadata to get the pagging data
    */


    _Class.prototype.refreshView = function(info) {
      var css, i, maxPage, minPage, page, pages, state, ul, _i;
      this.info = info;
      this.$el.empty().hide();
      ul = $("<ul />");
      page = this.info[infoKeys.page];
      pages = this.info[infoKeys.pages];
      if (page > 0 && pages > 1) {
        minPage = page - this.deltaPage;
        maxPage = page + this.deltaPage;
        if (minPage <= 0) {
          minPage = 1;
        }
        if (maxPage >= pages) {
          maxPage = pages;
        }
        state = page === 1 ? this.css.disabled : "";
        if (this.firstAndLast) {
          ul.append(createLink.call(this, this.texts.first, "f", state));
        }
        if (this.previousAndNext) {
          ul.append(createLink.call(this, this.texts.previous, "p", state));
        }
        if (this.numbers) {
          if (minPage > 1) {
            ul.append(createLink.call(this, this.texts.filler, "", this.css.disabled));
          }
          for (i = _i = minPage; minPage <= maxPage ? _i <= maxPage : _i >= maxPage; i = minPage <= maxPage ? ++_i : --_i) {
            css = i === page ? this.css.active : "";
            ul.append(createLink.call(this, "" + i, "page", css));
          }
          if (maxPage < pages) {
            ul.append(createLink.call(this, this.texts.filler, "", this.css.disabled));
          }
        }
        state = page === pages ? this.css.disabled : "";
        if (this.previousAndNext) {
          ul.append(createLink.call(this, this.texts.next, "n", state));
        }
        if (this.firstAndLast) {
          ul.append(createLink.call(this, this.texts.last, "l", state));
        }
        return this.$el.append(ul).show();
      }
    };

    /*
        Manage the clicks done on any button of the pager
      
        @param {Event} event Pager button click event
    */


    _Class.prototype.pagging = function(event) {
      var page, target, type;
      event.preventDefault();
      target = $(event.target);
      if (!(target.parent().hasClass(this.css.disabled) || target.parent().hasClass(this.css.active))) {
        type = target.data("type");
        switch (type) {
          case "f":
            page = 1;
            break;
          case "p":
            if (this.info[infoKeys.page] - 1 > 0) {
              page = this.info[infoKeys.page] - 1;
            } else {
              page = this.info[infoKeys.page];
            }
            break;
          case "n":
            if ((this.info[infoKeys.page] + 1) < this.info[infoKeys.pages]) {
              page = this.info[infoKeys.page] + 1;
            } else {
              page = this.info[infoKeys.pages];
            }
            break;
          case "l":
            page = this.info[infoKeys.pages];
            break;
          default:
            page = parseInt($(event.target).text());
        }
        if (page !== this.info[infoKeys.page]) {
          return this.update(_.object([infoKeys.page], [page]));
        }
      }
    };

    /*
        Create a link for one element in the pager.
      
        @param {String} text The text shown to the user
        @param {String} type The type of link
        @param {String} state The state of the link
        @return {jQueryObject} Link element is wrapped into a `li` tag
    */


    createLink = function(text, type, state) {
      var a, li;
      a = $("<a/>").attr("href", "#").data("type", type).addClass(this.css.page).html("" + text);
      li = $("<li />").html(a);
      if (state) {
        li.addClass(state);
      }
      return li;
    };

    return _Class;

  })(Dg.DefaultItemView);
  /*
    ## Dg.RowView
    
    The implementation of the `Dg.RowView` needs to be extended for a proper use. The row view
    have no idea of the data to render and therefore it is required to extend this view for the
    specific data you have to render.
    
    This class take care about the `delete` and `edit` button events when provided. This
    basic behavior is designed to go with the `Dg.ToolbarView` which provides the `create` and
    `refresh` buttons.
    
    This row view is build around the `<tr />` and `<td />` tags that are the defaults for
    the data grid rendering done by the `Dg` plugin.
    
    A default styling is done for the column ordering to show the `asc`, `desc` and `none`
    order.
  */

  Dg.RowView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.tagName = "tr";

    _Class.prototype.events = {
      "click .edit": "edit",
      "click .delete": "delete"
    };

    /*
        Configurable options (default values are shown):
      
        @param {Object} options The options to configure the view
      
        ```
        # Default options
        options:
          css:
            asc: "sorting-asc"
            desc: "sorting-desc"
            none: null
          cellTagName: "td"
        ```
      
        - **css**: Different styles applied when sorting is done. `asc` and
                  `desc` styles are required. A `none` style should be defined
                  to apply when ordering change from `desc` order to `none` order.
        - **cellTagName**: HTML tag name that represent a cell into the data grid
    */


    _Class.prototype.initialize = function(options) {
      _Class.__super__.initialize.call(this, options);
      this.css = _.defaults(options.css || {}, {
        asc: "sorting-asc",
        desc: "sorting-desc"
      });
      return this.cellTagName = options.cellTagName || "td";
    };

    /*
        Apply the different style to represent the ordering done
        on the collection.
      
        @param {Object} info The metadata to get the ordering data
    */


    _Class.prototype.refreshView = function(info) {
      var target, _i, _len, _ref, _results;
      if (info[infoKeys.sort]) {
        _ref = this.$el.find(this.cellTagName);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          target = _ref[_i];
          target = $(target);
          target.removeClass("" + this.css.asc + " " + this.css.desc);
          if (this.css.none) {
            target.removeClass(this.css.none);
          }
          if (info[infoKeys.sort][target.index()]) {
            if (info[infoKeys.sort][target.index()] === infoKeys.asc) {
              _results.push(target.addClass(this.css.asc));
            } else {
              _results.push(target.addClass(this.css.desc));
            }
          } else if (this.css.none) {
            _results.push(target.addClass(this.css.none));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    /*
        Manage the `edit` action
      
        @param {Event} event The `edit` button click
    */


    _Class.prototype.edit = function(event) {
      event.preventDefault();
      return this.vent.trigger("row:edit", this.model);
    };

    /*
        Manage the `delete` action
      
        @param {Event} event The `delete` button click
    */


    _Class.prototype["delete"] = function(event) {
      event.preventDefault();
      return this.vent.trigger("row:delete", this.model);
    };

    return _Class;

  })(Dg.ItemView);
  /*
    ## Dg.EmptyView
    
    When there is no data available in the collection, this view
    is used to show to the user this state of the collection.
    
    The empty view is based on the `<table />` tag and then
    will use a `</td colspan="n">` tag where `n` is the number
    of columns shown in the data table.
  */

  EmptyView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["empty"];

    _Class.prototype.ui = {
      empty: ".empty"
    };

    /*
        Constructor
      
        @param {Object} options The options to get the number of columns
    */


    _Class.prototype.initialize = function(options) {
      this.columns = options.columns;
      return _Class.__super__.initialize.call(this, options);
    };

    /*
        When the view is rendered, the number of columns is set
    */


    _Class.prototype.onRender = function() {
      return this.$el.attr("colspan", this.columns);
    };

    /*
        Nothing fancy is done for this refresh function
      
        @param {Object} info The collection metadata
    */


    _Class.prototype.refreshView = function(info) {};

    return _Class;

  })(Dg.DefaultItemView);
  /*
    ## Dg.LoadingView
    
    This view is used when the collection is fetched from a source. The
    purpose is to show to the user that something is happening that is
    different than no data is available.
  */

  LoadingView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["gridempty"];

    return _Class;

  })(Backbone.Marionette.ItemView);
  /*!
      render: ->
        @beforeRender() if @beforeRender
  
        @trigger("before:render", @)
        @trigger("item:before:render", @)
  
  
        el = $(Marionette.Renderer.render(@getTemplate(), @serializeData()))
        @setElement el
  
        @bindUIElements();
  
        @onRender() if @onRender
  
        @trigger("render", this)
        @trigger("item:rendered", this)
  !
  */

  /*
    ## Dg.HeaderView
    
    As the `Dg.RowView`, the `HeaderView` is incomplete and expects to be
    extended for your own data.
    
    This view offers the mechanism to sort the column of your data collection
    when they are presented in `<table />` tag. Table headers HTML tags are used
    to render the headers.
    
    The multi-sort is possible by pressing on shift key when clicks are done
    on the different columns.
  */

  Dg.HeaderView = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.tagName = "thead";

    _Class.prototype.events = {
      "click .sorting": "sort"
    };

    /*
        ## TODO
        - Introduced a configuration for the CSS
        - Refactor to allow using specific tags for header container and columns
        - Refactor the styles to allow the differenciation between each column sorting in multi mode
    */


    /*
        Refresh the view accordingly to the metadata that should contain
        the column sorting information. Which column are sorted in which
        direction.
      
        @param {Object} info The metadata with the column sorting configuration
    */


    _Class.prototype.refreshView = function(info) {
      var target, _i, _len, _ref, _results;
      _ref = this.$el.find("th");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        target = _ref[_i];
        target = $(target);
        if (target.hasClass("sorting")) {
          target.removeClass("sorting-asc sorting-desc");
          if (info[infoKeys.sort]) {
            this.sortConfiguration = info[infoKeys.sort];
            if (this.sortConfiguration[target.index()]) {
              if (this.sortConfiguration[target.index()] === infoKeys.asc) {
                _results.push(target.addClass("sorting-asc"));
              } else {
                _results.push(target.addClass("sorting-desc"));
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    /*
        Manage the sort action to be done when an header element is
        clicked.
      
        @param {Event} event The click event for sorting
    */


    _Class.prototype.sort = function(event) {
      var idx;
      idx = $(event.target).index();
      if (!this.sortConfiguration) {
        this.sortConfiguration = {};
      }
      if (!event.shiftKey) {
        if (this.sortConfiguration[idx]) {
          this.sortConfiguration = _.pick(this.sortConfiguration, idx);
        } else {
          this.sortConfiguration = {};
        }
      }
      if (this.sortConfiguration[idx] === void 0) {
        this.sortConfiguration[idx] = infoKeys.asc;
      } else if (this.sortConfiguration[idx] === infoKeys.asc) {
        this.sortConfiguration[idx] = infoKeys.desc;
      } else {
        this.sortConfiguration[idx] = void 0;
      }
      return this.update(_.object([infoKeys.sort], [this.sortConfiguration]));
    };

    /*
        @return {int} The number of columns
    */


    _Class.prototype.columns = function() {
      return this.$el.find("th").length;
    };

    return _Class;

  })(Dg.ItemView);
  /*
    ## Dg.TableView
    
    The core view that present the data collection with
    the headers and rows.
    
    The view is based on `<table />` tag element. The collection
    content is wrapped into a `<tbody />` tag and the headers are
    appended before this tag.
  */

  Dg.TableView = Marionette.CompositeView.extend({
    template: templates["table"],
    itemViewContainer: "tbody",
    emptyView: Dg.EmptyView,
    /*
        This function allows the `ItemView` of a `Model` to
        get some information to render itself correctly.
      
        The `EventAggregator` is provided to the `ItemView` throuhg
        this function as the columns information.
      
        @param {Backbone.Model} model The model to render
    */

    itemViewOptions: function(model) {
      return {
        vent: this.vent,
        columns: this.columns()
      };
    },
    /*
        Constructor
      
        @param {Object} options The options to configure the view
      
        ```
        # Options expected
        options:
          vent:
          collection:
        ```
    */

    initialize: function(options) {
      this.vent = options.vent;
      return this.collection = options.collection;
    },
    /*
        Override the `Backbone.Marionette.CompositeView` `render` function
        to be able to render the `header` view before rendering the remaining
        elements. In addition, this allows the element binding to work properly.
      
        @return {Dg.TableView} This
    */

    render: function() {
      var tableHeader;
      this.resetItemViewContainer();
      this.setElement(this.renderModel());
      if (this.headerView) {
        this.header = new this.headerView({
          vent: this.vent
        });
        tableHeader = this.header.render().el;
        this.$el.prepend(tableHeader);
      }
      this.bindUIElements();
      this.trigger("composite:model:rendered");
      this.trigger("render");
      this.renderCollection();
      this.trigger("composite:rendered");
      return this;
    },
    /*
        As the render function do custom operations, we
        need to close the custom additions in a proper way.
      
        In this callback function called before the remaining
        close operations, we close the header view to manage
        properly the event unbinding.
    */

    beforeClose: function() {
      if (this.header) {
        return this.header.close();
      }
    },
    /*
        @return {int} The number of columns, zero if no header view
    */

    columns: function() {
      if (this.header) {
        return this.header.columns();
      } else {
        return 0;
      }
    }
  });
  /*
    ## Dg.TableRegion
    
    This class offers the possibility to add some transition effects
    when the whole data grid is shown to the user.
  */

  Dg.TableRegion = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    return _Class;

  })(Marionette.Region);
  /*!
      Open
      @param [Backbone.View] view The view to open
      open: (view) ->
        @$el.html view.el
        @$el.show "slide", { direction: "up" }, 1000
  
      Show
      @param [Backbone.View] view The view to show
      show: (view) ->
        if @$el
          $(@el).hide "slide", { direction: "up" }, 1000, =>
            super view
        else
          super view
  !
  */

  /*
    ## Dg.GridLayout
    
    This class brings all the bricks together to render each part
    of the datagrid (table, headers, toolbars, pagers...)
  */

  Dg.GridLayout = (function(_super) {

    __extends(_Class, _super);

    function _Class() {
      this.handleRefresh = __bind(this.handleRefresh, this);

      this.handleUpdate = __bind(this.handleUpdate, this);

      this.refreshGrid = __bind(this.refreshGrid, this);

      this.renderRegions = __bind(this.renderRegions, this);
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.template = templates["grid"];

    /*
        Constructor
        @param {Object} options Options to configure the grid
    */


    _Class.prototype.initialize = function(options) {
      this.vent = new Marionette.EventAggregator();
      this.on("render", this.renderRegions);
      /*
            TODO: Refactor this part
        
            Listen to the different events
      */

      this.vent.on("update", this.handleUpdate);
      this.vent.on("refresh", this.handleRefresh);
      this.vent.on("row:edit", this.handleEdit);
      return this.collection.on("fetched", this.refreshGrid);
    };

    /*
        Proceed to the regions rendering. Each region is created,
        configured and rendered when necessary.
    */


    _Class.prototype.renderRegions = function() {
      var options, regionDefinition, regionName, _ref;
      _ref = this.regions;
      for (regionName in _ref) {
        regionDefinition = _ref[regionName];
        if (regionName !== "table") {
          options = _.extend({
            vent: this.vent
          }, regionDefinition.options || {});
          this[regionName].show(new regionDefinition.view(options));
        }
      }
      this.table.show(new LoadingView());
      return this.collection.fetch();
    };

    /*
        Refresh the grid when new data are available through the collection
    */


    _Class.prototype.refreshGrid = function() {
      this.table.show(new this.regions.table.view({
        vent: this.vent,
        collection: this.collection
      }));
      return this.vent.trigger("view:refresh", this.collection.getInfo());
    };

    _Class.prototype.handleUpdate = function(options) {
      this.table.show(new LoadingView());
      return this.collection.updateInfo(options);
    };

    _Class.prototype.handleRefresh = function() {
      return this.collection.refresh();
    };

    _Class.prototype.handleEdit = function(model) {
      return alert(model.get("name"));
    };

    /*
        Override the close function from `Backbone.Marionette.Layout` to
        clean the collection bindings.
    */


    _Class.prototype.close = function() {
      this.collection.off("fetched", this.refreshGrid);
      return _Class.__super__.close.apply(this, arguments);
    };

    return _Class;

  })(Marionette.Layout);
  /*!
      @on "transition:open", =>
        @showTable()
  
    showTable: ->
      if @gridTable.currentView
        @gridTable.currentView.renderCollection()
      else
        @gridTable.show(new @tableView(collection: @collection))
  !
  */

  /*
    Helper function to easily create a new `Dg.RowView` for a
    template and model.
  
    @param {Backbone.Model} model The model for which the view is done
    @param {Function,String} template The template of the view
    @param {Object} options The options to configure the view
  
    ```
    Options allowed:
    options:
      tagName: "tr"
    ```
  
    @return {Dg.RowView} Row view class created
  */

  Dg.createRowView = function(options) {
    if (!mandatoryOptions(options, ["template", "model"])) {
      throw new Error("template or model is missing in the options");
    }
    return Dg.RowView.extend(options);
  };
  /*
    Helper function to easily create a `Dg.HeaderView` for
    a table.
  
    @param {Function,String} template The template of the view
    @return {Dg.HeaderView} Header view class created
  */

  Dg.createHeaderView = function(options) {
    if (!mandatoryOptions(options, ["template"])) {
      throw new Error("template is missing in the options");
    }
    return Dg.HeaderView.extend(options);
  };
  Dg.createTableView = function(options) {
    if (!mandatoryOptions(options, ["template", "itemViewContainer", "itemView"])) {
      throw new Error("template, itemViewContainer or itemView is missing in the options");
    }
    return Dg.TableView.extend(options);
  };
  /*
    Helper function to create a layout with options that overrides the
    default options.
  
    ```
    # Usable options
    options:
      gridRegions: {...}
      collection: ...
      template: ...
    ```
  
    @param {Object} options The options to configure the layout and views
    @return {Dg.GridLayout} The layout class created
  */

  Dg.createGridLayout = function(options) {
    var gridLayout, regions;
    options = options || {};
    regions = options.gridRegions || {};
    regions = reject(defaults(regions, gridRegions), function(object, key, value) {
      return !_.isObject(value);
    });
    if (options.collection === void 0) {
      gridLayout = Dg.GridLayout.extend({
        regions: regions
      });
    } else {
      gridLayout = Dg.GridLayout.extend({
        collection: options.collection,
        regions: regions
      });
    }
    if (!(options.template === void 0)) {
      gridLayout.prototype.template = templates[options.template];
    }
    return gridLayout;
  };
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
    Defaults keys for the metadata used accross the data grid
    plugin.
  
    For more flexibility, it is possible to change the key names
    to match your collection metadata
  */

  infoKeys = {
    from: "from",
    to: "to",
    items: "items",
    totalItems: "totalItems",
    perPage: "perPage",
    pages: "pages",
    page: "page",
    term: "term",
    sort: "sort",
    asc: "A",
    desc: "D"
  };
  /*
    Default configuration to define the data grid regions
    shown in the `Dg.GridLayout`
  
    This configuration could be overriden to match your
    requirements.
  */

  gridRegions = {
    table: {
      selector: ".dgTable",
      regionType: Dg.TableRegion,
      view: Dg.TableView
    },
    toolbar: {
      selector: ".dgToolbar",
      view: Dg.ToolbarView
    },
    quickSearch: {
      selector: ".dgQuickSearch",
      view: Dg.QuickSearchView
    },
    perPage: {
      selector: ".dgPerPage",
      view: Dg.PerPageView
    },
    info: {
      selector: ".dgInfo",
      view: Dg.InfoView
    },
    pager: {
      selector: ".dgPager",
      view: Dg.PagerView
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

  Dg.setupDefaultI18nBindings = function(options) {
    return i18nKeys = _.defaults(options.i18n || {}, i18nKeys);
  };
  /*
    Helper function to define the metadata keys to
    match your collection metadata structure for all
    your grids.
  
    The options are combined with the default ones defined
    by the plugin. Your keys will override the ones
    from the plugins.
  
    @param {Object} options The metadata keys definition
  */

  Dg.setupDefaultInfoBindings = function(options) {
    return infoKeys = _.defaults(options.bindings || {}, infoKeys);
  };
  /*
    Helper function to define the grid layout regions
    definition for all your grids.
  
    The options are combined with the default ones defined
    by the plugin. Your definitions will override the ones
    from the plugins.
  
    @param {Object} options The grid region definitions
  */

  Dg.setupDefaultGridLayout = function(options) {
    return gridRegions = defaults(options.gridRegions || {}, gridRegions);
  };
  return Dg;
})(Backbone, Backbone.Marionette, _, $ || window.jQuery || window.Zepto || window.ender);
