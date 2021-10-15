const fs = require('fs');
const FormData = require('form-data');
const {
  getDB,
  setupDB,
  teardownDB,
  login,
  unauthenticatedTest,
  unauthorizedTest
} = require('../../endpoint-tests/utils');
const {
  mnAPDId,
  akAPDId,
  finalAPDId,
  badAPDId
} = require('../../seeds/test/apds');

describe('APD files endpoints', () => {
  const db = getDB();
  beforeAll(async () => {
    await setupDB(db);
  });
  afterAll(async () => {
    await teardownDB(db);
  });

  describe('Get a file associated with an APD | GET /apds/:id/files/:fileID', () => {
    const url = (apdID, fileID) => `/apds/${apdID}/files/${fileID}`;

    unauthenticatedTest('get', url(badAPDId));
    unauthorizedTest('get', url(badAPDId));
    describe('when authenticated as a user with permission', () => {
      let api;

      beforeAll(() => {
        api = login();
      });

      it('with a non-existant apd ID', async () => {
        const response = await api.get(
          url(badAPDId, '74aa0d06-ae6f-472f-8999-6ca0487c494f')
        );

        expect(response.status).toEqual(400);
        expect(response.data).toMatchSnapshot();
      });

      it(`with an APD in a state other than the user's state`, async () => {
        const response = await api.get(
          url(mnAPDId, '74aa0d06-ae6f-472f-8999-6ca0487c494f')
        );

        expect(response.status).toEqual(400);
        expect(response.data).toMatchSnapshot();
      });

      it('with an APD that is not associated with the file', async () => {
        const response = await api.get(
          url(finalAPDId, '74aa0d06-ae6f-472f-8999-6ca0487c494f')
        );

        expect(response.status).toEqual(400);
        expect(response.data).toMatchSnapshot();
      });

      it('with a valid request', async () => {
        const response = await api.get(
          url(akAPDId, '74aa0d06-ae6f-472f-8999-6ca0487c494f')
        );

        expect(response.status).toEqual(200);
        expect(response.data).toMatchSnapshot();
      });
    });
  });

  describe('Upload a file associated with an APD | POST /apds/:id/files', () => {
    const url = id => `/apds/${id}/files`;

    const buildFileForm = filename => {
      const imagePath = `${process.cwd()}/test-data/files/${filename}`;
      expect(fs.existsSync(imagePath)).toBeTruthy();

      const formData = new FormData();
      formData.append('file', fs.readFileSync(imagePath), filename);
      const options = {
        headers: {
          ...formData.getHeaders()
        }
      };
      return { formData, options };
    };

    unauthenticatedTest('post', url(badAPDId));
    unauthorizedTest('post', url(badAPDId));

    describe('when authenticated as a user with permission', () => {
      let api;
      beforeAll(() => {
        api = login('state-admin');
      });

      it('with a non-existant apd ID', async () => {
        const { formData, options } = buildFileForm('eAPD_logo.png');
        const response = await api.post(
          url(badAPDId),
          formData.getBuffer(),
          options
        );

        expect(response.status).toEqual(404);
        expect(response.data).toMatchSnapshot();
      });

      it(`with an APD in a state other than the user's state`, async () => {
        const { formData, options } = buildFileForm('eAPD_logo.png');
        const response = await api.post(
          url(mnAPDId),
          formData.getBuffer(),
          options
        );

        expect(response.status).toEqual(403);
        expect(response.data).toMatchSnapshot();
      });

      it('with an APD that is not in draft', async () => {
        const { formData, options } = buildFileForm('eAPD_logo.png');
        const response = await api.post(
          url(finalAPDId),
          formData.getBuffer(),
          options
        );

        expect(response.status).toEqual(400);
        expect(response.data).toMatchSnapshot();
      });

      it('with a text-based file', async () => {
        const textPath = `${process.cwd()}/test-data/files/upload.txt`;
        expect(fs.existsSync(textPath)).toBeTruthy();

        const formData = new FormData();
        formData.append('file', fs.readFileSync(textPath), 'upload.txt');
        const options = {
          headers: {
            ...formData.getHeaders()
          }
        };

        await api.post(url(akAPDId), formData.getBuffer(), options).catch(e => {
          expect(e.response.status).toEqual(415);
          expect(e.response.data).toMatchSnapshot();
        });
      });

      it('with a non-image binary file', async () => {
        const pdfPath = `${process.cwd()}/test-data/files/eAPD_logo.pdf`;
        expect(fs.existsSync(pdfPath)).toBeTruthy();

        const formData = new FormData();
        formData.append('file', fs.readFileSync(pdfPath), 'eAPD_logo.pdf');
        const options = {
          headers: {
            ...formData.getHeaders()
          }
        };

        await api.post(url(akAPDId), formData.getBuffer(), options).catch(e => {
          expect(e.response.status).toEqual(415);
          expect(e.response.data).toMatchSnapshot();
        });
      });

      it('with a unsupported image binary file', async () => {
        const imagePath = `${process.cwd()}/test-data/files/eAPD_logo.bmp`;
        expect(fs.existsSync(imagePath)).toBeTruthy();

        const formData = new FormData();
        formData.append('file', fs.readFileSync(imagePath), 'eAPD_logo.bmp');
        const options = {
          headers: {
            ...formData.getHeaders()
          }
        };

        await api.post(url(akAPDId), formData.getBuffer(), options).catch(e => {
          expect(e.response.status).toEqual(415);
          expect(e.response.data).toMatchSnapshot();
        });
      });

      it('with a valid request (png)', async () => {
        const imagePath = `${process.cwd()}/test-data/files/eAPD_logo.png`;
        expect(fs.existsSync(imagePath)).toBeTruthy();

        const formData = new FormData();
        formData.append('file', fs.readFileSync(imagePath), 'eAPD_logo.png');
        const options = {
          headers: {
            ...formData.getHeaders()
          }
        };

        const response = await api.post(
          url(akAPDId),
          formData.getBuffer(),
          options
        );

        expect(response.status).toEqual(200);
        const re = new RegExp(`apds/${akAPDId}/files/[a-f0-9]{64}`);
        expect(response.data.url).toEqual(expect.stringMatching(re));
      });

      it('with a valid request (jpg)', async () => {
        const imagePath = `${process.cwd()}/test-data/files/eAPD_logo.jpg`;
        expect(fs.existsSync(imagePath)).toBeTruthy();

        const formData = new FormData();
        formData.append('file', fs.readFileSync(imagePath), 'eAPD_logo.jpg');
        const options = {
          headers: {
            ...formData.getHeaders()
          }
        };

        const response = await api.post(
          url(akAPDId),
          formData.getBuffer(),
          options
        );

        expect(response.status).toEqual(200);
        expect(response.data).toMatchSnapshot();
      });

      it('with a valid request (gif)', async () => {
        const imagePath = `${process.cwd()}/test-data/files/eAPD_logo.gif`;
        expect(fs.existsSync(imagePath)).toBeTruthy();

        const formData = new FormData();
        formData.append('file', fs.readFileSync(imagePath), 'eAPD_logo.gif');
        const options = {
          headers: {
            ...formData.getHeaders()
          }
        };

        const response = await api.post(
          url(akAPDId),
          formData.getBuffer(),
          options
        );

        expect(response.status).toEqual(200);
        expect(response.data).toMatchSnapshot();
      });

      it('with a valid request (tiff)', async () => {
        const imagePath = `${process.cwd()}/test-data/files/eAPD_logo.tiff`;
        expect(fs.existsSync(imagePath)).toBeTruthy();

        const formData = new FormData();
        formData.append('file', fs.readFileSync(imagePath), 'eAPD_logo.tiff');
        const options = {
          headers: {
            ...formData.getHeaders()
          }
        };

        const response = await api.post(
          url(akAPDId),
          formData.getBuffer(),
          options
        );

        expect(response.status).toEqual(200);
        expect(response.data).toMatchSnapshot();
      });
    });
  });
});
