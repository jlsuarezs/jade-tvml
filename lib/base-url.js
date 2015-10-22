var baseUrl = function(req) {
  req.protocol + '://' + req.get('host') + req.originalUrl;
}

module.exports = baseUrl;
