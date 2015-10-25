var express = require('express'),
    logger  = require('morgan'),
    jade    = require('jade');

var tvosTemplateWrapper = require('./lib/tvos-template-wrapper'),
    templatePath        = require('./lib/template-path');

var app = express();

var defaultThings = function(baseUrl) {
  return {
    things: [
      {'title': 'One Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
      {'title': 'Two Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
      {'title': 'Red Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
      {'title': 'Blue Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
    ]
  }
};

var noDynamicContent = function(baseUrl) {
  return {};
}

var templateDynamicContentFor = function(path, baseUrl) {
  var templateDirectory = {
    'Index.xml.js': defaultThings,
    'CatalogTemplate.xml.js': defaultThings
  }

  return (templateDirectory[path] || noDynamicContent).call(this, baseUrl);
};

var templateOptionsFor = function(path, baseUrl) {
  return new Promise(function(resolve, reject) {
    return resolve({
      doctype: 'xml',
      baseUrl: baseUrl,
      dynamicContent: templateDynamicContentFor(path, baseUrl)
    });
  });
};

var renderTemplate = function(path, baseUrl) {
  return new Promise(function(resolve, reject) {
    templateOptionsFor(path, baseUrl)
    .then(function(templateOptions) {
      return resolve(jade.renderFile(templatePath(path), templateOptions));
    })
    .catch(function(err) { reject(err); });
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
