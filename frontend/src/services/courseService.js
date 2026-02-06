import api from './api';

export const courseService = {
  // Get all courses
  getAllCourses: async (params = {}) => {
    try {
      const response = await api.get('/courses', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create course (Admin/Trainer)
  createCourse: async (courseData) => {
    try {
      const response = await api.post('/courses', courseData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update course
  updateCourse: async (id, courseData) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/courses/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Toggle publish status
  togglePublish: async (id) => {
    try {
      const response = await api.put(`/courses/${id}/publish`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get course stats
  getCourseStats: async (id) => {
    try {
      const response = await api.get(`/courses/${id}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload course thumbnail
  uploadThumbnail: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await api.post(`/courses/${id}/thumbnail`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};
