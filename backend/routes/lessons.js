const express = require('express');
const router = express.Router();
const {
  createLesson,
  getLessonsByModule,
  getLessonById,
  updateLesson,
  deleteLesson,
  markLessonComplete,
  reorderLessons
} = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const {
  createLessonValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Lesson routes
router.post('/modules/:moduleId/lessons', authorize('trainer', 'admin', 'super_admin'), createLessonValidation, validate, createLesson);
router.get('/modules/:moduleId/lessons', getLessonsByModule);
router.get('/:id', mongoIdValidation, validate, getLessonById);
router.put('/:id', authorize('trainer', 'admin', 'super_admin'), mongoIdValidation, validate, updateLesson);
router.delete('/:id', authorize('trainer', 'admin', 'super_admin'), mongoIdValidation, validate, deleteLesson);
router.post('/:id/complete', authorize('learner'), mongoIdValidation, validate, markLessonComplete);
router.put('/modules/:moduleId/lessons/reorder', authorize('trainer', 'admin', 'super_admin'), reorderLessons);

module.exports = router;
