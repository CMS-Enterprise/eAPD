import React from 'react';
import { renderWithConnection, screen } from 'apd-testing-library';

import ApdApplication, {
  mapStateToProps,
  mapDispatchToProps
} from './ApdApplication';
import { setApdToSelectOnLoad, selectApd } from '../actions/app';
import apd from '../fixtures/ak-apd.json';
import budget from '../fixtures/ak-budget.json';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ apdId: 1 })
}));

const user = {
  user: {
    data: {
      state: {
        id: 'ak',
        name: 'Alaska',
        medicaid_office: {
          medicaidDirector: {
            name: 'Cornelius Fudge',
            email: 'c.fudge@ministry.magic',
            phone: '5551234567'
          },
          medicaidOffice: {
            address1: '100 Round Sq',
            address2: '',
            city: 'Cityville',
            state: 'AK',
            zip: '12345'
          }
        }
      }
    }
  }
};

const setup = (props = {}, options = {}) => {
  return renderWithConnection(<ApdApplication {...props} />, options);
};

describe('apd (application) component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for non-admin, APD already selected', () => {
    setup(null, {
      initialState: {
        ...user,
        ...apd,
        ...budget
      },
      initialHistory: ['/apd/1']
    });

    expect(screen.getByText(/HITECH IAPD | FFY 2020-2021/)).toBeTruthy();
  });

  it('renders correct for non-admin, APD selected in URL', () => {
    const { history } = setup(null, {
      initialState: {
        ...user
      },
      initialHistory: ['/apd/1']
    });

    expect(history.length).toEqual(1);
    expect(history.location.pathname).toEqual('/apd/1');
  });

  it('renders correctly for non-admin, no APD selected', () => {
    const useParams = jest.fn().mockReturnValue({});
    const { history } = setup(
      {
        useParams
      },
      {
        initialState: {
          ...user
        },
        initialHistory: ['/apd']
      }
    );

    expect(history.length).toEqual(2);
    expect(history.location.pathname).toEqual('/');
  });

  it('renders correctly for admin', () => {
    const { history } = setup(null, {
      initialState: {
        user: {
          data: {
            role: 'admin',
            state: {
              id: 'ak',
              name: 'Alaska',
              medicaid_office: {
                medicaidDirector: {
                  name: 'Cornelius Fudge',
                  email: 'c.fudge@ministry.magic',
                  phone: '5551234567'
                },
                medicaidOffice: {
                  address1: '100 Round Sq',
                  address2: '',
                  city: 'Cityville',
                  state: 'AK',
                  zip: '12345'
                }
              }
            }
          }
        },
        ...apd,
        ...budget
      },
      initialHistory: ['/apd/1']
    });
    expect(history.length).toEqual(1);
    expect(history.location.pathname).toEqual('/');
  });

  test('maps state to props', () => {
    const state = {
      apd: {
        data: {
          created: 'creation date',
          id: 123456789,
          name: 'florp',
          years: ['dinkus', 'dorkus', 'durkus']
        }
      },
      user: {
        data: {
          state: 'place',
          role: 'test role'
        }
      }
    };

    expect(mapStateToProps(state)).toEqual({
      apdId: 123456789,
      isAdmin: false,
      place: 'place',
      userRole: 'test role'
    });

    state.apd.data.id = null;
    delete state.apd.data.years;

    expect(mapStateToProps(state)).toEqual({
      apdId: null,
      isAdmin: false,
      place: 'place',
      userRole: 'test role'
    });
  });

  test('maps dispatch to props', () => {
    jest.restoreAllMocks();
    expect(mapDispatchToProps).toEqual({
      selectApd,
      setApdToSelectOnLoad
    });
  });
});
