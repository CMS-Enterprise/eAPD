const logger = require('../logger')('auth middleware');
const { cache } = require('./cache');

/**
 * @description Middleware to check if the current request is authenticated.
 * Returns '401 Unauthorized' status and breaks the process chain if request
 * is not authenticated.
 */
const loggedIn = (req, res, next) => {
  logger.debug({ id: req.id, message: 'got a loggedIn middleware request' });
  if (req.user) {
    logger.verbose({ id: req.id, message: `user is logged in` });
    next();
  } else {
    logger.info({ id: req.id, message: 'user is not logged in' });
    res.status(401).end();
  }
};

module.exports.loggedIn = loggedIn;

/**
 * @description Middleware to check if the authenticated user has a particular
 * activity permission. Returns '403 Forbidden' status and breaks the process
 * chain if the user is not authorized.
 *
 * @param {string} activity The activity permission to check for
 * @returns {function} The middleware function
 */
const can = activity =>
  cache(['can', activity], () => {
    return (req, res, next) => {
      logger.debug({
        id: req.id,
        message: `got a can middleware request for [${activity}]`
      });
      // First check if they're logged in
      module.exports.loggedIn(req, res, () => {
        // Then check if they have the activity
        if (req.user.activities.includes(activity)) {
          logger.verbose({
            id: req.id,
            message: `user has the [${activity}] activity`
          });
          next();
        } else {
          logger.info({
            id: req.id,
            message: `user does not have the [${activity}] activity`
          });
          res.status(403).end();
        }
      });
    };
  });

/**
 * @description Middleware to check if the authenticated user has a particular
 * state permission. Returns '403 Forbidden' status and breaks the process
 * chain if the user is not authorized.
 * This function expects that the URL will have /:stateId/ in it in order to
 * determine what state has been requested.
 *
 * @param {string} paramName The name of the stateId param to check for.
 * If the url is '/states/:stateId/affiliations/:id' you would pass in 'stateId'
 * @returns {function} The middleware function
 */
const validForState = paramName =>
  cache(['validForState', paramName], () => {
    return (req, res, next) => {
      // This has to be how the param is named for this middleware
      const stateId = req.params[paramName]
      logger.debug({
        id: req.id,
        message: `got a validForState middleware request for [${stateId}]`
      });
      // First check if they're logged in
      module.exports.loggedIn(req, res, () => {
        // Then check if they have the state or are in the "federal" state
        if ([stateId, 'fd'].includes(req.user.state.id)) {
          logger.verbose({
            id: req.id,
            message: `user has access to the requested State`
          });
          next();
          // or if they have the fed admin role
        } else if ( req.user.role === 'eAPD Federal Admin'){
          logger.verbose({
            id: req.id,
            message: `user is a fed admin is valid for ${stateId}`
          });
          next()
        }else {
          logger.info({
            id: req.id,
            message: `user does not have the [${stateId}] state`
          });
          res.status(403).end();
        }
      });
    };
  });



module.exports.can = can;
module.exports.validForState = validForState
