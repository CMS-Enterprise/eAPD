import { shallow } from 'enzyme';
import React from 'react';

import { plain as ExecutiveSummary, mapStateToProps } from './ExecutiveSummary';

describe('executive summary component', () => {
  const props = {
    data: [
      {
        key: 'a1',
        name: 'activity 1',
        summary: 'first activity',
        combined: 950,
        federal: 1050,
        medicaid: 1150
      },
      {
        key: 'a2',
        name: 'activity 2',
        summary: 'second activity',
        combined: 310,
        federal: 2050,
        medicaid: 2150
      }
    ],
    total: {
      combined: 10,
      federal: 20,
      medicaid: 30
    },
    years: ['1', '2']
  };

  test('renders correctly with the modal closed', () => {
    const component = shallow(<ExecutiveSummary {...props} />);
    expect(component).toMatchSnapshot();
  });

  test('renders correctly with the modal open', () => {
    const component = shallow(<ExecutiveSummary {...props} />);
    const review = component
      .find('StandardReview')
      .first()
      .dive();
    review
      .dive()
      .find('Button')
      .simulate('click');
    expect(component).toMatchSnapshot();
  });

  test('maps state to props', () => {
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
              '1': { total: 250 },
              '2': { total: 700 },
              total: { federal: 1050, medicaidShare: 1150, total: 950 }
            }
          },
          a2: {
            costsByFFY: {
              '1': { total: 300 },
              '2': { total: 10 },
              total: { federal: 410, medicaidShare: 510, total: 310 }
            }
          }
        },
        combined: {
          '1': { total: 550 },
          '2': { total: 710 },
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
          medicaid: 1150
        },
        {
          key: 'a2',
          dateRange: 'Dates not specified',
          name: 'activity 2',
          summary: 'second activity',
          combined: 310,
          federal: 410,
          medicaid: 510
        }
      ],
      total: {
        combined: 1260,
        federal: 1360,
        medicaid: 1460
      },
      years: ['1', '2']
    });
  });
});
