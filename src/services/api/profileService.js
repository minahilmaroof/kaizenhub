import apiClient from './client';
import { ENDPOINTS } from './config';

export const profileService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.PROFILE.GET);
    return response;
  },

  // Update user profile
  updateProfile: async (data) => {
    // data: { name, phone, company }
    const response = await apiClient.put(ENDPOINTS.PROFILE.UPDATE, data);
    return response;
  },
};

export default profileService;

