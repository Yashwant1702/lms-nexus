import api from './api';

export const notificationService = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Clear read notifications
  clearReadNotifications: async () => {
    try {
      const response = await api.delete('/notifications/clear-read');
      return response;
    } catch (error) {
      throw error;
    }
  },
};
