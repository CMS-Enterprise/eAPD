const multer = require('multer');
const logger = require('../../logger')('apds file routes');
const { can, userCanEditAPD } = require('../../middleware');
const { validateFile: vf } = require('../../util/fileValidation');
const {
  createNewFileForAPD: cf,
  deleteFileByID: df,
  fileBelongsToAPD: fb
} = require('../../db');
const { getFile: get, putFile: put } = require('../../files');

module.exports = (
  app,
  {
    validateFile = vf,
    createNewFileForAPD = cf,
    deleteFileByID = df,
    fileBelongsToAPD = fb,
    getFile = get,
    putFile = put
  } = {}
) => {
  logger.silly('setting up GET /apds/:id/files/:fileID route');

  app.get('/apds/:id/files/:fileID', can('view-document'), async (req, res) => {
    try {
      if (await fileBelongsToAPD(req.params.fileID, req.params.id)) {
        const file = await getFile(req.params.fileID);
        res.send(file).end();
      } else {
        res.status(400).end();
      }
    } catch (e) {
      logger.error({ id: req.id, message: 'error fetching file' });
      logger.error({ id: req.id, message: e });
      res.status(400).end();
    }
  });

  logger.silly('setting up POST /apds/:id/files route');

  // "Never add multer as a global middleware since a malicious user could
  // upload files to a route that you didn't anticipate."
  // -- https://github.com/expressjs/multer#any
  app.post(
    '/apds/:id/files',
    can('view-document'),
    userCanEditAPD(),
    multer().single('file'),
    async (req, res) => {
      try {
        const { metadata = null } = req.body;
        const { size = 0, buffer = null } = req.file;

        const { error } = await validateFile(buffer);
        if (error) throw new Error(error);

        const fileID = await createNewFileForAPD(
          buffer,
          req.params.id,
          metadata,
          size
        );

        try {
          await putFile(fileID, buffer);
        } catch (e) {
          await deleteFileByID(fileID);
          throw e;
        }

        res.send({ url: `/apds/${req.params.id}/files/${fileID}` });
      } catch (e) {
        logger.error({ id: req.id, message: e });
        res.status(500).send({ message: 'Unable to upload file' });
      }
    }
  );
};
