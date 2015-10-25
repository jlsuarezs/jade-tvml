var express = require('express'),
    logger  = require('morgan'),
    jade    = require('jade');

var tvosTemplateWrapper = require('./lib/tvos-template-wrapper'),
    templatePath        = require('./lib/template-path');

var app = express();

var templateOptionsFor = function(path, baseUrl) {
  return {
    doctype: 'xml',
    baseUrl: baseUrl,
    things: [
      {'title': 'One Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
      {'title': 'Two Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
      {'title': 'Red Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
      {'title': 'Blue Thing', 'thumbnail': baseUrl + '/resources/images/lolz/pug.png'},
    ]
  }
}

app.use(express.static('public'));
app.use(logger('dev'));

app.set('view engine', 'jade');
app.set('views', __dirname + "/templates");

jade.filters.style = function (str) { return '<style>' + str.replace(/\s/g, "")  + '</style>'; };

app.get('/templates/:path', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host');
  var template = jade.renderFile(templatePath(req.params.path), templateOptionsFor(req.params.path, baseUrl));

  res.set('Content-Type', 'application/javascript');
  res.send(tvosTemplateWrapper(template));
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
