const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  updateBranding,
  updateSettings,
  updateSubscription,
  updateStatus,
  deleteOrganization,
  getOrganizationStats
} = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createOrganizationValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Create organization - Super Admin only
router.post(
  '/',
  authorize('super_admin'),
  createOrganizationValidation,
  validate,
  createOrganization
);

// Get all organizations - Super Admin only
router.get('/', authorize('super_admin'), getAllOrganizations);

// Get organization by ID - Admin/Super Admin
router.get(
  '/:id',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  getOrganizationById
);

// Update organization - Admin/Super Admin
router.put(
  '/:id',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  updateOrganization
);

// Update branding - Admin/Super Admin
router.put(
  '/:id/branding',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  updateBranding
);

// Update settings - Admin/Super Admin
router.put(
  '/:id/settings',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  updateSettings
);

// Update subscription - Super Admin only
router.put(
  '/:id/subscription',
  authorize('super_admin'),
  mongoIdValidation,
  validate,
  updateSubscription
);

// Update status - Super Admin only
router.put(
  '/:id/status',
  authorize('super_admin'),
  mongoIdValidation,
  validate,
  updateStatus
);

// Delete organization - Super Admin only
router.delete(
  '/:id',
  authorize('super_admin'),
  mongoIdValidation,
  validate,
  deleteOrganization
);

// Get organization statistics - Admin/Super Admin
router.get(
  '/:id/stats',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  getOrganizationStats
);

module.exports = router;
