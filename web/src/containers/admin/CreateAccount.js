import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import { STATES } from '../../util';
import Password from '../../components/PasswordWithMeter';

import { createUser as createUserDispatch } from '../../actions/admin';

import Btn from '../../components/Btn';
import { t } from '../../i18n';

class CreateUser extends Component {
  state = {
    fetching: false,
    name: '',
    email: '',
    password: '',
    state: ''
  };

  handleChange = e => {
    const { name: key, value } = e.target;
    const change = { [key]: value };

    this.setState(change);
  };

  handleSubmit = e => {
    e.preventDefault();

    const { email, name, password, state } = this.state;
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }

    const score = zxcvbn(password, [email, name]);
    if (score.score < 3) {
      alert('Password is too weak');
      return;
    }

    const { createUser } = this.props;

    this.setState({ fetching: true });
    createUser({ email, name, password, state })
      .then(() => {
        this.setState({
          fetching: false,
          name: '',
          email: '',
          password: '',
          state: ''
        });
      })
      .catch(() => {
        this.setState({ fetching: false });
      });
  };

  render() {
    const { fetching, name, email, password, state } = this.state;

    return (
      <Fragment>
        <header className="clearfix px2 py1 bg-white">
          <div className="left">
            <Link to="/" className="btn px0 bold caps">
              {t('titleBasic')}
            </Link>
          </div>
        </header>

        <div className="mx-auto my3 p2 sm-col-6 md-col-4 bg-white rounded">
          <h1 className="mt0 h2">Create account</h1>
          <form onSubmit={this.handleSubmit}>
            <div className="mb2">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="input"
                value={name}
                onChange={this.handleChange}
              />
            </div>
            <div className="mb2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="text"
                name="email"
                className="input"
                value={email}
                onChange={this.handleChange}
              />
            </div>
            <Password
              value={password}
              compareTo={[email, name]}
              onChange={this.handleChange}
              className="mb2"
            />
            <div className="mb2">
              <label htmlFor="create_user_state">State</label>
              <select
                id="create_user_state"
                name="state"
                className="input"
                value={state}
                onChange={this.handleChange}
              >
                <option value="">None</option>
                {STATES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <Btn type="submit" disabled={fetching}>
              {fetching ? 'Working' : 'Create account'}
            </Btn>
          </form>
        </div>
      </Fragment>
    );
  }
}

CreateUser.propTypes = {
  createUser: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  createUser: createUserDispatch
};

export default connect(
  null,
  mapDispatchToProps
)(CreateUser);

export { CreateUser as plain };
