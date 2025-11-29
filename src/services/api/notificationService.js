import apiClient from './client';
import { ENDPOINTS } from './config';

export const notificationService = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    // params: { status, type, page }
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, params);
    return response;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response;
  },

  // Get recent notifications (5 most recent)
  getRecentNotifications: async () => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATIONS.RECENT);
    return response;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    return response;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
    return response;
  },

  // Clear read notifications
  clearReadNotifications: async () => {
    const response = await apiClient.post(ENDPOINTS.NOTIFICATIONS.CLEAR_READ);
    return response;
  },
};

export default notificationService;

