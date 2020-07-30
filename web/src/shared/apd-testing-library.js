import React from 'react';
import { Provider } from 'react-redux';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { render as rtlRender } from '@testing-library/react'; // eslint-disable-line import/no-extraneous-dependencies

import reducer from '../reducers';

/**
 * Use this render method instead of the plain render if you are testing a connected component that uses a router.
 * @param ui - the UI component to render
 * @param renderOptions - {
 *   initialState - the initial state of the redux store, defaults to empty
 *   enhancer - any middleware to apply to the redux store, defaults to promiseMiddleware and thunk
 *   store - the redux store, defaults to a store with empty state and promiseMiddleware and thunk
 *   initialEntries - the initial entries in the router history, defaults to root
 *   history - the route history, defaults to a history with only a root entry
 *   options - other options to pass onto the render function
 * }
 * @returns an option with the rendered container, the store, the history, and related react-testing-library functions
 */
const renderWithConnection = (ui, renderOptions = {}) => {
  const {
    history = createBrowserHistory(),
    initialState = undefined,
    middleware = [thunk, routerMiddleware(history)],
    store = createStore(
      reducer(history),
      initialState,
      applyMiddleware(...middleware)
    ),
    ...options
  } = renderOptions;
  const wrappedNode = rtlRender(
    <Provider store={store}>
      <ConnectedRouter history={history}>{ui}</ConnectedRouter>
    </Provider>,
    options
  );
  return {
    ...wrappedNode,
    rerender: (updatedUi, updatedOptions) =>
      rtlRender(
        <Provider store={store}>
          <ConnectedRouter history={history}>{updatedUi}</ConnectedRouter>
        </Provider>,
        { container: wrappedNode.container, ...updatedOptions }
      ),
    store,
    history
  };
};

// Re-export all of the react-testing-library functions,
// so that you don't have to import both libraries
export * from '@testing-library/react'; // eslint-disable-line import/no-extraneous-dependencies
export { renderWithConnection };
