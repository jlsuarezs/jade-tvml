var imageUrl = function(req) {
  req.protocol + '://' + req.get('host') + req.originalUrl +'images/';
}

module.exports = imageUrl;
