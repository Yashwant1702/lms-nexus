const { validationResult, body, param, query } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }

  next();
};

// Auth validations
exports.registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'trainer', 'learner'])
    .withMessage('Invalid role'),

  body('organization')
    .optional()
    .isMongoId().withMessage('Invalid organization ID')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

exports.forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
];

exports.resetPasswordValidation = [
  param('token')
    .notEmpty().withMessage('Reset token is required'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Course validations
exports.createCourseValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Course title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Course description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['technology', 'business', 'design', 'marketing', 'health', 'language', 'other'])
    .withMessage('Invalid category'),
  
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid level')
];

exports.updateCourseValidation = [
  param('id')
    .isMongoId().withMessage('Invalid course ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  
  body('category')
    .optional()
    .isIn(['technology', 'business', 'design', 'marketing', 'health', 'language', 'other'])
    .withMessage('Invalid category')
];

// Module validations
exports.createModuleValidation = [
  param('courseId')
    .isMongoId().withMessage('Invalid course ID'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Module title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Module description is required')
];

// Lesson validations
exports.createLessonValidation = [
  param('moduleId')
    .isMongoId().withMessage('Invalid module ID'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Lesson title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  
  body('contentType')
    .notEmpty().withMessage('Content type is required')
    .isIn(['video', 'document', 'text', 'link', 'quiz'])
    .withMessage('Invalid content type'),
  
  body('content')
    .notEmpty().withMessage('Content is required')
];

// Enrollment validations
exports.enrollUserValidation = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  
  body('courseId')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Invalid course ID')
];

// Assessment validations
exports.createAssessmentValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Assessment title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  
  body('course')
    .notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Invalid course ID'),
  
  body('assessmentType')
    .optional()
    .isIn(['quiz', 'test', 'exam', 'assignment'])
    .withMessage('Invalid assessment type'),
  
  body('questions')
    .isArray({ min: 1 }).withMessage('At least one question is required'),
  
  body('questions.*.questionText')
    .trim()
    .notEmpty().withMessage('Question text is required'),
  
  body('questions.*.questionType')
    .isIn(['multiple_choice', 'true_false', 'short_answer'])
    .withMessage('Invalid question type')
];

// Knowledge base validations
exports.createArticleValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Article title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Article content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn([
      'getting_started',
      'tutorials',
      'best_practices',
      'troubleshooting',
      'faq',
      'policies',
      'technical',
      'other'
    ])
    .withMessage('Invalid category')
];

// Notification validations
exports.createNotificationValidation = [
  body('recipient')
    .notEmpty().withMessage('Recipient is required')
    .isMongoId().withMessage('Invalid recipient ID'),
  
  body('type')
    .notEmpty().withMessage('Notification type is required')
    .isIn([
      'enrollment',
      'course_update',
      'assignment_due',
      'assessment_available',
      'assessment_graded',
      'certificate_issued',
      'comment',
      'message',
      'announcement',
      'reminder',
      'achievement',
      'system'
    ])
    .withMessage('Invalid notification type'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
];

// Badge validations
exports.createBadgeValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Badge name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  
  body('icon')
    .notEmpty().withMessage('Icon is required'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['achievement', 'milestone', 'skill', 'engagement', 'social', 'special'])
    .withMessage('Invalid category'),
  
  body('criteria.type')
    .notEmpty().withMessage('Criteria type is required'),
  
  body('criteria.targetValue')
    .isInt({ min: 1 }).withMessage('Target value must be a positive integer')
];

// Organization validations
exports.createOrganizationValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Organization name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  
  body('contact.email')
    .optional()
    .isEmail().withMessage('Please provide a valid email')
];

// Chat validations
exports.createDirectChatValidation = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID')
];

exports.createGroupChatValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Group name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  
  body('userIds')
    .isArray({ min: 2 }).withMessage('At least 2 users are required for a group chat'),
  
  body('userIds.*')
    .isMongoId().withMessage('Invalid user ID in userIds array')
];

exports.sendMessageValidation = [
  param('chatId')
    .isMongoId().withMessage('Invalid chat ID'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message must not exceed 5000 characters'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'file', 'image', 'system'])
    .withMessage('Invalid message type')
];

// ID parameter validation
exports.mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = exports;
