// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import {
  CONSENT_COOKIE_NAME,
  API_COOKIE_NAME
} from '../../../web/src/constants';

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-axe-core'; // eslint-disable-line import/no-extraneous-dependencies

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Cookies.defaults({
  preserve: [CONSENT_COOKIE_NAME, API_COOKIE_NAME]
});
Cypress.Cookies.debug(true, { verbose: true });
