import { shallow } from 'enzyme';
import React from 'react';

import {
  plain as ExecutiveSummary,
  mapDispatchToProps,
  mapStateToProps
} from './ExecutiveSummary';
import { jumpTo } from '../actions/app';

let mockPush;

jest.mock('react-router-dom', () => {
  mockPush = jest.fn();
  return {
    useHistory: jest.fn().mockReturnValue({ push: mockPush }),
    useRouteMatch: jest.fn().mockReturnValue({ path: '---path---' })
  };
});

global.scrollTo = jest.fn();

describe('executive summary component', () => {
  const props = {
    data: [
      {
        key: 'a1',
        name: 'activity 1',
        summary: 'first activity',
        combined: 950,
        federal: 1050,
        medicaid: 1150,
        ffys: {
          '1': {
            total: 5232,
            federal: 2883,
            medicaidShare: 23626
          },
          '2': {
            total: 848622,
            federal: 826,
            medicaidShare: 2468252
          }
        }
      },
      {
        key: 'a2',
        name: 'activity 2',
        summary: 'second activity',
        combined: 310,
        federal: 2050,
        medicaid: 2150,
        ffys: {
          '1': {
            total: 26926,
            federal: 2356,
            medicaidShare: 989264
          },
          '2': {
            total: 54634738,
            federal: 643,
            medicaidShare: 73
          }
        }
      }
    ],
    jumpAction: jest.fn(),
    total: {
      combined: 10,
      federal: 20,
      medicaid: 30,
      ffys: {
        '1': {
          total: 5232,
          federal: 2883,
          medicaidShare: 23626
        },
        '2': {
          total: 848622,
          federal: 826,
          medicaidShare: 2468252
        }
      }
    },
    years: ['1', '2']
  };

  it('renders correctly', () => {
    const component = shallow(<ExecutiveSummary {...props} />);
    expect(component).toMatchSnapshot();
  });

  test('navigates to activities', () => {
    const component = shallow(<ExecutiveSummary {...props} />);
    expect(component).toMatchSnapshot();

    const e = {
      stopPropagation: jest.fn(),
      preventDefault: jest.fn()
    };

    const review = component
      .find('Review')
      .first()
      .dive();
    review
      .dive()
      .find('Button')
      .simulate('click', e);

    // cancels the click
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();

    // updates nav state, navigates, and scrolls up
    expect(props.jumpAction).toHaveBeenCalledWith('activity-a1-overview');
    expect(mockPush).toHaveBeenCalledWith('/apd/activity/0');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('maps state to props', () => {
    const state = {
      apd: {
        data: {
          activities: [
            {
              key: 'a1',
              name: 'activity 1',
              // Hiram Revels is seated to the United States Senate
              plannedEndDate: '1870-02-25',
              // Shirley Chisholm is seated to the United States House of Representatives
              plannedStartDate: '1969-01-03',
              summary: 'first activity'
            },
            {
              key: 'a2',
              name: 'activity 2',
              summary: 'second activity'
            }
          ],
          years: ['1', '2']
        }
      },
      budget: {
        activities: {
          a1: {
            costsByFFY: {
              '1': 'a1 ffy 1 costs',
              '2': 'a1 ffy 2 costs',
              total: { federal: 1050, medicaidShare: 1150, total: 950 }
            }
          },
          a2: {
            costsByFFY: {
              '1': 'a2 ffy 1 costs',
              '2': 'a2 ffy 2 costs',
              total: { federal: 410, medicaidShare: 510, total: 310 }
            }
          }
        },
        combined: {
          '1': 'ffy 1 combined costs',
          '2': 'ffy 2 combined costs',
          total: { federal: 1360, medicaid: 1460, total: 1260 }
        }
      }
    };

    expect(mapStateToProps(state)).toEqual({
      data: [
        {
          key: 'a1',
          dateRange: '1/3/1969 - 2/25/1870',
          name: 'activity 1',
          summary: 'first activity',
          combined: 950,
          federal: 1050,
          medicaid: 1150,
          ffys: {
            '1': 'a1 ffy 1 costs',
            '2': 'a1 ffy 2 costs'
          }
        },
        {
          key: 'a2',
          dateRange: 'Dates not specified',
          name: 'activity 2',
          summary: 'second activity',
          combined: 310,
          federal: 410,
          medicaid: 510,
          ffys: {
            '1': 'a2 ffy 1 costs',
            '2': 'a2 ffy 2 costs'
          }
        }
      ],
      total: {
        combined: 1260,
        federal: 1360,
        medicaid: 1460,
        ffys: {
          '1': 'ffy 1 combined costs',
          '2': 'ffy 2 combined costs'
        }
      },
      years: ['1', '2']
    });
  });

  it('maps dispatch actions to props', () => {
    expect(mapDispatchToProps).toEqual({ jumpAction: jumpTo });
  });
});
