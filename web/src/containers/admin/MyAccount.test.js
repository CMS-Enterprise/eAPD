import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import {
  plain as MyAccount,
  mapStateToProps,
  mapDispatchToProps
} from './MyAccount';

import { editSelf as editSelfDispatch } from '../../actions/admin';

describe('my account page', () => {
  test('maps dispatch to props', () => {
    expect(mapDispatchToProps).toEqual({ editAccount: editSelfDispatch });
  });

  test('maps state to props', () => {
    expect(
      mapStateToProps({
        user: {
          data: {
            username: 'tina@burgers.com',
            ignores: 'unnecessary state',
            name: 'Tina Belcher',
            phone: '1-800-BURGERS',
            position: 'Table Cleaner'
          },
          fetching: 'aw thank you'
        }
      })
    ).toEqual({
      fetching: 'aw thank you',
      user: {
        name: 'Tina Belcher',
        phone: '1-800-BURGERS',
        position: 'Table Cleaner'
      }
    });
  });

  test('renders', () => {
    const user = {
      name: 'Tina Belcher',
      phone: '1-800-BURGERS',
      position: 'Table Cleaner'
    };

    const component = shallow(
      <MyAccount
        editAccount={() => {}}
        fetching={false}
        history={{}}
        user={user}
      />
    );

    // basic rendering
    expect(component).toMatchSnapshot();

    // updated after changing a text field
    component.find('TextField[name="position"]').simulate('change', {
      target: { name: 'position', value: 'Window Washer' }
    });
    expect(component).toMatchSnapshot();

    // updated after enabling password change
    component.find('Button[purpose="change password"]').simulate('click');
    expect(component).toMatchSnapshot();

    // while fetching
    expect(
      shallow(
        <MyAccount editAccount={() => {}} fetching history={{}} user={user} />
      )
    ).toMatchSnapshot();
  });

  test('handles submitting the form', () => {
    const user = {
      name: 'Tina Belcher',
      phone: '1-800-BURGERS',
      position: 'Table Cleaner'
    };

    const editAccount = sinon.spy();
    const preventDefault = sinon.spy();

    const component = shallow(
      <MyAccount
        editAccount={editAccount}
        fetching={false}
        history={{}}
        user={user}
      />
    );

    component.find('form').simulate('submit', { preventDefault });

    expect(preventDefault.calledOnce).toEqual(true);
    expect(editAccount.calledWith(user)).toEqual(true);
  });

  test('handles going back', () => {
    const user = {
      name: 'Tina Belcher',
      phone: '1-800-BURGERS',
      position: 'Table Cleaner'
    };

    const goBack = sinon.spy();

    const component = shallow(
      <MyAccount
        editAccount={() => {}}
        fetching={false}
        history={{ goBack }}
        user={user}
      />
    );

    component.find('Button[purpose="cancel"]').simulate('click');

    expect(goBack.calledOnce).toEqual(true);
  });
});
