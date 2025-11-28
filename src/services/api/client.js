import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

const TOKEN_KEY = '@auth_token';

// Set to true to enable API logging
const DEBUG_MODE = __DEV__; // Automatically true in development

class ApiClient {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Debug logger
  log(type, message, data = null) {
    if (DEBUG_MODE) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.log(` [API ${timestamp}] ${type}`);
      console.log(`   ${message}`);
      if (data) {
        console.log('Data:', JSON.stringify(data, null, 2));
      }
    }
  }

  // Get stored token
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Store token
  async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Remove token
  async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Build headers
  async buildHeaders(requiresAuth = true) {
    const headers = { ...API_CONFIG.HEADERS };

    if (requiresAuth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle response
  async handleResponse(response, method, endpoint) {
    let data;
    const contentType = response.headers.get('content-type');

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (e) {
      data = null;
    }

    // Log response
    this.log(
      response.ok ? '✅ RESPONSE' : '❌ ERROR',
      `${method} ${endpoint} - Status: ${response.status}`,
      data,
    );

    if (!response.ok) {
      const error = new Error(
        data?.message || data?.error || 'Something went wrong',
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // GET request
  async get(endpoint, params = {}, requiresAuth = true) {
    const queryString = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';

    const url = `${this.baseUrl}${endpoint}${queryString}`;
    const headers = await this.buildHeaders(requiresAuth);

    // Log request
    this.log('REQUEST', `GET ${endpoint}`, params);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      return this.handleResponse(response, 'GET', endpoint);
    } catch (error) {
      this.log('❌ NETWORK ERROR', `GET ${endpoint}`, {
        message: error.message,
      });
      throw error;
    }
  }

  // POST request
  async post(endpoint, body = {}, requiresAuth = true) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.buildHeaders(requiresAuth);

    // Log request
    this.log('📤 REQUEST', `POST ${endpoint}`, body);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      return this.handleResponse(response, 'POST', endpoint);
    } catch (error) {
      this.log('❌ NETWORK ERROR', `POST ${endpoint}`, {
        message: error.message,
      });
      throw error;
    }
  }

  // PUT request
  async put(endpoint, body = {}, requiresAuth = true) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.buildHeaders(requiresAuth);

    // Log request
    this.log('📤 REQUEST', `PUT ${endpoint}`, body);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      return this.handleResponse(response, 'PUT', endpoint);
    } catch (error) {
      this.log('❌ NETWORK ERROR', `PUT ${endpoint}`, {
        message: error.message,
      });
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint, requiresAuth = true) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.buildHeaders(requiresAuth);

    // Log request
    this.log('📤 REQUEST', `DELETE ${endpoint}`);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      return this.handleResponse(response, 'DELETE', endpoint);
    } catch (error) {
      this.log('❌ NETWORK ERROR', `DELETE ${endpoint}`, {
        message: error.message,
      });
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
