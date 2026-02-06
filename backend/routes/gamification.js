const express = require('express');
const router = express.Router();
const {
  getAllBadges,
  getUserBadges,
  createBadge,
  awardBadge,
  getLeaderboard,
  updateUserPoints,
  getUserGamificationProfile,
  getBadgeProgress
} = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createBadgeValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Badge routes
router.get('/badges', getAllBadges);
router.get('/users/:userId/badges', getUserBadges);
router.get('/users/:userId/badge-progress', getBadgeProgress);

// Create badge - Admin only
router.post(
  '/badges',
  authorize('admin', 'super_admin'),
  createBadgeValidation,
  validate,
  createBadge
);

// Award badge - Admin only
router.post(
  '/badges/:badgeId/award',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  awardBadge
);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Update user points - Admin only
router.post(
  '/users/:userId/points',
  authorize('admin', 'super_admin'),
  updateUserPoints
);

// Get user gamification profile
router.get('/users/:userId/profile', getUserGamificationProfile);

module.exports = router;
