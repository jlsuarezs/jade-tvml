var express = require('express'),
    tvOsJade = require('tvos-jade'),
    templateOptionsFor = require('./lib/template-options-for'),
    logger = require('morgan');

var app = express();

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
