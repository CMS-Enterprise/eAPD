const fs = require('fs');

const getOpenApiUrl = url => {
  // Express paths can have regexs in them to make matches more
  // precise - they appear in parentheses immediately following
  // the parameter name.  Strip them out here, so they match
  // the OpenAPI paths.
  // Regex:
  //   matches:  /:something(stuff)
  //   replaces: /:something
  let last = url.replace(/(\/:.+?)\(.+?\)/g, '$1');

  // Convert the Express :param format to the {param} OpenAPI format
  // Regex:
  //   matches:  /:something
  //             /:something/
  //             (parameter is terminated by end-of-line or a slash)
  //   replaces: /{something}
  //             /{something}/
  //             (end-of-line or slash is preserved)
  last = last.replace(/\/:(.+?)(\/|$)/g, '/{$1}$2');
  let out = last.replace(/\/:(.+?)(\/|$)/g, '/{$1}$2');

  while (out !== last) {
    last = out;
    out = last.replace(/\/:(.+?)(\/|$)/g, '/{$1}$2');
  }

  return out;
};

let endpoints = [];
if (fs.existsSync('./endpoint-data.json')) {
  endpoints = JSON.parse(fs.readFileSync('./endpoint-data.json'));
}

const registerCoverageMiddleware = server => {
  if (process.env.ENDPOINT_COVERAGE_CAPTURE) {
    server.use((req, res, next) => {
      if (!endpoints.length) {
        server._router.stack // eslint-disable-line no-underscore-dangle
          .filter(a => !!a.route)
          .forEach(({ route: { path, methods } }) => {
            const openAPIPath = getOpenApiUrl(path);
            if (endpoints.some(e => e.openAPIPath === openAPIPath)) {
              endpoints.find(e => e.openAPIPath === openAPIPath).methods[
                Object.keys(methods)[0]
              ] = { registered: true, statuses: {} };
            } else {
              endpoints.push({
                path,
                openAPIPath,
                methods: {
                  [Object.keys(methods)[0]]: { registered: true, statuses: {} }
                }
              });
            }
          });
      }

      const end = res.end.bind(res);
      res.end = (...args) => {
        const path = req.route ? req.route.path : req.path;

        if (req.method.toLowerCase() !== 'options') { // ignore 'options' requests
          endpoints.find(e => e.openAPIPath === getOpenApiUrl(path)).methods[
            req.method.toLowerCase()
          ].statuses[res.statusCode] = { tested: true };
        }

        fs.writeFileSync('./endpoint-data.json', JSON.stringify(endpoints));

        return end(...args);
      };

      next();
    });
  }
};

module.exports = {
  registerCoverageMiddleware
};
