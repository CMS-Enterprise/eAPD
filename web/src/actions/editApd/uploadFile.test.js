import MockAdapter from 'axios-mock-adapter';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import axios from '../../util/api';

const mockStore = configureStore([thunk]);
const fetchMock = new MockAdapter(axios);

import {
  UPLOAD_FILE_FAILURE,
  UPLOAD_FILE_REQUEST,
  UPLOAD_FILE_SUCCESS
} from './symbols';
import { uploadFile } from './uploadFile';

describe('APD edit actions for uploading files', () => {
  const reader = {
    addEventListener: jest.fn(),
    readAsArrayBuffer: jest.fn()
  };
  global.FileReader = () => reader;

  const store = mockStore({
    apd: {
      data: {
        id: 'apd id'
      }
    }
  });

  beforeEach(() => {
    fetchMock.reset();
    reader.addEventListener.mockReset();
    reader.readAsArrayBuffer.mockReset();
    store.clearActions();
  });

  it('resolves a URL if the upload is successful', async () => {
    fetchMock
      .onPost('/apds/apd id/files')
      .reply(200, { url: '/this-is-the-new-url' });

    const test = store.dispatch(uploadFile('asdf')).then(url => {
      expect(store.getActions()).toEqual([
        {
          type: UPLOAD_FILE_REQUEST
        },
        { type: UPLOAD_FILE_SUCCESS, url: '/this-is-the-new-url' }
      ]);

      expect(url).toEqual('http://localhost:8000/this-is-the-new-url');
    });

    await reader.addEventListener.mock.calls[0][1]();
    await test;
  });

  it('rejects if the upload is not successful', async () => {
    fetchMock.onPost('/apds/apd id/files').reply(500);

    const test = store.dispatch(uploadFile('asdf')).catch(() => {
      expect(store.getActions()).toEqual([
        {
          type: UPLOAD_FILE_REQUEST
        },
        { type: UPLOAD_FILE_FAILURE }
      ]);
    });

    await reader.addEventListener.mock.calls[0][1]();
    await test;
  });
});
