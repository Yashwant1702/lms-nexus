const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCourseAnalytics,
  getUserAnalytics,
  exportReport
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { mongoIdValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get course analytics - Trainer/Admin
router.get(
  '/courses/:courseId',
  authorize('trainer', 'admin', 'super_admin'),
  getCourseAnalytics
);

// Get user analytics - Admin or Self
router.get('/users/:userId', getUserAnalytics);

// Export analytics report - Admin only
router.get(
  '/export',
  authorize('admin', 'super_admin'),
  exportReport
);

module.exports = router;
