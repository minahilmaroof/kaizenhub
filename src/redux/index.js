import store from './store';
import {useAppDispatch, useAppSelector} from './hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setUser,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  initializeAuth,
} from './slices/authSlice';

export {
  store,
  useAppDispatch,
  useAppSelector,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setUser,
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  initializeAuth,
};

export default store;

