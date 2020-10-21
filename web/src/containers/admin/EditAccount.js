import {
  Button,
  Dropdown,
  TextField
} from '@cmsgov/design-system';
import PropTypes from 'prop-types';
import React, { Fragment, useState, useMemo } from 'react';
import { connect } from 'react-redux';

import { editAccount as editAccountDispatch } from '../../actions/admin';
import CardForm from '../../components/CardForm';
import Password from '../../components/PasswordWithMeter';
import { LockIcon, UnlockIcon } from '../../components/Icons';
import { selectUsersSorted } from '../../reducers/admin';
import { getEditAccountError } from '../../reducers/errors';
import { getEditAccountWorking } from '../../reducers/working';
import { toSentenceCase } from '../../util';

import { usStatesDropdownOptions } from '../../util/states';

const EditAccount = ({
  currentUser,
  editAccount,
  error,
  roles,
  users,
  working
}) => {
  const [changePassword, setChangePassword] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [userID, setUserID] = useState('');
  const [user, setUser] = useState(null);

  // Success has to be derived.  It can't be stored in the app state because
  // if it was, then the next time this form was loaded, it would show the
  // success state even though it wouldn't be accurate anymore.
  const success = useMemo(() => hasFetched && !working && !error, [
    error,
    hasFetched,
    working
  ]);

  const handlePickAccount = ({ target: { value } }) => {
    const newUser = users
      .filter(u => u.id === +value)
      .reduce((_, u) => u, null);
    setUserID(+value);
    setUser({ ...newUser, state: newUser.state.id });
  };

  const changeUserEmail = ({ target: { value } }) =>
    setUser({ ...user, username: value });
  const changeUserName = ({ target: { value } }) =>
    setUser({ ...user, name: value });
  const changeUserPassword = ({ target: { value } }) =>
    setUser({ ...user, password: value });
  const changeUserPhone = ({ target: { value } }) =>
    setUser({ ...user, phone: value });
  const changeUserPosition = ({ target: { value } }) =>
    setUser({ ...user, position: value });
  const changeUserRole = ({ target: { value } }) =>
    setUser({ ...user, role: value });

  const changeUserState = ({ target: { value } }) =>
    setUser({ ...user, state: value });

  const saveAccount = e => {
    e.preventDefault();
    // Once we've attempted to save these changes, it's valid to show success
    // or error messages.  Since error messages are persisted in app state,
    // it's possible there's an error sitting there from a previous instance
    // of this form.  This flag makes sure we don't show any error messages
    // until this instance of the form has tried to save.
    setHasFetched(true);
    editAccount(user, changePassword);
  };

  const toggleChangePassword = e => {
    e.preventDefault();
    setChangePassword(!changePassword);
  };

  const formRoles = roles.map(r => ({ label: toSentenceCase(r.name), value: r.name }));
  formRoles.unshift({ label: "None", value: "" });

  const getForm = () => {
    if (user) {
      const { name, password, phone, position, state, username, role } = user;

      return (
        <Fragment>
          <hr />

          <TextField
            ariaLabel="please enter the user's full name"
            label="Name"
            name="name"
            value={name || ''}
            onChange={changeUserName}
          />

          <TextField
            label="Email"
            name="username"
            value={username}
            onChange={changeUserEmail}
          />

          <TextField
            label="Phone number"
            name="phone"
            size="medium"
            mask="phone"
            value={phone || ''}
            onChange={changeUserPhone}
          />

          <TextField
            label="Position"
            name="position"
            value={position || ''}
            onChange={changeUserPosition}
          />

          <Dropdown
            label="State"
            name="state"
            options={usStatesDropdownOptions}
            size="medium"
            value={state}
            onChange={changeUserState}
          />

          <Dropdown
            label="Authorization role"
            name="role"
            options={formRoles}
            size="medium"
            value={role || ''}
            onChange={changeUserRole}
            disabled={currentUser.id === user.id}
          />

          <div className="ds-l-row ds-u-padding-x--2">
            <TextField
              label="Password"
              name="current password"
              ariaLabel="Current password"
              value="********"
              disabled
              size="medium"
            />
            <div className="ds-u-clearfix">
              <div className="ds-c-label">&nbsp;</div>
              <div className="ds-c-field ds-u-border--0">
                <Button
                  aria-label={
                    changePassword
                      ? 'keep previous password'
                      : 'change password'
                  }
                  variation="transparent"
                  className="ds-u-padding-y--0"
                  onClick={toggleChangePassword}
                  purpose="change password"
                >
                  {changePassword ? <UnlockIcon /> : <LockIcon />} Change
                  password
                </Button>
              </div>
            </div>
          </div>
          {changePassword && (
            <Password
              showMeter
              title="New password"
              value={password}
              onChange={changeUserPassword}
            />
          )}
        </Fragment>
      );
    }
    return null;
  };

  const onSave = !!userID && saveAccount;

  const usersDropdownOptions = users.map(u => ({
    label: `${u.name ? `${u.name} - ` : ''}${u.username}`,
    value: u.id
  }));
  usersDropdownOptions.unshift({ label: "Select...", value: "" });

  return (
    <Fragment>
      <CardForm
        title="Manage accounts"
        sectionName="administrator"
        error={hasFetched && error}
        success={success && 'Account saved'}
        working={working}
        onSave={onSave}
      >
        <Dropdown
          label="Account to edit"
          name="userID"
          options={usersDropdownOptions}
          value={`${userID}`}
          onChange={handlePickAccount}
        />
        {getForm()}
      </CardForm>
    </Fragment>
  );
};

EditAccount.propTypes = {
  currentUser: PropTypes.object.isRequired,
  editAccount: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  roles: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  working: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  currentUser: state.auth.user,
  error: getEditAccountError(state),
  roles: state.admin.roles,
  users: selectUsersSorted(state),
  working: getEditAccountWorking(state)
});

const mapDispatchToProps = { editAccount: editAccountDispatch };

export default connect(mapStateToProps, mapDispatchToProps)(EditAccount);

export { EditAccount as plain, mapStateToProps, mapDispatchToProps };
