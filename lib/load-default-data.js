var defaultData = require('../data/defaults');

module.exports = function(baseUrl) {
  return new Promise(function(resolve, reject) {
    return resolve({
      things: defaultData
    });
  });
};
