import api from './api';

export const enrollmentService = {
  // Enroll in a course
  enrollCourse: async (courseId) => {
    try {
      const response = await api.post('/enrollments', {
        userId: null, // Will be taken from auth token
        courseId,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all enrollments
  getMyEnrollments: async (params = {}) => {
    try {
      const response = await api.get('/enrollments', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get enrollment by ID
  getEnrollmentById: async (id) => {
    try {
      const response = await api.get(`/enrollments/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get enrollment progress
  getEnrollmentProgress: async (id) => {
    try {
      const response = await api.get(`/enrollments/${id}/progress`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Unenroll from course
  unenrollCourse: async (id) => {
    try {
      const response = await api.delete(`/enrollments/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update lesson progress
  updateLessonProgress: async (enrollmentId, lessonId, completed) => {
    try {
      const response = await api.put(`/enrollments/${enrollmentId}/progress`, {
        lessonId,
        completed,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
