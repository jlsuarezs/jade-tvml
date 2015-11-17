var noDynamicContent = require('./no-dynamic-content');
var product = require('./models/product');
var loadDefaultData = require('./load-default-data');

module.exports = function(path, baseUrl, query) {
  var templateDirectory = {
    'Index.xml.js': loadDefaultData,
    'Catalog.xml.js': loadDefaultData,
    'CatalogTemplate.xml.js': product.all,
    'ShowProduct.xml.js': product.find,
    'BuyProduct.xml.js': product.find
  };

  return new Promise(function(resolve, reject) {
    (templateDirectory[path] || noDynamicContent).call(this, baseUrl, query)
      .then(function(content) {
        return resolve(content);
      })
      .catch(function(err) {
        return reject(err);
      });
  });
};

