var express = require('express'),
    logger = require('morgan'),
    jade = require('jade');

var app = express();

app.use(express.static('public'));
app.use(logger('dev'));

app.set('view engine', 'jade');
app.set('views', __dirname + "/templates");

app.get('/template/:path', function (req, res) {
  var baseUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  res.header('Content-Type', 'application/javascript');
  var template = jade.renderFile('./templates/' + req.params.path + '.jade', { doctype: 'xml', baseUrl: baseUrl, things: ['One Thing', 'Two Thing', 'Red Thing', 'Blue Thing'] });

  res.send("var Template = function () { return '" + template + "'}")
});

var server = app.listen(5000);
