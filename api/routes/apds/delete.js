const logger = require('../../logger')('apds route get');
const { can, userCanEditAPD } = require('../../middleware');
const { deleteAPDByID: da } = require('../../db');

module.exports = (app, { deleteAPDByID = da } = {}) => {
  logger.debug('setting up DELETE /apds/:id route');

  app.delete(
    '/apds/:id',
    can('view-document'),
    userCanEditAPD(),
    async (req, res) => {
      await deleteAPDByID(req.meta.apd.id);
      res.status(204).end();
    }
  );
};
