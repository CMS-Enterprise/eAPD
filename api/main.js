// Sets up dotenv, sets default environment
// variables if not defined
require('./env');

const logger = require('./logger')('main');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const uuid = require('uuid/v1');
require('./db').setup();
const auth = require('./auth');
const routes = require('./routes');
const endpointCoverage = require('./endpointCoverageMiddleware');

const server = express();

endpointCoverage.registerCoverageMiddleware(server);
server.use((req, res, next) => {
  req.id = uuid();
  req.meta = {};
  logger.verbose(req, `got ${req.method} request to ${req.path}`);
  return next();
});

logger.silly('setting global middleware');
server.use(compression());
server.use(express.urlencoded({ extended: true }));
server.use(cors({ credentials: true, origin: true }));
server.use(bodyParser.json({ limit: '5mb' }));

// Registers Passport, related handlers, and
// login/logout endpoints
logger.silly('setting up authentication');
auth.setup(server);

logger.silly('setting up routes');
routes(server);

logger.silly('starting the server');
server.listen(process.env.PORT, () => {
  logger.verbose(`server listening on :${process.env.PORT}`);
  endpointCoverage.getCoverageEndpoints(server);
});
