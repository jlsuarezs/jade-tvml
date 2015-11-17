var http = require('http');

module.exports = function(uri) {
  return new Promise(function(resolve, reject) {
    if(uri == undefined) {
      return reject('No URI specified to load');
    }

    http.get(uri, function(res) {
      var body = '';

      console.log('Requesting data from ' + uri);

      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        return resolve(JSON.parse(body));
      });
    }).on('error', function(e) { return reject(e); });

  });
}
