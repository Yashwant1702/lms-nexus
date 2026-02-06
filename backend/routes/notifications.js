const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  clearReadNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createNotificationValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Get user's notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Clear read notifications
router.delete('/clear-read', clearReadNotifications);

// Create notification - Admin only
router.post(
  '/',
  authorize('admin', 'super_admin'),
  createNotificationValidation,
  validate,
  createNotification
);

// Mark notification as read
router.put('/:id/read', mongoIdValidation, validate, markAsRead);

// Delete notification
router.delete('/:id', mongoIdValidation, validate, deleteNotification);

module.exports = router;
