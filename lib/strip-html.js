module.exports = function(containsHtml) {
  return containsHtml.replace(/<[^>]+>/ig, "")
}
