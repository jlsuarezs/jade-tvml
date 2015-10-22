var express = require('express'),
    logger = require('morgan'),
    jade = require('jade');

var baseURL = require('./lib/baseURL'),
    templateFilePath = require('./lib/templateFilePath'),
    tvJSTemplateWrapper = require('./lib/tvJSTemplateWrapper');

var app = express();

app.use(express.static('public'));
app.use(logger('dev'));

app.set('view engine', 'jade');
app.set('views', __dirname + "/templates");

app.get('/templates/:path', function (req, res) {
  var template = jade.renderFile(templateFilePath(req.params.path), {
    doctype: 'xml',
    baseUrl: baseURL(req),
    things: [
      'One Thing',
      'Two Thing',
      'Red Thing',
      'Blue Thing'
    ]
  });

  res.set('Content-Type', 'application/javascript');

  res.send(tvJSTemplateWrapper(template));
});

var server = app.listen(5000);
