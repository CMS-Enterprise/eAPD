import { push } from 'connected-react-router';

import {
  CREATE_APD_FAILURE,
  CREATE_APD_REQUEST,
  CREATE_APD_SUCCESS,
  DELETE_APD_FAILURE,
  DELETE_APD_REQUEST,
  DELETE_APD_SUCCESS,
  FETCH_ALL_APDS_FAILURE,
  FETCH_ALL_APDS_REQUEST,
  FETCH_ALL_APDS_SUCCESS,
  SAVE_APD_FAILURE,
  SAVE_APD_REQUEST,
  SAVE_APD_SUCCESS,
  SELECT_APD,
  SET_APD_TO_SELECT_ON_LOAD
} from './symbols';
import { updateBudget } from '../budget';
import { EDIT_APD } from '../editApd/symbols';
import { ariaAnnounceApdLoaded, ariaAnnounceApdLoading } from '../aria';

import { selectApdData } from '../../reducers/apd.selectors';
import {
  selectHasChanges,
  selectPatches
} from '../../reducers/patch.selectors';
import { getIsAdmin } from '../../reducers/user.selector';

import axios from '../../util/api';
import initialAssurances from '../../util/regulations';

const LAST_APD_ID_STORAGE_KEY = 'last-apd-id';

export const saveApd = () => (dispatch, getState) => {
  const state = getState();
  const hasChanges = selectHasChanges(state);

  if (!hasChanges) {
    return Promise.resolve();
  }

  dispatch({ type: SAVE_APD_REQUEST });

  const { id: apdID } = selectApdData(state);
  const patches = selectPatches(state);

  return axios
    .patch(`/apds/${apdID}`, patches)
    .then(res => {
      dispatch({ type: SAVE_APD_SUCCESS, data: res.data });
      return res.data;
    })
    .catch(error => {
      if (error.response && error.response.status === 403) {
        dispatch({ type: SAVE_APD_FAILURE, data: 'save-apd.not-logged-in' });
      } else {
        dispatch({ type: SAVE_APD_FAILURE });
      }
      throw error;
    });
};

export const selectApd = (
  id,
  route,
  { global = window, pushRoute = push } = {}
) => dispatch => {
  dispatch(ariaAnnounceApdLoading());

  return axios.get(`/apds/${id}`).then(req => {
    dispatch({ type: SELECT_APD, apd: req.data });

    // By default, APDs get an empty object for federal citations. The canonical list of citations is in frontend
    // code, not backend. So if we get an APD with no federal citations, set its federal citations to the initial
    // values using an EDIT_APD action. That way the initial values get saved back to the API.
    if (Object.keys(req.data.federalCitations).length === 0) {
      dispatch({
        type: EDIT_APD,
        path: '/federalCitations',
        value: initialAssurances
      });
    }

    dispatch(updateBudget());
    dispatch(pushRoute(route));
    dispatch(ariaAnnounceApdLoaded());

    if (global.localStorage) {
      global.localStorage.setItem(LAST_APD_ID_STORAGE_KEY, id);
    }
  });
};

export const setApdToSelectOnLoad = () => (dispatch, getState) => {
  const isAdmin = getIsAdmin(getState());
  if (!isAdmin) {
    dispatch({ type: SET_APD_TO_SELECT_ON_LOAD });
  }
};

export const createApd = ({ pushRoute = push } = {}) => dispatch => {
  dispatch({ type: CREATE_APD_REQUEST });
  return axios
    .post('/apds')
    .then(async req => {
      dispatch({ type: CREATE_APD_SUCCESS, data: req.data });
      await dispatch(selectApd(req.data.id, '/apd', { pushRoute }));
    })
    .catch(error => {
      const reason = error.response ? error.response.data : 'N/A';
      dispatch({ type: CREATE_APD_FAILURE, data: reason });
    });
};

export const fetchAllApds = ({
  global = window,
  pushRoute = push,
  select = selectApd
} = {}) => (dispatch, getState) => {
  dispatch({ type: FETCH_ALL_APDS_REQUEST });

  const url = `/apds`;

  return axios
    .get(url)
    .then(async req => {
      const apd = Array.isArray(req.data) ? req.data : null;
      dispatch({
        type: FETCH_ALL_APDS_SUCCESS,
        data: apd.filter(({ status }) => status !== 'archived')
      });

      const {
        apd: { selectAPDOnLoad }
      } = getState();
      if (
        selectAPDOnLoad &&
        global.localStorage &&
        global.localStorage.getItem(LAST_APD_ID_STORAGE_KEY)
      ) {
        await dispatch(
          select(global.localStorage.getItem('last-apd-id'), {
            global,
            pushRoute
          })
        );
      }
    })
    .catch(error => {
      const reason = error.response ? error.response.data : 'N/A';
      dispatch({ type: FETCH_ALL_APDS_FAILURE, error: reason });
    });
};

export const deleteApd = (id, { fetch = fetchAllApds } = {}) => dispatch => {
  dispatch({ type: DELETE_APD_REQUEST });

  return axios
    .delete(`/apds/${id}`)
    .then(() => {
      dispatch({ type: DELETE_APD_SUCCESS });
      dispatch(fetch());
    })
    .catch(() => {
      dispatch({ type: DELETE_APD_FAILURE });
    });
};
