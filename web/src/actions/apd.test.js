import MockAdapter from 'axios-mock-adapter';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import * as actions from './apd';
import * as appActions from './app';
import { UPDATE_BUDGET } from './budget';
import axios from '../util/api';

const mockStore = configureStore([thunk]);
const fetchMock = new MockAdapter(axios);

describe('apd actions', () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  it('requestApd should create GET_APD_REQUEST action', () => {
    expect(actions.requestApd()).toEqual({ type: actions.GET_APD_REQUEST });
  });

  it('receiveApd should create GET_APD_SUCCESS action', () => {
    const data = { name: 'foo' };
    expect(actions.receiveApd(data)).toEqual({
      type: actions.GET_APD_SUCCESS,
      data
    });
  });

  it('failApd should create GET_APD_FAILURE action', () => {
    expect(actions.failApd('foo')).toEqual({
      type: actions.GET_APD_FAILURE,
      error: 'foo'
    });
  });

  it('requestSave should create SAVE_APD_REQUEST action', () => {
    expect(actions.requestSave()).toEqual({ type: actions.SAVE_APD_REQUEST });
  });

  it('saveSuccess should create SAVE_APD_SUCCESS action', () => {
    expect(actions.saveSuccess()).toEqual({ type: actions.SAVE_APD_SUCCESS });
  });

  it('saveFailure should create SAVE_APD_FAILURE action', () => {
    expect(actions.saveFailure()).toEqual({ type: actions.SAVE_APD_FAILURE });
  });

  it('selectApdOnLoad should create SET_SELECT_APD_ON_LOAD action if user is not an admin', async () => {
    const store = mockStore({ user: { data: { role: 'not an admin' } } });

    await store.dispatch(actions.selectApdOnLoad());

    expect(store.getActions()).toEqual([
      {
        type: actions.SET_SELECT_APD_ON_LOAD
      }
    ]);
  });

  it('selectApdOnLoad should do nothing if user is an admin', async () => {
    const store = mockStore({ user: { data: { role: 'admin' } } });

    await store.dispatch(actions.selectApdOnLoad());

    expect(store.getActions()).toEqual([]);
  });

  it('selectAPD should create SELECT_APD action, redirect to provided route, and save APD ID to local storage', async () => {
    const apd = {
      id: 'apd-id',
      selected: 'apd goes here',
      federalCitations: { already: 'exists' }
    };
    fetchMock.onGet('/apds/apd-id').reply(200, apd);

    const deserialize = sinon.stub().returns('deserialized apd');

    const state = { apd: { byId: { apdID: 'hello there' } } };
    const store = mockStore(state);
    const testRoute = '/test';

    const global = { localStorage: { setItem: sinon.stub() } };
    const pushRoute = route => ({ type: 'FAKE_PUSH', pushRoute: route });

    const expectedActions = [
      { type: appActions.SELECT_APD, apd: 'deserialized apd' },
      { type: UPDATE_BUDGET, state },
      { type: 'FAKE_PUSH', pushRoute: testRoute }
    ];

    await store.dispatch(
      appActions.selectApd('apd-id', '/test', {
        deserialize,
        global,
        pushRoute
      })
    );

    expect(store.getActions()).toEqual(expectedActions);
    expect(global.localStorage.setItem.calledWith('last-apd-id', 'apdID'));
    expect(deserialize.calledWith(apd)).toEqual(true);
  });

  it('createRequest should create CREATE_APD_REQUEST action', () => {
    expect(actions.createRequest()).toEqual({
      type: actions.CREATE_APD_REQUEST
    });
  });

  it('createSuccess should create CREATE_APD_SUCCESS action', () => {
    expect(actions.createSuccess()).toEqual({
      type: actions.CREATE_APD_SUCCESS
    });
  });

  it('createFailure should create CREATE_APD_FAILURE action', () => {
    expect(actions.createFailure()).toEqual({
      type: actions.CREATE_APD_FAILURE
    });
  });

  describe('create APD', () => {
    // TODO: But for real.
    it('adds the new APD to the store and switches to it on success', () => {
      const newapd = { id: 'bloop', federalCitations: { already: 'exist' } };
      fetchMock.onPost('/apds').reply(200, newapd);

      const apd = { id: 'apd-id', federalCitations: { already: 'exist' } };
      const deserialize = sinon.stub().returns(apd);

      fetchMock.onGet('/apds/apd-id').reply(200, apd);

      const pushRoute = route => ({ type: 'FAKE_PUSH', pushRoute: route });
      const state = {
        apd: {
          byId: {
            bloop: { hello: 'world' }
          }
        }
      };
      const store = mockStore(state);

      const expectedActions = [
        { type: actions.CREATE_APD_REQUEST },
        { type: actions.CREATE_APD_SUCCESS, data: apd },
        { type: appActions.SELECT_APD, apd },
        { type: UPDATE_BUDGET, state },
        { type: 'FAKE_PUSH', pushRoute: '/apd' }
      ];

      return store
        .dispatch(actions.createApd({ deserialize, pushRoute }))
        .then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
    });

    it('does not do very much if it fails, either', () => {
      fetchMock.onPost('/apds').reply(403);
      const store = mockStore();

      const expectedActions = [
        { type: actions.CREATE_APD_REQUEST },
        { type: actions.CREATE_APD_FAILURE }
      ];

      return store.dispatch(actions.createApd()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('delete an APD', () => {
    it('should handle an API error', () => {
      const store = mockStore();
      fetchMock.onDelete('/apds/apd-id').reply(400);

      return store.dispatch(actions.deleteApd('apd-id')).then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.DELETE_APD_REQUEST },
          { type: actions.DELETE_APD_FAILURE }
        ]);
      });
    });

    it('should handle an API success', () => {
      const store = mockStore();
      const fetch = sinon.stub().returns({ type: 'apd fetch' });
      fetchMock.onDelete('/apds/apd-id').reply(200);

      return store.dispatch(actions.deleteApd('apd-id', { fetch })).then(() => {
        expect(store.getActions()).toEqual([
          { type: actions.DELETE_APD_REQUEST },
          { type: actions.DELETE_APD_SUCCESS },
          { type: 'apd fetch' }
        ]);
      });
    });
  });

  describe('fetchApd (async)', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    describe('creates GET_APD_SUCCESS after successful APD fetch', () => {
      it('does not select an APD by default', () => {
        const store = mockStore({ apd: { selectAPDOnLoad: false } });
        fetchMock
          .onGet('/apds')
          .reply(200, [
            { foo: 'bar', status: 'draft' },
            { foo: 'bar', status: 'archived' }
          ]);

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          {
            type: actions.GET_APD_SUCCESS,
            // expected the archived APD to have been removed
            data: [{ foo: 'bar', status: 'draft' }]
          }
        ];

        return store.dispatch(actions.fetchApd()).then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
      });

      it('does not select an APD if there is no local storage', () => {
        const store = mockStore({ apd: { selectAPDOnLoad: true } });
        fetchMock.onGet('/apds').reply(200, [{ foo: 'bar' }]);

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          { type: actions.GET_APD_SUCCESS, data: [{ foo: 'bar' }] }
        ];

        const global = {};

        return store.dispatch(actions.fetchApd({ global })).then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
      });

      it('does not select an APD if local storage does not contain a last APD ID', () => {
        const store = mockStore({ apd: { selectAPDOnLoad: true } });
        fetchMock.onGet('/apds').reply(200, [{ foo: 'bar' }]);

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          { type: actions.GET_APD_SUCCESS, data: [{ foo: 'bar' }] }
        ];

        const global = {
          localStorage: { getItem: sinon.stub().returns(null) }
        };

        return store.dispatch(actions.fetchApd({ global })).then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
      });

      it('selects an APD if local storage contains a last APD ID', async () => {
        const state = {
          apd: { selectAPDOnLoad: true }
        };
        const store = mockStore(state);
        fetchMock.onGet('/apds').reply(200, [{ foo: 'bar' }]);

        const pushRoute = route => ({ type: 'FAKE_PUSH', pushRoute: route });

        const select = sinon.stub().returns({ type: 'SELECT_MOCK' });

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          { type: actions.GET_APD_SUCCESS, data: [{ foo: 'bar' }] },
          { type: 'SELECT_MOCK' }
        ];

        const global = {
          localStorage: {
            getItem: sinon.stub().returns('7'),
            setItem: sinon.spy()
          }
        };

        await store.dispatch(actions.fetchApd({ global, pushRoute, select }));

        expect(store.getActions()).toEqual(expectedActions);
        expect(select.calledWith('7', { global, pushRoute })).toEqual(true);
      });
    });

    it('creates GET_APD_FAILURE after unsuccessful APD fetch', () => {
      const store = mockStore({});
      fetchMock.onGet('/apds').reply(403, 'foo');

      const expectedActions = [
        { type: actions.GET_APD_REQUEST },
        { type: actions.GET_APD_FAILURE, error: 'foo' }
      ];

      return store.dispatch(actions.fetchApd()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('fetch APD data if needed (async)', () => {
    it('fetches data if it is not already loaded', async () => {
      const store = mockStore({
        apd: {
          loaded: false
        }
      });

      const expectedActions = [{ type: actions.GET_APD_REQUEST }];

      await store.dispatch(actions.fetchApdDataIfNeeded());
      expect(store.getActions()).toEqual(
        expect.arrayContaining(expectedActions)
      );
    });

    it('does not fetch data if it is already loaded', async () => {
      const store = mockStore({
        apd: {
          loaded: true
        }
      });

      await store.dispatch(actions.fetchApdDataIfNeeded());
      expect(store.getActions()).toEqual([]);
    });
  });

  describe('save APD to API', () => {
    const serialize = sinon.mock();
    const serializedApd = {
      activities: [
        {
          alternatives: 'alternatives approach',
          contractorResources: 'contractors',
          costAllocation: 'give us those dollars',
          costAllocationNarrative: 'cost allocation narrative',
          description: 'activity description',
          expenses: 'paper, pens, airplanes, and bouncy castles',
          fundingSource: 'funding source',
          goals: 'build the best Medicaid IT system ever seen',
          id: 'activity 1',
          key: 'activity 1',
          name: 'activity name',
          schedule: 'before the heat death of the universe',
          standardsAndConditions: 'florp',
          statePersonnel: 'the people who work here',
          summary: 'activity summary',
          quarterlyFFP: 'we want money a little at a time'
        },
        {
          alternatives: 'alternatives approach 2',
          costAllocationDesc: 'cost allocation methodology 2',
          description: 'activity description 2',
          fundingSource: 'funding source 2',
          id: 'activity 2',
          key: 'activity 2',
          name: 'activity 2 name',
          otherFundingDesc: 'other funding sources 2',
          summary: 'activity summary 2'
        }
      ],
      federalCitations: 'CFR 395.2362.472462.2352.36 (b) three',
      id: 'id-to-update',
      incentivePayments: 'money to do good work',
      narrativeHIE: 'HIE narrative text',
      narrativeHIT: 'HIT narrative text',
      narrativeMMIS: 'MMIS narrative text',
      programOverview: 'APD overview text',
      pointsOfContact: 'people to call if stuff goes sour',
      previousActivityExpenses: 'money we spent last time',
      previousActivitySummary: 'other activities happened in the past',
      stateProfile: 'we like long walks on the beach',
      summary: 'apd summary',
      years: ['1992', '1993']
    };

    const state = {
      notification: { open: false, queue: [] },
      apd: {
        data: {
          id: 'id-to-update'
        }
      },
      activities: {},
      patch: []
    };

    beforeEach(() => {
      serialize.resetBehavior();
      serialize.resetHistory();

      // Create a new cloned object for each test because
      // the APD action mutates the returned value.  If
      // we don't reset, each test begins with the results
      // of the previous test's mutations. 😬
      serialize.returns(JSON.parse(JSON.stringify(serializedApd)));

      state.patch = ['these', 'get', 'sent', 'off'];

      fetchMock.reset();
    });

    it('creates save request but does not actually send save if not dirty', () => {
      state.patch.length = 0;
      const store = mockStore(state);
      fetchMock.onPatch('/apds/id-to-update').reply(403, [{ foo: 'bar' }]);

      const expectedActions = [{ type: actions.SAVE_APD_REQUEST }];

      return store.dispatch(actions.saveApd({ serialize })).catch(() => {
        expect(store.getActions()).toEqual(expectedActions);
        expect(serialize.calledWith(state.apd.data, state.activities)).toEqual(
          true
        );
      });
    });

    it('creates save request and logged-out actions if the user is not logged in', () => {
      const store = mockStore(state);
      fetchMock.onPatch('/apds/id-to-update').reply(403, [{ foo: 'bar' }]);

      const expectedActions = [
        { type: actions.SAVE_APD_REQUEST },
        { type: actions.SAVE_APD_FAILURE, data: 'save-apd.not-logged-in' }
      ];

      return store.dispatch(actions.saveApd()).catch(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('creates save request and save failure actions if the save fails', () => {
      const store = mockStore(state);
      fetchMock.onPatch('/apds/id-to-update').reply(400, [{ foo: 'bar' }]);

      const expectedActions = [
        { type: actions.SAVE_APD_REQUEST },
        { type: actions.SAVE_APD_FAILURE }
      ];

      return store.dispatch(actions.saveApd()).catch(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('saves and does all the good things', () => {
      const updatedApd = {};
      const store = mockStore(state);

      fetchMock.onPatch('/apds/id-to-update').reply(200, updatedApd);

      const expectedActions = [
        { type: actions.SAVE_APD_REQUEST },
        { type: actions.SAVE_APD_SUCCESS, data: updatedApd }
      ];

      return store.dispatch(actions.saveApd()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
