var express = require('express'),
    logger = require('morgan'),
    jade = require('jade');

var tvosTemplateWrapper = require('./lib/tvos-template-wrapper'),
    templatePath = require('./lib/template-path'),
    imageUrl = require('./lib/image-url'),
    baseUrl = require('./lib/base-url');

var app = express();

app.use(express.static('public'));
app.use(logger('dev'));

app.set('view engine', 'jade');
app.set('views', __dirname + "/templates");

app.get('/templates/:path', function (req, res) {
  jade.filters.style = function (str) { return '<style>' + str.replace(/\s/g, "")  + '</style>'; };

  var template = jade.renderFile(templatePath(req.params.path), {
    doctype: 'xml',
    imageUrl: imageUrl,
    baseUrl: baseUrl(req),
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
