var express = require('express'),
    tvOsJade = require('tvos-jade'),
    logger = require('morgan'),
    http = require('http'),
    _ = require('lodash');

var defaultData = require('./data/defaults');

var app = express();

var stripHtml = function(containsHtml) {
  return containsHtml.replace(/<[^>]+>/ig, "")
}

var loadJsonData = function(uri) {
  return new Promise(function(resolve, reject) {
    if(uri == undefined) {
      return reject('No URI specified to load');
    }

    http.get(uri, function(res) {
      var body = '';

      console.log('Requesting data from ' + uri);

      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        return resolve(JSON.parse(body));
      });
    }).on('error', function(e) { return reject(e); });

  });
}

var loadDefaultData = function(baseUrl) {
  return new Promise(function(resolve, reject) {
    return resolve({
      things: defaultData
    });
  });
};

var loadShopifyProduct = function(baseUrl, query) {
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

var loadShopifyProducts = function(baseUrl) {
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

var noDynamicContent = function(baseUrl) {
  return new Promise(function(resolve, reject) {
    return resolve({});
  });
};

var templateDynamicContentFor = function(path, baseUrl, query) {
  var templateDirectory = {
    'Index.xml.js': loadDefaultData,
    'Catalog.xml.js': loadDefaultData,
    'CatalogTemplate.xml.js': loadShopifyProducts,
    'ShowProduct.xml.js': loadShopifyProduct,
    'BuyProduct.xml.js': loadShopifyProduct
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

var templateOptionsFor = function(path, baseUrl, query) {
  return new Promise(function(resolve, reject) {
    templateDynamicContentFor(path, baseUrl, query)
      .then(function(templateContent) {
        return resolve({
          doctype: 'xml',
          baseUrl: baseUrl,
          dynamicContent: templateContent
        });
      })
      .catch(function(err) {
        return reject(err);
      });
  });

};

app.use(express.static('public'));
app.use(logger('dev'));

app.get('/templates/:path', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host');

  templateOptionsFor(req.params.path, baseUrl, req.query)
  .then(function(templateOptions) {
    var template = tvOsJade.renderTemplate(req.params.path, templateOptions);
    res.set('Content-Type', 'application/javascript');
    res.send(template);
  })
  .catch(function(error) {
    console.log("Err… something broke: \n" + error);
    req.status(500).send("Something broke: \n" + error);
  });
});

app.get('/', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host');

  var template = tvOsJade.renderTemplate('Index.xml.js', {});

  res.set('Content-Type', 'application/javascript');
  res.send(template);
});

var server = app.listen(5000);
