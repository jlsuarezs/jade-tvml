var tvosTemplateWrapper = function(template) {
  return "var Template = function () { return `" + template + "`}";
};

module.exports = tvosTemplateWrapper;
