describe "Admin module", ->
  describe "when creating a new module without a name", ->
    it "should throw an exception", ->
      module = class extends Admin.Module

      expect(-> new module()).toThrow("The name of the module must be defined")

  describe "when creating a new module without routable actions", ->
    it "should throw an exception", ->
      module = class extends Admin.Module
        name: "a name"

      expect(-> new module()).toThrow("At least one routable action must be defined")

  describe "when creating a new module with a name and routable actions", ->
    it "should not throw any exception", ->
      module = class extends Admin.Module
        name: "a name"
        routableActions: {}

      expect(-> new module()).not.toThrow()


#  ########################################################
#  # Row View creation
#  ########################################################
#
#  describe "when creating a row view without options", ->
#    it "should throw an exeption", ->
#      expect(-> Dg.createRowView()).toThrow()
#
#  describe "when creating a row view with only tempalte option", ->
#    it "should throw an exeption", ->
#      expect(-> Dg.createRowView(template: (data) -> )).toThrow()
#
#  describe "when creating a row view with only model option", ->
#    it "should throw an exeption", ->
#      expect(-> Dg.createRowView(model: new Backbone.Model())).toThrow()
#
#  describe "when creating a row view with valid options", ->
#    it "should return a valid view", ->
#      expect( -> Dg.createRowView(
#        template: (data) ->
#        model: new Backbone.Model()
#      )).not.toThrow()
#
#      expect(Dg.createRowView(
#        template: (data) ->
#        model: new Backbone.Model()
#      )).toBeDefined()
#
#  ########################################################
#  # Header view creation
#  ########################################################
#
#  describe "when creating a header view without options", ->
#    it "should throw an exeption", ->
#      expect(-> Dg.createHeaderView()).toThrow()
#
#  describe "when creating a header view with valid options", ->
#    it "should return a valid view", ->
#      expect(-> Dg.createHeaderView(template: (data) -> )).not.toThrow()
#      expect(Dg.createHeaderView(template: (data) -> )).toBeDefined()
#
#  ########################################################
#  # Table view creation
#  ########################################################
#
#  describe "when creating a table view without options", ->
#    it "should throw an exception", ->
#      expect(-> Dg.createTableView()).toThrow()
#
#  describe "when creating a table view with only tempalte option", ->
#    it "should throw an exeption", ->
#      expect(-> Dg.createTableView(template: (data) -> )).toThrow()
#
#  describe "when creating a table view with only item view container option", ->
#    it "should throw an exeption", ->
#      expect(-> Dg.createTableView(itemViewContainer: "div")).toThrow()
#
#  describe "when creating a table view with only item view option", ->
#    it "should throw an exeption", ->
#      rowView = Dg.createRowView(
#        template: (data) ->
#        model: new Backbone.Model()
#      )
#
#      expect(-> Dg.createTableView(itemView: rowView)).toThrow()
#
#  describe "when creating a table view with valid options", ->
#    it "should return a valid view", ->
#      rowView = Dg.createRowView(
#        template: (data) ->
#        model: new Backbone.Model()
#      )
#
#      expect(-> Dg.createTableView(
#        template: (data) ->
#        itemViewContainer: "div"
#        itemView: rowView
#      )).not.toThrow()
#
#      expect(Dg.createTableView(
#        template: (data) ->
#        itemViewContainer: "div"
#        itemView: rowView
#      )).toBeDefined()
#
#  ########################################################
#  # Grid layout creation
#  ########################################################
#
#  describe "when a grid layout is created with default options", ->
#    grid =  Dg.createGridLayout()
#
#    it "should have default table region", ->
#      expect(grid.prototype.regions.table).toBeDefined()
#
#    it "should have default toolbar region", ->
#      expect(grid.prototype.regions.toolbar).toBeDefined()
#
#    it "should have default quickSearch region", ->
#      expect(grid.prototype.regions.quickSearch).toBeDefined()
#
#    it "should have default perPage region", ->
#      expect(grid.prototype.regions.perPage).toBeDefined()
#
#    it "should have default info region", ->
#      expect(grid.prototype.regions.info).toBeDefined()
#
#    it "should have default pager region", ->
#      expect(grid.prototype.regions.pager).toBeDefined()
#
#    it "should not have any collection", ->
#      expect(grid.prototype.collection).toBeUndefined()
#
#    it "should have a default template", ->
#      expect(grid.prototype.template).toBeDefined()
#
#  describe "when a grid is created without default options", ->
#    template = (data) ->
#      "something"
#
#    Dg.registerTemplate "template", template
#
#    collection = new Backbone.Collection()
#
#    grid =  Dg.createGridLayout(
#      collection: collection
#      template: "template"
#      gridRegions:
#        perPage: false
#        toolbar: false
#        quickSearch: false
#        pager: false
#        info: false
#        table: false
#    )
#
#    it "should not have table region", ->
#      expect(grid.prototype.regions.table).toBeUndefined()
#
#    it "should not have toolbar region", ->
#      expect(grid.prototype.regions.toolbar).toBeUndefined()
#
#    it "should not have quickSearch region", ->
#      expect(grid.prototype.regions.quickSearch).toBeUndefined()
#
#    it "should not have perPage region", ->
#      expect(grid.prototype.regions.perPage).toBeUndefined()
#
#    it "should not have info region", ->
#      expect(grid.prototype.regions.info).toBeUndefined()
#
#    it "should not have pager region", ->
#      expect(grid.prototype.regions.pager).toBeUndefined()
#
#    it "should have the collection given", ->
#      expect(grid.prototype.collection).toBe(collection)
#
#    it "should have the template give", ->
#      expect(grid.prototype.template).toBe(template)
