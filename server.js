var express = require('express'),
    logger  = require('morgan'),
    jade    = require('jade');

var tvosTemplateWrapper = require('./lib/tvos-template-wrapper'),
    templatePath        = require('./lib/template-path');

var http = require('http');
var lodash = require('lodash');

var app = express();

var defaultThings = function(baseUrl) {
  return new Promise(function(resolve, _) {
    return resolve({
      things: [
        {'title': 'One Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
        {'title': 'Two Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
        {'title': 'Red Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
        {'title': 'Blue Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
      ]
    });
  });
};

var noDynamicContent = function(baseUrl) {
  return new Promise(function(resolve, _) { return resolve({}) });
};

var shopThings = function(_) {
  return new Promise(function(resolve, reject) {
    var uri = 'http://erinashleyart.com/products.json'
    http.get(uri, function(res) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        var productData = JSON.parse(body).products;
        var products = {
          things: lodash.map(productData, function(product) {
            return { 'title': product.title, 'thumbnail': product.images[0].src };
          })
        };
        return resolve(products);
      });
    }).on('error', function(e) { return reject(e); });
  });
};

var templateDynamicContentFor = function(path, baseUrl) {
  var templateDirectory = {
    'Index.xml.js': defaultThings,
    'CatalogTemplate.xml.js': shopThings
  }

  return new Promise(function(resolve, reject) {
    (templateDirectory[path] || noDynamicContent).call(this, baseUrl)
    .then(function(content) {
      return resolve(content);
    }).catch(function(err) { return reject(err) });
  });
};

var templateOptionsFor = function(path, baseUrl) {
  return new Promise(function(resolve, reject) {
    templateDynamicContentFor(path, baseUrl).then(function(templateContent) {
      return resolve({
        doctype: 'xml',
        baseUrl: baseUrl,
        dynamicContent: templateContent
      });
    }).catch(function(err) { return reject(err) });
  });

};

var renderTemplate = function(path, baseUrl) {
  return new Promise(function(resolve, reject) {
    templateOptionsFor(path, baseUrl)
    .then(function(templateOptions) {
      return resolve(jade.renderFile(templatePath(path), templateOptions));
    })
    .catch(function(err) { return reject(err); });
  });
};

app.use(express.static('public'));
app.use(logger('dev'));

app.set('view engine', 'jade');
app.set('views', __dirname + "/templates");

jade.filters.style = function (str) { return '<style>' + str.replace(/\s/g, "")  + '</style>'; };

app.get('/templates/:path', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host');

  renderTemplate(req.params.path, baseUrl).then(function(template) {
    res.set('Content-Type', 'application/javascript');
    res.send(tvosTemplateWrapper(template));
  }).catch(function(error) {
    // TODO: Figure out how to properly catch Promise rejections and send a
    // response
    console.log("Something broke: \n" + error);
    req.status(500).send("Something broke: \n" + error);
  });
});

app.get('/', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host');
  var template = jade.renderFile(templatePath("Index.xml.js"), {
    doctype: 'xml',
    baseUrl: baseUrl,
    things: [
      'One Thing',
      'Two Thing',
      'Red Thing',
      'Blue Thing'
    ]
  });

  res.set('Content-Type', 'application/javascript');
  res.send(tvosTemplateWrapper(template));
});


var server = app.listen(5000);
