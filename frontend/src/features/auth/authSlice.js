import { createSlice } from '@reduxjs/toolkit';

// Try to initialize state from sessionStorage if available
const storedUserInfo = sessionStorage.getItem('userInfo');
const initialState = {
  user: storedUserInfo ? JSON.parse(storedUserInfo) : null,
  token: storedUserInfo ? JSON.parse(storedUserInfo).token : null,
  isAuthenticated: !!storedUserInfo,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Keep sessionStorage updated for persistence across reloads
      sessionStorage.setItem('userInfo', JSON.stringify({ ...user, token }));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('userInfo');
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
