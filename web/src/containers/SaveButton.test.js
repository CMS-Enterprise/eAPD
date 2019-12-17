import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { saveApd } from '../actions/app';

import {
  plain as SaveButton,
  mapStateToProps,
  mapDispatchToProps
} from './SaveButton';

describe('save button component', () => {
  const props = {
    error: false,
    needsSave: false,
    saveApd: sinon.spy(),
    working: false
  };

  beforeEach(() => {
    props.saveApd.resetHistory();
  });

  test('renders if does not need saving, not working, no error', () => {
    expect(shallow(<SaveButton {...props} />)).toMatchSnapshot();
  });

  test('renders if needs saving, not working, no error', () => {
    expect(shallow(<SaveButton {...props} needsSave />)).toMatchSnapshot();
  });

  test('renders if does not need saving, working, no error', () => {
    expect(shallow(<SaveButton {...props} working />)).toMatchSnapshot();
  });

  test('renders if needs saving, working, no error', () => {
    expect(
      shallow(<SaveButton {...props} needsSave working />)
    ).toMatchSnapshot();
  });

  test('calls saveApd action when save button is clicked', () => {
    const component = shallow(<SaveButton {...props} />);
    component.find('Button').simulate('click');

    expect(props.saveApd.calledOnce).toEqual(true);
  });

  describe('handles changing based on behavior', () => {
    test('shows error alert if save fails', () => {
      // Render it in a good state, click save, then...
      const component = shallow(<SaveButton {...props} />);
      component.find('Button').simulate('click');

      component.setProps({ error: 'Now there is an error' });
      expect(component).toMatchSnapshot();
    });

    test('shows success alert if saved', () => {
      // This tests needs to wait for time to pass, so set the Jest timeout
      // to something long enough.
      jest.setTimeout(6000);

      // Render it in a good state, click save, then...
      const component = shallow(<SaveButton {...props} working />);
      component.find('Button').simulate('click');

      component.setProps({ working: false });
      expect(component).toMatchSnapshot();

      // Now make sure the alert goes away.  Need to return a promise so Jest
      // knows to wait.
      return new Promise(resolve => {
        setTimeout(() => {
          expect(component).toMatchSnapshot();
          resolve();
        }, 5500);
      });
    });
  });

  test('maps state to props', () => {
    const state = {
      errors: {
        saveApd: 'save apd error'
      },
      patch: [],
      working: {
        saveApd: 'save apd working'
      }
    };

    expect(mapStateToProps(state)).toEqual({
      error: 'save apd error',
      needsSave: false,
      working: 'save apd working'
    });
  });

  test('maps dispatch to props', () => {
    expect(mapDispatchToProps).toEqual({ saveApd });
  });
});
