const express = require('express');
const router = express.Router();
const {
  enrollUser,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollmentStatus,
  getEnrollmentProgress,
  unenrollUser,
  bulkEnroll
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  enrollUserValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Enroll user - Admin/Learner (self-enrollment)
router.post('/', enrollUserValidation, validate, enrollUser);

// Bulk enroll - Admin only
router.post('/bulk', authorize('admin', 'super_admin'), bulkEnroll);

// Get all enrollments
router.get('/', getAllEnrollments);

// Get enrollment by ID
router.get('/:id', mongoIdValidation, validate, getEnrollmentById);

// Update enrollment status - Admin only
router.put('/:id/status', authorize('admin', 'super_admin'), mongoIdValidation, validate, updateEnrollmentStatus);

// Get enrollment progress
router.get('/:id/progress', mongoIdValidation, validate, getEnrollmentProgress);

// Unenroll user - Admin or Self
router.delete('/:id', mongoIdValidation, validate, unenrollUser);

module.exports = router;
