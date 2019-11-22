const logger = require('../logger')('apd middleware');
const { cache } = require('./cache');

const { knex } = require('../db');

/**
 * @description Middleware to load an APD into the request "meta" property
 * @param {Object} injection Dependency injection
 * @param {Object} injection.db A Knex object to use for queries
 */
module.exports.loadApd = ({ db = knex } = {}) =>
  cache(['loadApd'], () => {
    const loadApd = async (req, res, next) => {
      logger.silly(req, 'loading APD for request');
      try {
        const apdFromDB = await db('apds')
          .where({ id: +req.params.id })
          .first('document', 'id', 'state_id', 'status', 'updated_at');

        if (apdFromDB) {
          req.meta.apd = {
            ...apdFromDB.document,
            id: apdFromDB.id,
            state: apdFromDB.state_id,
            status: apdFromDB.status,
            updated: apdFromDB.updated_at
          };
          next();
        } else {
          logger.verbose(req, 'requested object does not exist');
          res.status(404).end();
        }
      } catch (e) {
        logger.error(req, e);
        res.status(500).end();
      }
    };
    return loadApd;
  });

/**
 * @description Middleware to determine if the current user has access
 *    to the APD they would load.  Also calls loadApd middleware
 * @param {Object} injection Dependency injection
 * @param {Object} injection.loadApd A function that sets req.meta.apd if the
 *    APD exists and then calls a callback. Otherwise terminates the response
 *    and does NOT callback.
 */
module.exports.userCanAccessAPD = ({ loadApd = module.exports.loadApd } = {}) =>
  cache(['userCanAccessAPD'], () => {
    const userCanAccessAPD = async (req, res, next) => {
      logger.silly(req, 'verifying the user can access this APD');

      // Load the APD first...  Technically we don't have to await this
      // since we rely on the next() callback from loadApd.  However,
      // if we don't await this, the function will return immediately
      // and that causes problems in testing.  So we await.  :)
      await loadApd()(req, res, async () => {
        // ...then get a list of APDs this user is associated with

        // Make sure there's overlap
        if (req.meta.apd.state === req.user.state.id) {
          next();
        } else {
          logger.verbose(req, 'user does not have access to the APD');
          res.status(404).end();
        }
      });
    };
    return userCanAccessAPD;
  });

/**
 * @description Middleware to determine if the current user can edit
 *    the APD they would load.  Also calls userCanAccessAPD middleware
 * @param {Object} injection Dependency injection
 * @param {Object} injection.userCanAccessAPD A function that calls a callback
 *    if the APD exists and the user can access it. Otherwise terminates the
 *    response and does NOT callback.
 */
module.exports.userCanEditAPD = ({
  userCanAccessAPD = module.exports.userCanAccessAPD
} = {}) =>
  cache(['userCanEditAPD'], () => {
    const userCanEditAPD = async (req, res, next) => {
      logger.silly(req, 'verifying the user can edit this APD');

      // First make sure they can access the APD.  Same story here
      // as above with respect to await.
      await userCanAccessAPD()(req, res, () => {
        // Then make sure it's in draft
        if (req.meta.apd.status === 'draft') {
          next();
        } else {
          logger.verbose(
            req,
            `apd status is [${req.meta.apd.status}], not editable`
          );
          res
            .status(400)
            .send({
              error: 'apd-not-editable'
            })
            .end();
        }
      });
    };
    return userCanEditAPD;
  });
