import { shallow, mount } from 'enzyme';
import React from 'react';

import { plain as KeyPersonForm, mapDispatchToProps } from './ApdKeyPersonForm';

import { saveKeyPersonnel } from '../../actions/editApd';

describe('the ApdKeyPersonForm component', () => {
  const props = {
    index: 1,
    item: {
      costs: {
        1992: 100,
        1993: 300
      },
      email: 'email address',
      hasCosts: true,
      key: 'person key',
      name: 'Bob the Builder',
      fte: {
        1992: 0.32,
        1993: 0.57
      },
      position: 'The Builder'
    },

    savePerson: jest.fn(),

    years: ['1992', '1993']
  };

  const component = mount(<KeyPersonForm {...props} />);

  beforeEach(() => {
    props.savePerson.mockClear();
  });

  it('renders correctly', () => {
    expect(component).toMatchSnapshot();
  });

  it('renders correctly if the person is a primary contact', () => {
    expect(shallow(<KeyPersonForm {...props} index={0} />)).toMatchSnapshot();
  });

  it('renders correctly if the person does not have costs', () => {
    expect(
      shallow(
        <KeyPersonForm {...props} item={{ ...props.item, hasCosts: false }} />
      )
    ).toMatchSnapshot();
  });

  describe('events', () => {
    it('handles submitting the form', () => {
      component
        .find('form')
        .simulate('submit');

      expect(props.savePerson).toHaveBeenCalled();
    });
  });

  it('maps dispatch to props', () => {
    expect(mapDispatchToProps).toEqual({
      savePerson: saveKeyPersonnel
    });
  });
});
