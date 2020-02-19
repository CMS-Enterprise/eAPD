import {
  UPLOAD_FILE_FAILURE,
  UPLOAD_FILE_REQUEST,
  UPLOAD_FILE_SUCCESS
} from './symbols';

import { selectApdData } from '../../reducers/apd.selectors';
import axios, { apiUrl } from '../../util/api';

export const uploadFile = file => async (dispatch, getState) => {
  dispatch({ type: UPLOAD_FILE_REQUEST });

  const state = getState();
  const { id: apdID } = selectApdData(state);

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.addEventListener('load', async () => {
      const form = new FormData();
      form.append('file', new Blob([reader.result]));

      return axios
        .post(`/apds/${apdID}/files`, form)
        .then(req => {
          dispatch({ type: UPLOAD_FILE_SUCCESS, url: req.data.url });
          resolve(`${apiUrl}${req.data.url}`);
        })
        .catch(() => {
          dispatch({ type: UPLOAD_FILE_FAILURE });
          reject();
        });
    });

    reader.readAsArrayBuffer(file);
  });
};

export default uploadFile;
