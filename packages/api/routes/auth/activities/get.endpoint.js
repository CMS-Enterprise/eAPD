const {
  login,
  unauthenticatedTest,
  unauthorizedTest
} = require('../../../endpoint-tests/utils');

describe('auth activities endpoint | GET /auth/activities', () => {
  const url = '/auth/activities';

  unauthenticatedTest('get', url);
  unauthorizedTest('get', url);

  it('when authenticated', async () => {
    const api = login();
    const response = await api.get(url);
    const permissions = response.data.map(p => p.name);

    expect(response.status).toEqual(200);
    expect(permissions).toMatchSnapshot();
  });
});
