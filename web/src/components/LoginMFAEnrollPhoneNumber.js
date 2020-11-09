import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { TextField } from '@cmsgov/design-system';

const formSubmitNoop = e => e.preventDefault();

class LoginMFAEnrollPhoneNumber extends Component {
  constructor(props) {
    super(props);

    this.state = {
      phone: ''
    };
  };

  changeUserPhone = e => {
    this.setState({ phone: e.target.value});
  }

  handlePhoneFormSubmit = e => {
    e.preventDefault();
    this.props.handlePhoneSubmit(this.state.phone);
  }

  render() {
    return (
      <div id="start-main-content">
        <div className="ds-l-container">
          <div className="login-card">					
            <h1 className="ds-u-display--flex ds-u-justify-content--start ds-u-align-items--center ds-u-margin--0">
              <span>Verify Your Identity</span>
            </h1>
            <form onSubmit={this.handlePhoneFormSubmit || formSubmitNoop}>
              <label htmlFor="mfaPhoneNumber" id="mfaPhoneNumber" className="ds-u-font-weight--normal">            
                Please enter your phone number to receive temporary verification passcodes.
              </label>
              <TextField
                id="mfaPhoneNumber"
                label="Phone number"
                aria-labelledby="mfaPhoneNumber"
                name="mfaPhoneNumber"
                size="medium"
                mask="phone"
                value={this.state.phone || ''}
                onChange={this.changeUserPhone}
              />
              <div className="ds-u-display--flex ds-u-justify-content--end ds-u-margin-top--3 ds-u-padding-top--2 ds-u-border-top--2">
                <button type="submit" className="ds-c-button ds-c-button--primary">Submit</button> 
              </div>
            </form>
          </div>
        </div>
      </div>
    );    
  };
};

LoginMFAEnrollPhoneNumber.propTypes = {

};
 
LoginMFAEnrollPhoneNumber.defaultProps = {

}; 

export default withRouter(LoginMFAEnrollPhoneNumber);

export { LoginMFAEnrollPhoneNumber as plain };