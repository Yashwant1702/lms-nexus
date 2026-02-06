// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Users
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  
  // Courses
  GET_COURSES: '/courses',
  GET_COURSE: '/courses',
  CREATE_COURSE: '/courses',
  ENROLL_COURSE: '/courses',
  
  // Enrollments
  GET_MY_COURSES: '/enrollments/my-courses',
  UPDATE_PROGRESS: '/enrollments/progress',
  
  // Assessments
  GET_ASSESSMENTS: '/assessments',
  SUBMIT_ASSESSMENT: '/assessments',
  
  // Gamification
  GET_LEADERBOARD: '/gamification/leaderboard',
  GET_BADGES: '/gamification/badges',
  
  // Notifications
  GET_NOTIFICATIONS: '/notifications',
  MARK_AS_READ: '/notifications',
  
  // Certificates
  GET_CERTIFICATES: '/certificates',
  
  // Test
  TEST: '/test',
};

export default API_CONFIG;
