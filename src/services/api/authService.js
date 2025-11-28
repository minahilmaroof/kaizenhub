import apiClient from './client';
import { ENDPOINTS } from './config';

export const authService = {
  // Register new user
  register: async userData => {
    const { name, email, password, phone, company, role } = userData;
    const response = await apiClient.post(
      ENDPOINTS.AUTH.REGISTER,
      {
        name,
        email,
        password,
        ...(phone && { phone }),
        ...(company && { company }),
        ...(role && { role }),
      },
      false, // No auth required for registration
    );

    // Store token on successful registration
    if (response.success && response.data?.token) {
      await apiClient.setToken(response.data.token);
    }

    return response;
  },

  // Login with email and password
  login: async (email, password) => {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.LOGIN,
      { email, password },
      false, // No auth required for login
    );

    // Store token on successful login
    if (response.success && response.data?.token) {
      await apiClient.setToken(response.data.token);
    }

    return response;
  },

  // Send OTP to email
  sendOTP: async email => {
    console.log('otp email------', email);
    const response = await apiClient.post(
      ENDPOINTS.AUTH.SEND_OTP,
      { email },
      false,
    );
    console.log('otp response------', response);
    return response;
  },

  // Verify OTP and login
  verifyOTP: async (email, otp) => {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_OTP,
      { email, otp },
      false,
    );

    // Store token on successful login
    if (response.success && response.data?.token) {
      await apiClient.setToken(response.data.token);
    }

    return response;
  },

  // Admin login with password
  adminLogin: async (email, password) => {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.ADMIN_LOGIN,
      { email, password },
      false,
    );

    // Store token on successful login
    if (response.success && response.data?.token) {
      await apiClient.setToken(response.data.token);
    }

    return response;
  },

  // Logout
  logout: async () => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
      await apiClient.removeToken();
      return response;
    } catch (error) {
      // Remove token even if logout fails
      await apiClient.removeToken();
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const token = await apiClient.getToken();
    return !!token;
  },
};

export default authService;
