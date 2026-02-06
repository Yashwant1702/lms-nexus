import api from './api';

export const analyticsService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get course analytics
  getCourseAnalytics: async (courseId) => {
    try {
      const response = await api.get(`/analytics/courses/${courseId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user analytics
  getUserAnalytics: async (userId) => {
    try {
      const response = await api.get(`/analytics/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export report
  exportReport: async (params = {}) => {
    try {
      const response = await api.get('/analytics/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return response;
    } catch (error) {
      throw error;
    }
  },
};
