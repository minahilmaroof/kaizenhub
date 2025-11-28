import axios from 'axios';
import config from '../config';
import authStorage from './../app/storage';
import NetInfo from '@react-native-community/netinfo';
const apiClient = axios.create({
  baseURL: config.baseURL,
  timeout: 15000,
});

apiClient.interceptors.request.use(
  async request => {
    const authToken = await authStorage.getToken();

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject({ message: 'No internet connection' });
    }

    if (!request.headers['Content-Type']) {
      request.headers['Content-Type'] = 'application/json';
    }

    if (authToken) request.headers['Authorization'] = `Bearer ${authToken}`;

    return request;
  },
  error => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    
     if (error.code === 'ECONNABORTED') {
      return Promise.reject({ message: 'Request timed out. Please try again.' });
    }

    // Handle no response (network error)
    if (!error.response) {
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }

    if (error.response && error.response.status === 401) {
      
     
    
      // authStorage.removeToken();
      // authStorage.removeUser();
      //   // 👇 Redirect to login
      //   navigate('Login');
    }
    if (error.response && error.response.status === 422) {
      return error.response;
    }
    if (error.response.status === 302) {
      return Promise.resolve(error.response);
    }
    if (error.response && error.response.status === 409) {
      return error.response;
    }
    console.error('Response error', error.response);
    return Promise.reject(error);
  },
);

export default apiClient;
