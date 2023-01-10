import React from 'react';
import { renderWithConnection, screen } from 'apd-testing-library';

import TempAlert from './TempAlert';
import { fireEvent } from '@testing-library/react';

const successMsg =
  'You have successfully created an APD. Select continue to fill out the rest of the APD.';

const successState = {
  alerts: {
    messages: [
      {
        message: successMsg,
        variation: 'success'
      }
    ]
  }
};

const setup = (props = {}, options = {}) => {
  return renderWithConnection(<TempAlert {...props} />, options);
};

describe('temporary alert/message', () => {
  beforeEach(() => {});

  afterAll(() => {});

  test('renders temporary message when apd created', async () => {
    setup(null, { initialState: successState });

    expect(await screen.findByText(successMsg)).toBeTruthy();
  });

  test('removes message when close button clicked', () => {
    setup(null, { initialState: successState });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText(successMsg)).toBeFalsy();
  });
});
