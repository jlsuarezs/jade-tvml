var loadJsonData = require('../load-json-data'),
    stripHtml = require('../strip-html'),
    _ = require('lodash');

var find = function(baseUrl, query) {
  return new Promise(function(resolve, reject) {
    if(query.handle == undefined) {
      return reject('No product ID (handle)');
    }

    var uri = 'http://soulland.com/products/' + query.handle + '.json';

    loadJsonData(uri).then(function(data) {
      var productData = data.product;
      var product = {
        product: {
          'handle': productData.handle,
          'title': productData.title,
          'heroImg': productData.images[0].src,
          'description': stripHtml(productData.body_html),
          'vendor': productData.vendor,
          'type': productData.product_type,
          'price': "$" + productData.variants[0].price,
          'images': _.map(productData.images, function(image) {return image.src})
        }
      };
      return resolve(product);
    }).catch(function(err) { return reject(err)});
  });
}

var all = function(baseUrl) {
  return new Promise(function(resolve, reject) {
    var uri = 'http://soulland.com/products.json';

    loadJsonData(uri).then(function(data) {
      var productData = data.products;
      var products = {
        things: _.map(productData, function(product) {
          return { 'handle': product.handle, 'title': product.title, 'thumbnail': product.images[0].src };
        })
      };
      return resolve(products);
    }).catch(function(err) { return reject(err); });
  });
};

module.exports = {
  all: all,
  find: find
}
