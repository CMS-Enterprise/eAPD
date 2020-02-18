import { shallow } from 'enzyme';
import React from 'react';

import {
  plain as StatePersonnel,
  mapStateToProps,
  mapDispatchToProps
} from './StatePersonnel';

import { addPersonnel, removePersonnel } from '../../actions/editActivity';

describe('activity state personnel costs subsection', () => {
  const props = {
    activityIndex: 72,
    add: jest.fn(),
    personnel: [
      {
        category: 'test category',
        desc: 'test desc',
        key: 'personnel key',
        years: {
          2027: 34355,
          2028: 48833
        }
      }
    ],
    remove: jest.fn()
  };
  const component = shallow(<StatePersonnel {...props} />);

  beforeEach(() => {
    props.add.mockClear();
    props.remove.mockClear();
  });

  it('renders correctly', () => {
    expect(component).toMatchSnapshot();
  });

  describe('events', () => {
    const list = component.find('FormAndReviewList');

    it('handles adding a new state person', () => {
      list.prop('onAddClick')();
      expect(props.add).toHaveBeenCalledWith(72);
    });

    it('handles deleting a state person', () => {
      list.prop('onDeleteClick')(0);
      expect(props.remove).toHaveBeenCalledWith(72, 0);
    });
  });

  it('maps state to props', () => {
    expect(
      mapStateToProps(
        {
          apd: {
            data: {
              activities: [
                {
                  statePersonnel: 'these are personnel'
                },
                {}
              ]
            }
          }
        },
        { activityIndex: 0 }
      )
    ).toEqual({ personnel: 'these are personnel' });
  });

  it('maps dispatch actions to props', () => {
    expect(mapDispatchToProps).toEqual({
      add: addPersonnel,
      remove: removePersonnel
    });
  });
});
