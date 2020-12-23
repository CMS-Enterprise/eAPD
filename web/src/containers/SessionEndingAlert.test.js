import React from 'react';
import { shallow } from 'enzyme';

import {
  plain as SessionEndingAlert,
  mapStateToProps,
  mapDispatchToProps
} from './SessionEndingAlert';
import { extendSession, logout } from '../actions/auth';

describe('the session ending alert component', () => {
  it('render as expected if session is not ending and session is not being extended', () => {
    const props = {
      isSessionEnding: false,
      isExtendingSession: false,
      isLoggingOut: false,
      latestActivity: new Date().getTime(),
      expiresAt: new Date().getTime() + 60000,
      extend: jest.fn(),
      logoutAction: jest.fn()
    };
    const component = shallow(<SessionEndingAlert {...props} />);
    expect(component.children().length).toEqual(1);
    expect(component.exists('#react-aria-modal-dialog')).toBe(false);
  });

  it('renders as expected if session is ending and session is not being extended', async () => {
    const props = {
      isSessionEnding: true,
      isExtendingSession: false,
      isLoggingOut: false,
      latestActivity: new Date().getTime() - 300000,
      expiresAt: new Date().getTime() + 60000,
      extend: jest.fn(),
      logoutAction: jest.fn()
    };
    const component = shallow(<SessionEndingAlert {...props} />);
    expect(component.childAt(1)).toBeTruthy();
    const countdown = component
      .childAt(1)
      .dive()
      .dive();
    const aside = countdown.find('aside');
    expect(
      aside
        .childAt(0)
        .dive()
        .text()
    ).toEqual('Continue');
    expect(
      aside
        .childAt(1)
        .dive()
        .text()
    ).toEqual('Sign out');
  });

  it('renders as expected if session is ending and session is not being extended, but new activity', async () => {
    const props = {
      isSessionEnding: true,
      isExtendingSession: false,
      isLoggingOut: false,
      latestActivity: new Date().getTime(),
      expiresAt: new Date().getTime() + 60000,
      extend: jest.fn(),
      logoutAction: jest.fn()
    };

    const component = shallow(<SessionEndingAlert {...props} />);
    expect(
      component
        .childAt(1)
        .dive()
        .equals(<span />)
    ).toBeTruthy();
  });

  it('renders as expected if there is and error and is saving', () => {
    const props = {
      isSessionEnding: true,
      isExtendingSession: true,
      isLoggingOut: false,
      latestActivity: new Date().getTime() - 300000,
      expiresAt: new Date().getTime() + 60000,
      extend: jest.fn(),
      logoutAction: jest.fn()
    };
    const component = shallow(<SessionEndingAlert {...props} />);
    expect(component.childAt(1)).toBeTruthy();
    const countdown = component
      .childAt(1)
      .dive()
      .dive();
    const aside = countdown.find('aside');
    expect(
      aside
        .childAt(0)
        .dive()
        .text()
    ).toEqual('<Spinner /> Continuing');
    expect(
      aside
        .childAt(1)
        .dive()
        .text()
    ).toEqual('Sign out');
  });

  it('renders as expected if there is and error and is signing out', () => {
    const props = {
      isSessionEnding: true,
      isExtendingSession: false,
      isLoggingOut: true,
      latestActivity: new Date().getTime() - 300000,
      expiresAt: new Date().getTime() + 60000,
      extend: jest.fn(),
      logoutAction: jest.fn()
    };
    const component = shallow(<SessionEndingAlert {...props} />);
    expect(component.childAt(1)).toBeTruthy();
    const countdown = component
      .childAt(1)
      .dive()
      .dive();
    const aside = countdown.find('aside');
    expect(
      aside
        .childAt(0)
        .dive()
        .text()
    ).toEqual('Continue');
    expect(
      aside
        .childAt(1)
        .dive()
        .text()
    ).toEqual('<Spinner /> Signing out');
  });

  it('maps redux state to component props', () => {
    const latestActivity = new Date().getTime();
    const expiresAt = new Date().getTime + 60000;
    expect(
      mapStateToProps({
        auth: {
          isSessionEnding: false,
          isExtendingSession: false,
          isLoggingOut: false,
          latestActivity,
          expiresAt
        }
      })
    ).toEqual({
      isSessionEnding: false,
      isExtendingSession: false,
      isLoggingOut: false,
      latestActivity,
      expiresAt
    });
  });

  it('maps redux actions to component props', () => {
    expect(mapDispatchToProps).toEqual({
      extend: extendSession,
      logoutAction: logout
    });
  });
});
