const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  uploadAvatar,
  updatePreferences,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { mongoIdValidation, validate } = require('../middleware/validation');
const { uploadAvatar: avatarUpload, handleUploadError } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Get all users - Admin only
router.get('/', authorize('super_admin', 'admin'), getAllUsers);

// Get user by ID
router.get('/:id', mongoIdValidation, validate, getUserById);

// Update user
router.put('/:id', mongoIdValidation, validate, updateUser);

// Update user role - Admin only
router.put('/:id/role', authorize('super_admin', 'admin'), mongoIdValidation, validate, updateUserRole);

// Update user status - Admin only
router.put('/:id/status', authorize('super_admin', 'admin'), mongoIdValidation, validate, updateUserStatus);

// Delete user - Admin only
router.delete('/:id', authorize('super_admin', 'admin'), mongoIdValidation, validate, deleteUser);

// Upload avatar
router.post('/:id/avatar', avatarUpload, handleUploadError, mongoIdValidation, validate, uploadAvatar);

// Update preferences
router.put('/:id/preferences', mongoIdValidation, validate, updatePreferences);

// Get user statistics
router.get('/:id/stats', mongoIdValidation, validate, getUserStats);

module.exports = router;
