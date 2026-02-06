const express = require('express');
const router = express.Router();
const {
  createModule,
  getModulesByCourse,
  getModuleById,
  updateModule,
  deleteModule,
  reorderModules
} = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createModuleValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Module routes
router.post('/courses/:courseId/modules', authorize('trainer', 'admin', 'super_admin'), createModuleValidation, validate, createModule);
router.get('/courses/:courseId/modules', getModulesByCourse);
router.get('/:id', mongoIdValidation, validate, getModuleById);
router.put('/:id', authorize('trainer', 'admin', 'super_admin'), mongoIdValidation, validate, updateModule);
router.delete('/:id', authorize('trainer', 'admin', 'super_admin'), mongoIdValidation, validate, deleteModule);
router.put('/courses/:courseId/modules/reorder', authorize('trainer', 'admin', 'super_admin'), reorderModules);

module.exports = router;
