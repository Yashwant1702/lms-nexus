import api from './api';
import { storageService } from './storageService';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.token) {
        storageService.setToken(response.token);
        storageService.setUser(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.token) {
        storageService.setToken(response.token);
        storageService.setUser(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storageService.clearToken();
      storageService.clearUser();
      window.location.href = '/login';
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      storageService.setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!storageService.getToken();
  },

  // Get current user from storage
  getCurrentUser: () => {
    return storageService.getUser();
  },
};
