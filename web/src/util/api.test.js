import MockAdapter from 'axios-mock-adapter';

const set = url => {
  const old = process.env.API_URL;
  if (url) {
    process.env.API_URL = url;
  } else {
    delete process.env.API_URL;
  }

  return () => {
    process.env.API_URL = old;
  };
};

describe('api wrapper', () => {
  describe('url', () => {
    beforeEach(() => jest.resetModules());

    test('uses API_URL env var', () => {
      const reset = set('api-url');
      const api = require('./api').default; // eslint-disable-line global-require
      expect(api.defaults.baseURL).toBe('api-url');
      reset();
    });

    test('uses default URL when env var is empty', () => {
      const reset = set();
      const api = require('./api').default; // eslint-disable-line global-require
      expect(api.defaults.baseURL).toBe('http://localhost:8000');
      reset();
    });
  });

  describe('token auth', () => {
    test('auth header is populated when jwt is present in localStorage', async () => {
      const api = require('./api').default; // eslint-disable-line global-require
      const apiMock = new MockAdapter(api);
      const mockAuth = require('./auth'); // eslint-disable-line global-require
      const managerSpy = jest
        .spyOn(mockAuth, 'getAccessToken')
        .mockImplementation(() => Promise.resolve('aaa.bbb.ccc'));
      apiMock.onGet('/').reply(200);
      await api.get('/');
      expect(apiMock.history.get[0].headers.Authorization).toEqual(
        'Bearer aaa.bbb.ccc'
      );
      managerSpy.mockRestore();
    });

    test('auth header is empty', async () => {
      const api = require('./api').default; // eslint-disable-line global-require
      const apiMock = new MockAdapter(api);
      const mockOktaAuth = require('./oktaAuth'); // eslint-disable-line global-require
      const managerSpy = jest
        .spyOn(mockOktaAuth.tokenManager, 'get')
        .mockImplementation(() => Promise.resolve({}));
      apiMock.onGet('/').reply(200);
      await api.get('/');
      expect(apiMock.history.get[0].headers.Authorization).toBeUndefined();
      managerSpy.mockRestore();
    });
  });
});
