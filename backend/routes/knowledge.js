const express = require('express');
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  togglePublish,
  getVersionHistory,
  submitFeedback,
  searchArticles
} = require('../controllers/knowledgeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createArticleValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// Public/Optional auth routes
router.get('/search', optionalAuth, searchArticles);
router.get('/', optionalAuth, getAllArticles);
router.get('/:identifier', optionalAuth, getArticle);

// Protected routes
router.use(protect);

// Create article - Trainer/Admin
router.post(
  '/',
  authorize('trainer', 'admin', 'super_admin'),
  createArticleValidation,
  validate,
  createArticle
);

// Update article - Trainer/Admin
router.put(
  '/:id',
  authorize('trainer', 'admin', 'super_admin'),
  mongoIdValidation,
  validate,
  updateArticle
);

// Delete article - Admin only
router.delete(
  '/:id',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  deleteArticle
);

// Publish/Unpublish article - Trainer/Admin
router.put(
  '/:id/publish',
  authorize('trainer', 'admin', 'super_admin'),
  mongoIdValidation,
  validate,
  togglePublish
);

// Get version history - Trainer/Admin
router.get(
  '/:id/versions',
  authorize('trainer', 'admin', 'super_admin'),
  mongoIdValidation,
  validate,
  getVersionHistory
);

// Submit feedback
router.post('/:id/feedback', mongoIdValidation, validate, submitFeedback);

module.exports = router;
