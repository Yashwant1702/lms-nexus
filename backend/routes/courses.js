const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublish,
  getCourseStats
} = require('../controllers/courseController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createCourseValidation,
  updateCourseValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// Public/Optional auth routes
router.get('/', optionalAuth, getAllCourses);
router.get('/:id', optionalAuth, mongoIdValidation, validate, getCourseById);

// Protected routes - Trainer/Admin
router.post('/', protect, authorize('trainer', 'admin', 'super_admin'), createCourseValidation, validate, createCourse);
router.put('/:id', protect, authorize('trainer', 'admin', 'super_admin'), updateCourseValidation, validate, updateCourse);
router.delete('/:id', protect, authorize('trainer', 'admin', 'super_admin'), mongoIdValidation, validate, deleteCourse);
router.put('/:id/publish', protect, authorize('trainer', 'admin', 'super_admin'), mongoIdValidation, validate, togglePublish);

// Get course statistics - Trainer/Admin
router.get('/:id/stats', protect, authorize('trainer', 'admin', 'super_admin'), mongoIdValidation, validate, getCourseStats);

module.exports = router;
