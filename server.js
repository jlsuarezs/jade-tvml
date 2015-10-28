var express = require('express'),
    logger = require('morgan'),
    jade = require('jade'),
    http = require('http'),
    _ = require('lodash');

var defaultData = require('./data/defaults');

var tvosTemplateWrapper = require('./lib/tvos-template-wrapper'),
    templatePath = require('./lib/template-path');

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

var renderTemplate = function(path, baseUrl, query) {
  return new Promise(function(resolve, reject) {
    templateOptionsFor(path, baseUrl, query)
      .then(function(templateOptions) {
        return resolve(jade.renderFile(templatePath(path), templateOptions));
      })
      .catch(function(err) {
        return reject(err);
      });
  });
};

app.use(express.static('public'));
app.use(logger('dev'));

app.set('view engine', 'jade');
app.set('views', __dirname + "/templates");

jade.filters.style = function (str) { return '<style>' + str.replace(/\s/g, "")  + '</style>'; };

app.get('/templates/:path', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host');

  renderTemplate(req.params.path, baseUrl, req.query).then(function(template) {
    res.set('Content-Type', 'application/javascript');
    res.send(tvosTemplateWrapper(template));
  })
  .catch(function(error) {
    // TODO: Figure out how to properly catch Promise rejections and send a
    // response
    console.log("Err… something broke: \n" + error);
    req.status(500).send("Something broke: \n" + error);
  });
});

app.get('/', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host');

  renderTemplate('Index.xml.js', baseUrl).then(function(template) {
    res.set('Content-Type', 'application/javascript');
    res.send(tvosTemplateWrapper(template));
  })
  .catch(function(error) {
    // TODO: Figure out how to properly catch Promise rejections and send a
    // response
    console.log("Err… something broke: \n" + error);
    req.status(500).send("Something broke: \n" + error);
  });
});

var server = app.listen(5000);
