const express = require('express');
const router = express.Router();
const {
  issueCertificate,
  getAllCertificates,
  getCertificateById,
  verifyCertificate,
  revokeCertificate,
  downloadCertificate,
  regenerateCertificate
} = require('../controllers/certificateController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { mongoIdValidation, validate } = require('../middleware/validation');

// Public route - Certificate verification
router.get('/verify/:verificationCode', verifyCertificate);

// Public/Optional auth - Get certificate by ID (for verification)
router.get('/:id', optionalAuth, mongoIdValidation, validate, getCertificateById);

// Protected routes
router.use(protect);

// Issue certificate - Admin only
router.post(
  '/',
  authorize('admin', 'super_admin'),
  issueCertificate
);

// Get all certificates
router.get('/', getAllCertificates);

// Download certificate
router.get('/:id/download', mongoIdValidation, validate, downloadCertificate);

// Revoke certificate - Admin only
router.put(
  '/:id/revoke',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  revokeCertificate
);

// Regenerate certificate - Admin only
router.post(
  '/:id/regenerate',
  authorize('admin', 'super_admin'),
  mongoIdValidation,
  validate,
  regenerateCertificate
);

module.exports = router;
