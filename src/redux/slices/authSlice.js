import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    fetchProfileStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    },
    fetchProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    initializeAuth: (state, action) => {
      // Initialize auth state from stored token
      if (action.payload.token) {
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
      if (action.payload.user) {
        state.user = action.payload.user;
      }
    },
  },
});

export const {
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
} = authSlice.actions;

export default authSlice.reducer;

