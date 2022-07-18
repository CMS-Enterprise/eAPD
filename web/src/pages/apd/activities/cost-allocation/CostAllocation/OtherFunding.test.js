import React from 'react';
import {
  renderWithConnection,
  act,
  // waitFor,
  // screen
} from 'apd-testing-library';
import { plain as 
  OtherFunding, 
  // mapDispatchToProps 
} from './OtherFunding';
// import {
//   setCostAllocationFFPOtherFunding,
//   setCostAllocationOtherFunding
// } from '../../../../../redux/actions/editActivity';
// import { render } from 'react-dom';

const initialState = {
  activityIndex: 1,
  activity: {
    key: 'activity key',
    costAllocationNarrative: {
      methodology: 'cost allocation',
      years: {
        1066: { otherSources: 'other funding for FFY 1066' },
        1067: { otherSources: 'other funding for FFY 1067' }
      }
    }
  },
  costAllocation: {
    1066: {
      other: 1235
    },
    1067: {
      other: 1234
    }
  },
  costSummary: {
    years: {
      1066: {
        totalCost: 5459076,
        otherFunding: 4322,
        medicaidShare: 3450509
      },
      1067: {
        totalCost: 5459077,
        otherFunding: 4323,
        medicaidShare: 3450510
      }
    }
  },
  setOtherFunding: jest.fn(),
  syncOtherFunding: jest.fn()
};

const setup = async (props = {}) => {
  // eslint-disable-next-line testing-library/no-unnecessary-act
  const utils = await act(async () =>
  renderWithConnection(<OtherFunding {...initialState} {...props} />)
);
return utils;
}

describe('<OtherFunding />', () => {
  it('renders correctly', async () => {
    await setup();
  });
});