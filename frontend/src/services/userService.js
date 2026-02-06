import api from './api';

export const userService = {
  // Get all users (Admin)
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user role (Admin)
  updateUserRole: async (id, role) => {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user status (Admin)
  updateUserStatus: async (id, isActive) => {
    try {
      const response = await api.put(`/users/${id}/status`, { isActive });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete user (Admin)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(`/users/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update preferences
  updatePreferences: async (id, preferences) => {
    try {
      const response = await api.put(`/users/${id}/preferences`, preferences);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (id) => {
    try {
      const response = await api.get(`/users/${id}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
