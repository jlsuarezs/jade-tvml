var express = require('express'),
    jade = require('jade');

var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + "/views");

app.get('/', function (req, res) {
  res.header('Content-Type', 'application/xml');
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

var server = app.listen(5000);
