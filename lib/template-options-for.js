var templateDynamicContentFor = require('./template-dynamic-content-for');

module.exports = function(path, baseUrl, query) {
  return new Promise(function(resolve, reject) {
    templateDynamicContentFor(path, baseUrl, query)
      .then(function(templateContent) {
        return resolve({
          doctype: 'xml',
          baseUrl: baseUrl,
          dynamicContent: templateContent
        });
      })
      .catch(function(err) {
        return reject(err);
      });
  });
};
