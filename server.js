var express = require('express'),
    logger = require('morgan'),
    jade = require('jade');

var app = express();

app.use(express.static('public'));
app.use(logger('dev'));

app.set('view engine', 'jade');
app.set('views', __dirname + "/templates");

app.get('/', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  res.header('Content-Type', 'application/xml');
  res.render('CatalogTemplate', { baseUrl: baseUrl, message: 'Hello there!'});
});

var server = app.listen(5000);
