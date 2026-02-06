import api from './api';

export const gamificationService = {
  // Get all badges
  getAllBadges: async () => {
    try {
      const response = await api.get('/gamification/badges');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user badges
  getUserBadges: async (userId) => {
    try {
      const response = await api.get(`/gamification/users/${userId}/badges`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get badge progress
  getBadgeProgress: async (userId) => {
    try {
      const response = await api.get(`/gamification/users/${userId}/badge-progress`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get leaderboard
  getLeaderboard: async (params = {}) => {
    try {
      const response = await api.get('/gamification/leaderboard', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user gamification profile
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/gamification/users/${userId}/profile`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
