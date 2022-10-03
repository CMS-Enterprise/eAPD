import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { setLatestActivity } from '../redux/actions/auth';
import { withLDProvider } from 'launchdarkly-react-client-sdk';

import App from './App';

const Root = ({ history, store }) => {
  // Create listener for location changing to track activity
  history.listen(() => {
    store.dispatch(setLatestActivity());
  });

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>
  );
};

Root.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  store: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

export default withLDProvider({
  clientSideID: process.env.LD_CLIENT_ID,
  options: {
    streamUrl: 'https://clientstream.launchdarkly.us',
    baseUrl: 'https://clientsdk.launchdarkly.us',
    eventsUrl: 'https://events.launchdarkly.us'
  }
})(Root);
