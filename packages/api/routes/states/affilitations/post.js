const { addYears, format } = require('date-fns');
const { raw: knex } = require('../../../db');
const { loggedIn } = require('../../../middleware/auth');
const logger = require('../../../logger')('affiliations route post');

module.exports = app => {
  app.post(
    '/states/:stateId/affiliations',
    loggedIn,
    (request, response, next) => {
      const userId = request.user.id;
      const { stateId } = request.params;

      try {
        knex('auth_affiliations')
          .returning(['id'])
          .insert({
            user_id: userId,
            state_id: stateId,
            username: request.user.username,
            expires_at: format(addYears(new Date(), 1), 'yyyy-MM-dd HH:mm:ss')
          })
          .then(rows => response.status(201).json(rows[0]))
          .catch(next);
      } catch (e) {
        logger.error({ id: request.id, message: e });
        next(e);
      }
    }
  );
};
