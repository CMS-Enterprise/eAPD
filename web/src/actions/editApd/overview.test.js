import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { UPDATE_BUDGET } from '../budget';

import { ADD_APD_YEAR, EDIT_APD, REMOVE_APD_YEAR } from './symbols';
import {
  addYear,
  removeYear,
  setNarrativeForHIT,
  setNarrativeForHIE,
  setNarrativeForMMIS,
  setProgramOverview
} from './overview';

const mockStore = configureStore([thunk]);

describe('APD edit actions for adding or removing APD years', () => {
  it('dispatchs an action for adding an APD year', () => {
    const store = mockStore('add year state');

    store.dispatch(addYear('1234'));

    expect(store.getActions()).toEqual([
      {
        type: ADD_APD_YEAR,
        value: '1234',
        state: 'add year state'
      },
      {
        type: UPDATE_BUDGET,
        state: 'add year state'
      }
    ]);
  });

  it('dispatchs an action for removing an APD year', () => {
    const store = mockStore('remove year state');

    store.dispatch(removeYear('1234'));

    expect(store.getActions()).toEqual([
      {
        type: REMOVE_APD_YEAR,
        value: '1234',
        state: 'remove year state'
      },
      {
        type: UPDATE_BUDGET,
        state: 'remove year state'
      }
    ]);
  });
});

describe('APD edit actions for APD summary and HIE/HIT/MMIS narratives', () => {
  it('dispatches an action for setting the program overview', () => {
    expect(setProgramOverview('overview')).toEqual({
      type: EDIT_APD,
      path: '/programOverview',
      value: 'overview'
    });
  });

  it('dispatches an action for setting the HIT narrative', () => {
    expect(setNarrativeForHIT('narrative')).toEqual({
      type: EDIT_APD,
      path: '/narrativeHIT',
      value: 'narrative'
    });
  });

  it('dispatches an action for setting the HIE narrative', () => {
    expect(setNarrativeForHIE('narrative')).toEqual({
      type: EDIT_APD,
      path: '/narrativeHIE',
      value: 'narrative'
    });
  });

  it('dispatches an action for setting the MMIS narrative', () => {
    expect(setNarrativeForMMIS('narrative')).toEqual({
      type: EDIT_APD,
      path: '/narrativeMMIS',
      value: 'narrative'
    });
  });
});
