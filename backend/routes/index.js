const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const courseRoutes = require('./courses');
const moduleRoutes = require('./modules');
const lessonRoutes = require('./lessons');
const enrollmentRoutes = require('./enrollments');
const assessmentRoutes = require('./assessments');
const certificateRoutes = require('./certificates');
const knowledgeRoutes = require('./knowledge');
const notificationRoutes = require('./notifications');
const analyticsRoutes = require('./analytics');
const gamificationRoutes = require('./gamification');
const chatRoutes = require('./chat');
const organizationRoutes = require('./organizations');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/chat', chatRoutes);
router.use('/organizations', organizationRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to LMS Nexus API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      modules: '/api/modules',
      lessons: '/api/lessons',
      enrollments: '/api/enrollments',
      assessments: '/api/assessments',
      certificates: '/api/certificates',
      knowledge: '/api/knowledge',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      gamification: '/api/gamification',
      chat: '/api/chat',
      organizations: '/api/organizations'
    }
  });
});

module.exports = router;
