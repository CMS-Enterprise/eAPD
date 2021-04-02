const {
  getDB,
  setupDB,
  teardownDB,
  login,
  unauthenticatedTest,
  unauthorizedTest
} = require('../../endpoint-tests/utils');

const url = '/users';

const get = (id = '') => {
  const api = login();
  return api.get(`${url}/${id}`);
};

describe('users endpoint', () => {
  describe('users endpoint | GET /users', () => {
    const db = getDB();
    beforeAll(() => setupDB(db));
    afterAll(() => teardownDB(db));

    unauthenticatedTest('get', url);
    unauthorizedTest('get', url);

    it('when authenticated', async () => {
      const response = await get();
      expect(response.status).toEqual(200);
    });
  });

  describe('users endpoint | GET /users/:userID', () => {
    const db = getDB();
    beforeAll(() => setupDB(db));
    afterAll(() => teardownDB(db));

    unauthenticatedTest('get', `${url}/some-id`);
    unauthorizedTest('get', `${url}/some-id`);

    describe('when authenticated', () => {
      it('when requesting a non-existant user ID', async () => {
        const response = await get(0);
        expect(response.status).toEqual(400);
      });

      it('when requesting a valid user ID', async () => {
        const response = await get(2000);
        expect(response.status).toEqual(200);
      });
    });
  });
});
