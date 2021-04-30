import MockAdapter from 'axios-mock-adapter';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './auth';
import axios from '../util/api';
import * as mockAuth from '../util/auth';
import mockApp from './app';
import mockAdmin from './admin';
import { MFA_FACTOR_TYPES } from '../constants';

jest.mock('./app', () => {
  return {
    fetchAllApds: jest.fn()
  };
});
jest.mock('./admin', () => {
  return {
    getUsers: jest.fn(),
    getRoles: jest.fn()
  };
});

const mockStore = configureStore([thunk]);
const fetchMock = new MockAdapter(axios);

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('auth actions', () => {
  it('requestLogin should create LOGIN_REQUEST action', () => {
    expect(actions.requestLogin()).toEqual({ type: actions.LOGIN_REQUEST });
  });

  it('completeFirstStage should create LOGIN_OTP_STAGE action', () => {
    expect(actions.completeFirstStage()).toEqual({
      type: actions.LOGIN_OTP_STAGE
    });
  });

  it('startSecondStage should create LOGIN_MFA_REQUEST action', () => {
    expect(actions.startSecondStage()).toEqual({
      type: actions.LOGIN_MFA_REQUEST
    });
  });

  it('completeLogin should create LOGIN_SUCCESS action', () => {
    expect(actions.completeLogin()).toEqual({ type: actions.LOGIN_SUCCESS });
  });

  it('failLogin should create LOGIN_FAILURE action', () => {
    expect(actions.failLogin('foo')).toEqual({
      type: actions.LOGIN_FAILURE,
      error: 'foo'
    });
  });

  it('requestLogout should create LOGOUT_REQUEST action', () => {
    expect(actions.requestLogout()).toEqual({
      type: actions.LOGOUT_REQUEST
    });
  });

  it('completeLogout should create LOGOUT_SUCCESS action', () => {
    expect(actions.completeLogout()).toEqual({ type: actions.LOGOUT_SUCCESS });
  });

  describe('login (async)', () => {
    beforeEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();
    });

    it('creates LOGIN_SUCCESS after successful single factor auth', async () => {
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            sessionToken: 'testSessionToken',
            status: 'SUCCESS'
          })
        );
      const expiresAt = new Date().getTime() + 5000;
      const getTokenSpy = jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const store = mockStore({});
      fetchMock
        .onGet('/me')
        .reply(200, { name: 'moop', activities: [], states: ['MO'] });
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        { type: actions.UPDATE_EXPIRATION, data: expiresAt },
        {
          type: actions.LOGIN_SUCCESS,
          data: { name: 'moop', activities: [], states: ['MO'] }
        }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      await expect(getTokenSpy).toHaveBeenCalledTimes(1);

      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_SUCCESS after successful single factor auth, sends user to state request', async () => {
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            sessionToken: 'testSessionToken',
            status: 'SUCCESS'
          })
        );
      const expiresAt = new Date().getTime() + 5000;
      const getTokenSpy = jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const store = mockStore({});
      fetchMock
        .onGet('/me')
        .reply(200, { name: 'moop', activities: [], states: [] });
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        { type: actions.UPDATE_EXPIRATION, data: expiresAt },
        { type: actions.STATE_ACCESS_REQUIRED }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      await expect(getTokenSpy).toHaveBeenCalledTimes(1);

      await timeout(500);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_OTP_STAGE after successful first stage of multi-factor auth', async () => {
      const verifySpy = jest.fn(() => Promise.resolve());
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            status: 'MFA_REQUIRED',
            factors: [
              {
                provider: 'OKTA',
                factorType: 'email',
                verify: verifySpy
              }
            ]
          })
        );
      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        { type: actions.LOGIN_OTP_STAGE }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      await expect(verifySpy).toHaveBeenCalledTimes(1);
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_FAILURE if no valid factor is found', async () => {
      const verifySpy = jest.fn(() => Promise.resolve());
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            status: 'MFA_REQUIRED',
            factors: [
              {
                provider: 'bad',
                factorType: 'email',
                verify: verifySpy
              }
            ]
          })
        );
      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        {
          type: actions.LOGIN_FAILURE,
          error: 'AUTH_FAILED'
        }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      await expect(verifySpy).not.toHaveBeenCalled();
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOCKED_OUT if account is locked out', async () => {
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            status: 'LOCKED_OUT'
          })
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'LOCKED_OUT' }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('redirects the user to enroll in MFA if MFA_ENROLL', async () => {
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            sessionToken: 'testSessionToken',
            status: 'MFA_ENROLL'
          })
        );

      const factorSpy = jest
        .spyOn(mockAuth, 'getAvailableFactors')
        .mockImplementation(() => ['factors']);

      const store = mockStore({});
      const expectedActions = [
        {
          type: actions.LOGIN_REQUEST
        },
        {
          type: actions.LOGIN_MFA_ENROLL_START,
          data: {
            factors: ['factors'],
            phoneNumber: undefined
          }
        }
      ];

      const redirect = await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      await expect(factorSpy).toHaveBeenCalledTimes(1);

      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
      expect(redirect).toEqual('/login/mfa/enroll');
    });

    it('creates PASSWORD_EXPIRED if password has expired', async () => {
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            status: 'PASSWORD_EXPIRED'
          })
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        {
          type: actions.LOGIN_FAILURE,
          error: 'PASSWORD_EXPIRED'
        }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_SUCCESS after successful second stage of multi-factor auth', async () => {
      const verify = jest.fn(() =>
        Promise.resolve({ sessionToken: 'testSessionToken', status: 'SUCCESS' })
      );
      const txResumeSpy = jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify
          })
        );
      const expiresAt = new Date().getTime() + 5000;
      const getTokenSpy = jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const store = mockStore({});
      fetchMock
        .onGet('/me')
        .reply(200, { name: 'moop', activities: [], states: ['MO'] });
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.UPDATE_EXPIRATION, data: expiresAt },
        {
          type: actions.LOGIN_SUCCESS,
          data: { name: 'moop', activities: [], states: ['MO'] }
        }
      ];

      await store.dispatch(actions.loginOtp('otp'));

      await expect(txResumeSpy).toHaveBeenCalledTimes(1);
      await expect(verify).toHaveBeenCalledTimes(1);
      await expect(getTokenSpy).toHaveBeenCalledTimes(1);
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('returns null if status is invalid', async () => {
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            sessionToken: 'testSessionToken',
            status: 'BAD_STATUS'
          })
        );

      const store = mockStore({});
      const expectedActions = [{ type: actions.LOGIN_REQUEST }];

      const redirect = await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);

      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
      expect(redirect).toBeNull();
    });

    it('creates LOGIN_MFA_FAILURE when no transaction exists', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() => false);

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'MFA_AUTH_FAILED' }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_MFA_FAILURE when it fails to resume transaction', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify: jest.fn(() =>
              Promise.reject(new Error('Authentication failed'))
            )
          })
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'MFA_AUTH_FAILED' }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_MFA_FAILURE when verifing the otp fails', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify: jest.fn(() =>
              Promise.reject(new Error('Authentication failed'))
            )
          })
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'MFA_AUTH_FAILED' }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });
    
    it('creates PASSWORD_EXPIRED when verify returns an expired password status', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify: jest.fn(() =>
              Promise.resolve({ sessionToken: 'testSessionToken', status: 'PASSWORD_EXPIRED' })
            )
          })
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'PASSWORD_EXPIRED' }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_MFA_FAILURE when the token is not returned', async () => {
      const verify = jest.fn(() =>
        Promise.resolve({ sessionToken: 'testSessionToken' })
      );
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify
          })
        );
      jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() =>
          Promise.reject(new Error('Authentication failed'))
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'MFA_AUTH_FAILED' }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_MFA_FAILURE when returned session token does not match the one sent in', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify: jest.fn(() =>
              Promise.resolve({ sessionToken: 'testSessionToken', status: 'SUCCESS' })
            )
          })
        );
      const expiresAt = new Date().getTime() + 5000;
      jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.UPDATE_EXPIRATION, data: expiresAt },
        {
          type: actions.LOGIN_FAILURE,
          error: 'Request failed with status code 404'
        }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_MFA_FAILURE after fails to add access token', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify: jest.fn(() =>
              Promise.resolve({ sessionToken: 'testSessionToken' })
            )
          })
        );
      jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() =>
          Promise.reject(new Error('Authentication failed'))
        );

      const store = mockStore({});
      fetchMock
        .onGet('/me')
        .reply(200, { name: 'moop', activities: [], states: ['MO'] });
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'MFA_AUTH_FAILED' }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOCKED_OUT after too many failed MFA attempts', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify: jest.fn(() => Promise.reject(new Error('User Locked')))
          })
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        { type: actions.LOGIN_FAILURE, error: 'LOCKED_OUT' }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_FAILURE_NOT_IN_GROUP when not in required Okta group', async () => {
      jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            verify: jest.fn(() =>
              Promise.reject(
                new Error('User is not assigned to the client application.')
              )
            )
          })
        );

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_MFA_REQUEST },
        {
          type: actions.LOGIN_FAILURE,
          error: 'NOT_IN_GROUP'
        }
      ];

      await store.dispatch(actions.loginOtp('otp'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_FAILURE after failure to get user on backend', async () => {
      const signInSpy = jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() =>
          Promise.resolve({
            sessionToken: 'testSessionToken',
            status: 'SUCCESS'
          })
        );
      const expiresAt = new Date().getTime() + 5000;
      const setTokenSpy = jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const store = mockStore({});
      fetchMock.onGet('/me').reply(401, { error: 'Unauthorized' });
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        { type: actions.UPDATE_EXPIRATION, data: expiresAt },
        {
          type: actions.LOGIN_FAILURE,
          error: 'Request failed with status code 401'
        }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      expect(signInSpy).toHaveBeenCalledTimes(1);
      expect(setTokenSpy).toHaveBeenCalledTimes(1);
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates LOGIN_SUCCESS after successful single factor auth', async () => {
      jest
        .spyOn(mockAuth, 'authenticateUser')
        .mockImplementation(() => Promise.reject(new Error('AUTH_FAILED')));

      const store = mockStore({});
      const expectedActions = [
        { type: actions.LOGIN_REQUEST },
        {
          type: actions.LOGIN_FAILURE,
          error: 'AUTH_FAILED'
        }
      ];

      await store.dispatch(actions.login('name', 'secret'));
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('logout (async)', () => {
    let logoutSpy;

    beforeEach(() => {
      logoutSpy = jest
        .spyOn(mockAuth, 'logoutAndClearTokens')
        .mockImplementation(() => Promise.resolve({}));
    });

    afterEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();
    });

    it('creates LOGOUT_SUCCESS after successful request', async () => {
      const store = mockStore({});
      fetchMock.onPost('/logout').reply(200);

      const expectedActions = [
        { type: actions.LOGOUT_REQUEST },
        { type: actions.LOGOUT_SUCCESS }
      ];

      await store.dispatch(actions.logout());
      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('authCheck (async)', () => {
    afterEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();
    });

    it('reauthenticates a user if their session is still valid', async () => {
      const store = mockStore({});
      fetchMock.onGet('/me').reply(200, {
        name: 'moop',
        activities: ['something'],
        states: ['mo']
      });
      const expiresAt = new Date().getTime() + 5000;
      jest
        .spyOn(mockAuth, 'renewTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const expectedActions = [
        { type: actions.UPDATE_EXPIRATION, data: expiresAt },
        { type: actions.LATEST_ACTIVITY },
        {
          type: actions.LOGIN_SUCCESS,
          data: { name: 'moop', activities: ['something'], states: ['mo'] }
        }
      ];

      await store.dispatch(actions.authCheck());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('if the session is expired, redirect the user to login', () => {
      const store = mockStore({});
      jest
        .spyOn(mockAuth, 'renewTokens')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(mockAuth, 'logoutAndClearTokens')
        .mockImplementation(() => Promise.resolve());

      const expectedActions = [
        { type: actions.LOGOUT_REQUEST },
        { type: actions.LOGOUT_SUCCESS }
      ];

      return store.dispatch(actions.authCheck()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('handle loading data', () => {
    let fetchAllApdsSpy;
    let getUsersSpy;
    let getRolesSpy;

    beforeEach(() => {
      jest.clearAllMocks();

      jest.spyOn(mockAuth, 'authenticateUser').mockImplementation(() =>
        Promise.resolve({
          sessionToken: 'testSessionToken',
          status: 'SUCCESS'
        })
      );
      jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() => Promise.resolve(new Date().getTime() + 5000));
      jest
        .spyOn(mockAuth, 'renewTokens')
        .mockImplementation(() => new Promise(() => {}));
      fetchAllApdsSpy = jest
        .spyOn(mockApp, 'fetchAllApds')
        .mockImplementation(() => {});
      getUsersSpy = jest
        .spyOn(mockAdmin, 'getUsers')
        .mockImplementation(() => {});
      getRolesSpy = jest
        .spyOn(mockAdmin, 'getRoles')
        .mockImplementation(() => {});
    });

    it('creates LOGIN_SUCCESS after successful single factor auth', async () => {
      fetchMock.onGet('/me').reply(200, {
        name: 'moop',
        states: ['MO'],
        activities: ['view-document']
      });

      const store = mockStore({});
      await store.dispatch(actions.login('name', 'secret'));
      await timeout(25);
      expect(fetchAllApdsSpy).toHaveBeenCalled();
      expect(getUsersSpy).not.toHaveBeenCalled();
      expect(getRolesSpy).not.toHaveBeenCalled();
    });
    it('creates LOGIN_SUCCESS after successful single factor auth', async () => {
      fetchMock.onGet('/me').reply(200, {
        name: 'moop',
        activities: ['view-users'],
        states: ['MO']
      });

      const store = mockStore({});
      await store.dispatch(actions.login('name', 'secret'));
      await timeout(25);
      expect(getUsersSpy).toHaveBeenCalled();
      expect(fetchAllApdsSpy).not.toHaveBeenCalled();
      expect(getRolesSpy).not.toHaveBeenCalled();
    });
    it('creates LOGIN_SUCCESS after successful single factor auth', async () => {
      fetchMock.onGet('/me').reply(200, {
        name: 'moop',
        activities: ['view-roles'],
        states: ['MO']
      });

      const store = mockStore({});
      await store.dispatch(actions.login('name', 'secret'));
      await timeout(25);
      expect(getRolesSpy).toHaveBeenCalled();
      expect(fetchAllApdsSpy).not.toHaveBeenCalled();
      expect(getUsersSpy).not.toHaveBeenCalled();
    });
  });

  describe('handling sessions', () => {
    it('extendSession', async () => {
      const expiresAt = new Date().getTime() + 5000;
      jest
        .spyOn(mockAuth, 'renewTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const expectedActions = [
        { type: actions.REQUEST_SESSION_RENEWAL },
        { type: actions.UPDATE_EXPIRATION, data: expiresAt },
        { type: actions.LATEST_ACTIVITY },
        { type: actions.SESSION_RENEWED }
      ];

      const store = mockStore({});
      await store.dispatch(actions.extendSession());
      await timeout(25);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('mfaConfig', () => {
    let getFactorSpy;

    afterEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();
    });

    it('should handle no factor', async () => {
      getFactorSpy = jest
        .spyOn(mockAuth, 'getFactor')
        .mockImplementation(() => Promise.resolve(null));

      const store = mockStore({});

      const expectedActions = [];

      const result = await store.dispatch(
        actions.mfaConfig(MFA_FACTOR_TYPES.SMS, '555-555-5555')
      );
      expect(result).toBeNull();
      expect(getFactorSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should handle bad status', async () => {
      getFactorSpy = jest.spyOn(mockAuth, 'getFactor').mockImplementation(() =>
        Promise.resolve({
          enroll: jest.fn(() =>
            Promise.resolve({
              status: 'MFA_FAILED',
              factor: {
                activation: 'activation'
              }
            })
          )
        })
      );

      const store = mockStore({});

      const expectedActions = [];

      const result = await store.dispatch(
        actions.mfaConfig(MFA_FACTOR_TYPES.SMS, '555-555-5555')
      );
      expect(result).toBeNull();
      expect(getFactorSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('valid factor', () => {
    let getFactorSpy;
    beforeEach(() => {
      getFactorSpy = jest.spyOn(mockAuth, 'getFactor').mockImplementation(() =>
        Promise.resolve({
          enroll: jest.fn(() =>
            Promise.resolve({
              status: 'MFA_ENROLL_ACTIVATE',
              factor: {
                activation: 'activation'
              }
            })
          )
        })
      );
    });

    afterEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();
    });

    it('should redirect the user to activate SMS factor', async () => {
      const store = mockStore({});

      const expectedActions = [
        {
          type: actions.LOGIN_MFA_ENROLL_ACTIVATE,
          data: {
            activationData: 'activation',
            mfaEnrollType: MFA_FACTOR_TYPES.SMS
          }
        }
      ];

      await store.dispatch(
        actions.mfaConfig(MFA_FACTOR_TYPES.SMS, '555-555-5555')
      );
      expect(getFactorSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should redirect the user to activate CALL factor', async () => {
      const store = mockStore({});

      const expectedActions = [
        {
          type: actions.LOGIN_MFA_ENROLL_ACTIVATE,
          data: {
            activationData: 'activation',
            mfaEnrollType: MFA_FACTOR_TYPES.CALL
          }
        }
      ];

      await store.dispatch(
        actions.mfaConfig(MFA_FACTOR_TYPES.CALL, '555-555-5555')
      );
      expect(getFactorSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should redirect the user to activate EMAIL factor', async () => {
      const store = mockStore({});

      const expectedActions = [
        {
          type: actions.LOGIN_MFA_ENROLL_ACTIVATE,
          data: {
            activationData: 'activation',
            mfaEnrollType: MFA_FACTOR_TYPES.EMAIL
          }
        }
      ];

      await store.dispatch(actions.mfaConfig(MFA_FACTOR_TYPES.EMAIL));
      expect(getFactorSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should redirect the user to activate OKTA factor', async () => {
      const store = mockStore({});

      const expectedActions = [
        {
          type: actions.LOGIN_MFA_ENROLL_ACTIVATE,
          data: {
            activationData: 'activation',
            mfaEnrollType: MFA_FACTOR_TYPES.OKTA
          }
        }
      ];

      await store.dispatch(actions.mfaConfig(MFA_FACTOR_TYPES.OKTA));
      expect(getFactorSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should redirect the user to activate PUSH factor', async () => {
      const store = mockStore({});

      const expectedActions = [
        {
          type: actions.LOGIN_MFA_ENROLL_ACTIVATE,
          data: {
            activationData: 'activation',
            mfaEnrollType: MFA_FACTOR_TYPES.PUSH
          }
        }
      ];

      await store.dispatch(actions.mfaConfig(MFA_FACTOR_TYPES.PUSH));
      expect(getFactorSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('mfaAddPhone', () => {
    it('handles adding a phone for SMS', async () => {
      const store = mockStore({});

      const expectedActions = [
        {
          type: actions.LOGIN_MFA_ENROLL_ADD_PHONE,
          data: MFA_FACTOR_TYPES.SMS
        }
      ];

      await store.dispatch(actions.mfaAddPhone(MFA_FACTOR_TYPES.SMS));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('handles adding a phone for SMS', async () => {
      const store = mockStore({});

      const expectedActions = [
        {
          type: actions.LOGIN_MFA_ENROLL_ADD_PHONE,
          data: MFA_FACTOR_TYPES.CALL
        }
      ];

      await store.dispatch(actions.mfaAddPhone(MFA_FACTOR_TYPES.CALL));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('mfaActivate', () => {
    let transactionSpy;
    beforeEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();
    });

    it('should activate a code', async () => {
      transactionSpy = jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            activate: jest.fn(() =>
              Promise.resolve({
                status: 'SUCCESS'
              })
            )
          })
        );

      const expiresAt = new Date().getTime() + 5000;
      jest
        .spyOn(mockAuth, 'setTokens')
        .mockImplementation(() => Promise.resolve(expiresAt));

      const store = mockStore({});
      fetchMock
        .onGet('/me')
        .reply(200, { name: 'moop', activities: [], states: ['MO'] });

      const expectedActions = [
        {
          type: actions.UPDATE_EXPIRATION,
          data: expiresAt
        },
        {
          type: actions.LOGIN_SUCCESS,
          data: {
            name: 'moop',
            activities: [],
            states: ['MO']
          }
        }
      ];

      await store.dispatch(actions.mfaActivate('1234'));
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should not activate a code if the status is not SUCCESS', async () => {
      transactionSpy = jest
        .spyOn(mockAuth, 'retrieveExistingTransaction')
        .mockImplementation(() =>
          Promise.resolve({
            activate: jest.fn(() =>
              Promise.resolve({
                status: 'BAD_STATUS'
              })
            )
          })
        );

      const store = mockStore({});
      const results = await store.dispatch(actions.mfaActivate('1234'));
      expect(transactionSpy).toHaveBeenCalledTimes(1);
      expect(results).toBeNull();
    });
  });

  describe('createAccessRequest', () => {
    beforeEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();

      fetchMock
        .onGet('/me')
        .reply(200, { name: 'moop', activities: [], states: [] });
    });
    it('should handle creating a state affiliation', async () => {
      fetchMock.onPost('/states/fl/affiliations').reply(200);

      const store = mockStore({});
      const expectedActions = [{ type: actions.STATE_ACCESS_REQUEST }];
      const response = await store.dispatch(
        actions.createAccessRequest(['fl'])
      );
      expect(store.getActions()).toEqual(expectedActions);
      expect(response).toEqual('/login/affiliations/thank-you');
    });

    it('should handle creating multiple state affiliations', async () => {
      fetchMock.onPost('/states/fl/affiliations').reply(200);
      fetchMock.onPost('/states/md/affiliations').reply(200);
      fetchMock.onPost('/states/az/affiliations').reply(200);

      const store = mockStore({});
      const expectedActions = [{ type: actions.STATE_ACCESS_REQUEST }];
      const response = await store.dispatch(
        actions.createAccessRequest(['fl', 'md', 'az'])
      );
      expect(store.getActions()).toEqual(expectedActions);
      expect(response).toEqual('/login/affiliations/thank-you');
    });

    it('should handle an error when creating a state affiliation', async () => {
      fetchMock
        .onPost('/states/fl/affiliations')
        .reply(401, { error: 'Unauthorized' });
      const store = mockStore({});
      const expectedActions = [
        {
          type: actions.STATE_ACCESS_REQUEST
        },
        {
          type: actions.LOGIN_FAILURE,
          error: 'Request failed with status code 401'
        }
      ];
      const response = await store.dispatch(
        actions.createAccessRequest(['fl'])
      );
      expect(store.getActions()).toEqual(expectedActions);
      expect(response).toBeNull();
    });

    it('should handle an error when creating multiple state affiliations', async () => {
      fetchMock.onPost('/states/fl/affiliations').reply(200);
      fetchMock
        .onPost('/states/md/affiliations')
        .reply(401, { error: 'Unauthorized' });
      fetchMock.onPost('/states/az/affiliations').reply(200);

      const store = mockStore({});
      const expectedActions = [
        {
          type: actions.STATE_ACCESS_REQUEST
        },
        {
          type: actions.LOGIN_FAILURE,
          error: 'Request failed with status code 401'
        }
      ];
      const response = await store.dispatch(
        actions.createAccessRequest(['fl', 'md', 'az'])
      );
      expect(store.getActions()).toEqual(expectedActions);
      expect(response).toBeNull();
    });
  });

  describe('completeAccessRequest', () => {
    beforeEach(() => {
      fetchMock.reset();
      jest.clearAllMocks();

      fetchMock.onGet('/me').reply(200, {
        name: 'moop',
        activities: ['something'],
        states: ['mo']
      });
    });
    it('should complete the state access request', async () => {
      const store = mockStore({});
      const expectedActions = [
        {
          type: actions.LOGIN_SUCCESS,
          data: {
            name: 'moop',
            activities: ['something'],
            states: ['mo']
          }
        }
      ];
      await store.dispatch(actions.completeAccessRequest());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
