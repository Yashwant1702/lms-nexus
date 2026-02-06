import api from './api';

export const assessmentService = {
  // Get all assessments
  getAllAssessments: async (params = {}) => {
    try {
      const response = await api.get('/assessments', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get assessment by ID
  getAssessmentById: async (id) => {
    try {
      const response = await api.get(`/assessments/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Start assessment attempt
  startAttempt: async (assessmentId) => {
    try {
      const response = await api.post(`/assessments/${assessmentId}/attempt`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Submit assessment attempt
  submitAttempt: async (attemptId, answers) => {
    try {
      const response = await api.post(`/assessments/attempts/${attemptId}/submit`, {
        answers,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's attempts for assessment
  getUserAttempts: async (assessmentId) => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/attempts`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get attempt details
  getAttemptDetails: async (attemptId) => {
    try {
      const response = await api.get(`/assessments/attempts/${attemptId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create assessment (Admin/Trainer)
  createAssessment: async (assessmentData) => {
    try {
      const response = await api.post('/assessments', assessmentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update assessment
  updateAssessment: async (id, assessmentData) => {
    try {
      const response = await api.put(`/assessments/${id}`, assessmentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete assessment
  deleteAssessment: async (id) => {
    try {
      const response = await api.delete(`/assessments/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
