import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import { printApd } from './print';
import { PRINT_APD } from './symbols';

const mockStore = configureStore([thunk]);

describe('print actions', () => {
  it('printApd action dispatches and then opens the print dialog', () => {
    const global = {
      print: sinon.spy()
    };

    const store = mockStore({});

    store.dispatch(printApd({ global }));

    expect(store.getActions()).toEqual([{ type: PRINT_APD }]);
    expect(global.print.calledOnce).toEqual(true);
  });
});
