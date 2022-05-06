import React from 'react';
import {
  renderWithConnection,
  act,
  screen
} from 'apd-testing-library';

import { plain as StandardsAndConditions } from './StandardsAndConditions';

const defaultProps = {
  activity: {
    standardsAndConditions: {
      doesNotSupport: 'does not support',
      supports: 'support'
    }
  },
  activityIndex: 7,
  setDoesNotSupport: jest.fn(),
  setSupport: jest.fn()
};

const setup = async (props = {}) => {
  // eslint-disable-next-line testing-library/no-unnecessary-act
  const utils = await act(async () =>
    renderWithConnection(<StandardsAndConditions {...defaultProps} {...props} />)
  );
  return utils;
};

describe('the StandardsAndConditions component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders correctly', async () => {
    await setup();
    const richText = screen.getByTestId('standards-and-conditions-supports');
    // testing getByTestId
    console.log(richText);
  });
});
