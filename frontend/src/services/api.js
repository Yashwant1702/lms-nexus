import axios from 'axios';
import toast from 'react-hot-toast';
import { storageService } from './storageService';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          storageService.clearToken();
          storageService.clearUser();
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;

        case 403:
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          toast.error('Resource not found.');
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data.message || 'An error occurred.');
      }

      return Promise.reject(data);
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject({ message: 'Network error' });
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
      return Promise.reject(error);
    }
  }
);

export default api;

// Utility functions for common HTTP methods
export const apiService = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};
