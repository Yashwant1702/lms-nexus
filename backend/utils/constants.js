// User roles
exports.USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TRAINER: 'trainer',
  LEARNER: 'learner'
};

// Course statuses
exports.COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Course categories
exports.COURSE_CATEGORIES = [
  'technology',
  'business',
  'design',
  'marketing',
  'health',
  'language',
  'other'
];

// Course levels
exports.COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Enrollment statuses
exports.ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  DROPPED: 'dropped'
};

// Content types
exports.CONTENT_TYPES = {
  VIDEO: 'video',
  DOCUMENT: 'document',
  TEXT: 'text',
  LINK: 'link',
  QUIZ: 'quiz'
};

// Assessment types
exports.ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  TEST: 'test',
  EXAM: 'exam',
  ASSIGNMENT: 'assignment'
};

// Question types
exports.QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer'
};

// Notification types
exports.NOTIFICATION_TYPES = {
  ENROLLMENT: 'enrollment',
  COURSE_UPDATE: 'course_update',
  ASSIGNMENT_DUE: 'assignment_due',
  ASSESSMENT_AVAILABLE: 'assessment_available',
  ASSESSMENT_GRADED: 'assessment_graded',
  CERTIFICATE_ISSUED: 'certificate_issued',
  COMMENT: 'comment',
  MESSAGE: 'message',
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system'
};

// Notification priorities
exports.NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Badge categories
exports.BADGE_CATEGORIES = {
  ACHIEVEMENT: 'achievement',
  MILESTONE: 'milestone',
  SKILL: 'skill',
  ENGAGEMENT: 'engagement',
  SOCIAL: 'social',
  SPECIAL: 'special'
};

// Badge rarity
exports.BADGE_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

// Points system
exports.POINTS = {
  LESSON_COMPLETE: 10,
  MODULE_COMPLETE: 25,
  COURSE_COMPLETE: 100,
  ASSESSMENT_PASS: 50,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 10
};

// File size limits (in bytes)
exports.FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  VIDEO: 500 * 1024 * 1024 // 500MB
};

// Allowed file types
exports.ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg']
};

// Subscription plans
exports.SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

// Knowledge base categories
exports.KB_CATEGORIES = {
  GETTING_STARTED: 'getting_started',
  TUTORIALS: 'tutorials',
  BEST_PRACTICES: 'best_practices',
  TROUBLESHOOTING: 'troubleshooting',
  FAQ: 'faq',
  POLICIES: 'policies',
  TECHNICAL: 'technical',
  OTHER: 'other'
};

// Default pagination
exports.DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

// Time constants
exports.TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
};

module.exports = exports;
