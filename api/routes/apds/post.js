const Ajv = require('ajv');
const moment = require('moment');

const logger = require('../../logger')('apds route post');
const { raw } = require('../../db');
const { can } = require('../../middleware');

const getNewApd = require('./post.data');

const apdSchema = require('../../schemas/apd.json');

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  removeAdditional: true
});

const validatorFunction = ajv.compile({
  ...apdSchema,
  additionalProperties: false
});

module.exports = (app, { db = raw } = {}) => {
  logger.silly('setting up POST /apds/ route');
  app.post('/apds', can('edit-document'), async (req, res) => {
    logger.silly(req, 'handling POST /apds route');

    try {
      const apd = getNewApd();

      apd.name = `${req.user.state.toUpperCase()}-${moment(Date.now()).format(
        'YYYY-MM-DD'
      )}-HITECH-APD`;

      const stateProfile = await db('states')
        .select('medicaid_office')
        .where({ id: req.user.state })
        .first();

      if (stateProfile) {
        apd.stateProfile.medicaidDirector = {
          ...apd.stateProfile.medicaidDirector,
          ...stateProfile.medicaid_office.medicaidDirector
        };

        apd.stateProfile.medicaidOffice = {
          ...apd.stateProfile.medicaidOffice,
          ...stateProfile.medicaid_office.medicaidOffice
        };
        delete apd.stateProfile.medicaidOffice.director;
      }

      const valid = validatorFunction(apd);
      if (!valid) {
        logger.error(req, 'Newly-created APD fails validation');
        logger.error(req, validatorFunction.errors);
        return res.status(500).end();
      }

      const id = await db('apds')
        .insert({
          state_id: req.user.state,
          status: 'draft',
          document: apd
        })
        .returning('id');

      return res.send({
        ...apd,
        id: id[0],
        updated: new Date().toISOString()
      });
    } catch (e) {
      logger.error(req, e);
      return res.status(500).end();
    }
  });
};
