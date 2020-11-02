import axios from '../util/api';

import { fetchAllApds } from './app';
import { getRoles, getUsers } from './admin';

export const AUTH_CHECK_FAILURE = 'AUTH_CHECK_FAILURE';
export const AUTH_CHECK_REQUEST = 'AUTH_CHECK_REQUEST';
export const AUTH_CHECK_SUCCESS = 'AUTH_CHECK_SUCCESS';

export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

export const requestAuthCheck = () => ({ type: AUTH_CHECK_REQUEST });
export const completeAuthCheck = user => ({
  type: AUTH_CHECK_SUCCESS,
  data: user
});
export const failAuthCheck = () => ({ type: AUTH_CHECK_FAILURE });

export const requestLogin = () => ({ type: LOGIN_REQUEST });
export const completeLogin = user => ({ type: LOGIN_SUCCESS, data: user });
export const failLogin = error => ({ type: LOGIN_FAILURE, error });

export const completeLogout = () => ({ type: LOGOUT_SUCCESS });

const loadData = activities => dispatch => {
  if (activities.includes('view-document')) {
    dispatch(fetchAllApds());
  }
  if (activities.includes('view-users')) {
    dispatch(getUsers());
  }
  if (activities.includes('view-roles')) {
    dispatch(getRoles());
  }
};

export const login = (username, password) => dispatch => {
  dispatch(requestLogin());

  return axios
    .post('/auth/login/nonce', { username })
    .then(res =>
      axios.post('/auth/login', {
        username: res.data.nonce,
        password
      })
    )
    .then(res => {
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      dispatch(completeLogin(user));
      dispatch(loadData(user.activities));
    })
    .catch(error => {
      const reason = error.response ? error.response.data : 'N/A';
      dispatch(failLogin(reason));
    });
};

export const logout = () => dispatch =>
  axios
    .get('/auth/logout')
    .then(() => localStorage.removeItem('token'))
    .then(() => dispatch(completeLogout()));

export const checkAuth = () => dispatch => {
  dispatch(requestAuthCheck());

  return axios
    .get('/me')
    .then(req => {
      dispatch(completeAuthCheck(req.data));
      dispatch(loadData(req.data.activities));
    })
    .catch(() => dispatch(failAuthCheck()));
};
