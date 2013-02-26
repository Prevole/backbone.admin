#CreateView = class extends Admin.FormView
#  ui:
#    name: "#books"
#
#  getAttributes: ->
#    return {
#      name: @ui.name.val()
#    }
#
#EditView = class extends Admin.FormView
#  ui:
#    name: "#books"
#
#  onRender: ->
#    @ui.name.val @model.get("name")
#
#  getAttributes: ->
#    return {
#      name: @ui.name.val()
#    }

#Admin.instanciateModule(
#  moduleName: "books"
#  createView: CreateView
#  editView: EditView
#)

