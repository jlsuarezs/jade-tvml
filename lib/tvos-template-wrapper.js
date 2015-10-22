var tvJSTemplateWrapper = function(template) {
  return "var Template = function () { return '" + template + "'}"
}

module.exports = tvJSTemplateWrapper;
