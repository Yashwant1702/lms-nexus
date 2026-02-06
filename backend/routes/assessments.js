const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  startAttempt,
  submitAttempt,
  getUserAttempts,
  getAttemptDetails
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createAssessmentValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');
const { assessmentLimiter } = require('../middleware/rateLimiter');

// All routes are protected
router.use(protect);

// Create assessment - Trainer/Admin
router.post(
  '/',
  authorize('trainer', 'admin', 'super_admin'),
  createAssessmentValidation,
  validate,
  createAssessment
);

// Get all assessments
router.get('/', getAllAssessments);

// Get assessment by ID
router.get('/:id', mongoIdValidation, validate, getAssessmentById);

// Update assessment - Trainer/Admin
router.put(
  '/:id',
  authorize('trainer', 'admin', 'super_admin'),
  mongoIdValidation,
  validate,
  updateAssessment
);

// Delete assessment - Trainer/Admin
router.delete(
  '/:id',
  authorize('trainer', 'admin', 'super_admin'),
  mongoIdValidation,
  validate,
  deleteAssessment
);

// Start assessment attempt - Learner
router.post(
  '/:id/attempt',
  authorize('learner'),
  assessmentLimiter,
  mongoIdValidation,
  validate,
  startAttempt
);

// Submit assessment attempt - Learner
router.post(
  '/attempts/:attemptId/submit',
  authorize('learner'),
  assessmentLimiter,
  mongoIdValidation,
  validate,
  submitAttempt
);

// Get user's attempts for assessment
router.get('/:id/attempts', mongoIdValidation, validate, getUserAttempts);

// Get attempt details
router.get('/attempts/:attemptId', mongoIdValidation, validate, getAttemptDetails);

module.exports = router;
