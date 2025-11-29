import { Platform } from 'react-native';
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
    // data: { name, email, phone, company, image }
    // image can be: file object from ImageCropPicker or base64 string or URL string
    
    let requestData;
    
    // Check if image is provided and needs to be sent as FormData
    if (data.image) {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      
      // Add text fields
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      if (data.company) formData.append('company', data.company);
      
      // Handle image
      if (typeof data.image === 'string') {
        // If it's a URL string or base64, send as string
        formData.append('image', data.image);
      } else if (data.image.path || data.image.uri) {
        // If it's a file object from ImageCropPicker
        const imageUri = data.image.path || data.image.uri;
        const imageName = imageUri.split('/').pop() || 'profile.jpg';
        const imageType = data.image.mime || data.image.type || 'image/jpeg';
        
        // For React Native FormData, use the correct format
        // iOS needs file:// prefix removed, Android can use path directly
        let uri = imageUri;
        if (Platform.OS === 'ios' && uri.startsWith('file://')) {
          uri = uri.replace('file://', '');
        }
        
        formData.append('image', {
          uri: uri,
          type: imageType,
          name: imageName,
        });
      }
      
      requestData = formData;
    } else {
      // No image, send as JSON
      requestData = data;
    }
    console.log('request data,' ,requestData)
    const response = await apiClient.put(ENDPOINTS.PROFILE.UPDATE, requestData);
    return response;
  },
};

export default profileService;

