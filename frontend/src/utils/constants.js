// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LMS Nexus';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TRAINER: 'trainer',
  LEARNER: 'learner',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  trainer: 'Trainer',
  learner: 'Learner',
};

// Course Statuses
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const COURSE_STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

export const COURSE_STATUS_COLORS = {
  draft: 'gray',
  published: 'green',
  archived: 'red',
};

// Course Categories
export const COURSE_CATEGORIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'marketing', label: 'Marketing', icon: '📈' },
  { value: 'health', label: 'Health & Fitness', icon: '💪' },
  { value: 'language', label: 'Language', icon: '🗣️' },
  { value: 'other', label: 'Other', icon: '📚' },
];

// Course Levels
export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', color: 'red' },
];

// Enrollment Statuses
export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  DROPPED: 'dropped',
};

export const ENROLLMENT_STATUS_LABELS = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
  suspended: 'Suspended',
  dropped: 'Dropped',
};

export const ENROLLMENT_STATUS_COLORS = {
  pending: 'yellow',
  active: 'blue',
  completed: 'green',
  suspended: 'orange',
  dropped: 'red',
};

// Content Types
export const CONTENT_TYPES = {
  VIDEO: 'video',
  DOCUMENT: 'document',
  TEXT: 'text',
  LINK: 'link',
  QUIZ: 'quiz',
};

export const CONTENT_TYPE_LABELS = {
  video: 'Video',
  document: 'Document',
  text: 'Text',
  link: 'Link',
  quiz: 'Quiz',
};

export const CONTENT_TYPE_ICONS = {
  video: '🎥',
  document: '📄',
  text: '📝',
  link: '🔗',
  quiz: '❓',
};

// Assessment Types
export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  TEST: 'test',
  EXAM: 'exam',
  ASSIGNMENT: 'assignment',
};

export const ASSESSMENT_TYPE_LABELS = {
  quiz: 'Quiz',
  test: 'Test',
  exam: 'Exam',
  assignment: 'Assignment',
};

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
};

export const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Multiple Choice',
  true_false: 'True/False',
  short_answer: 'Short Answer',
};

// Notification Types
export const NOTIFICATION_TYPES = {
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
  SYSTEM: 'system',
};

export const NOTIFICATION_TYPE_ICONS = {
  enrollment: '🎓',
  course_update: '📚',
  assignment_due: '⏰',
  assessment_available: '📝',
  assessment_graded: '✅',
  certificate_issued: '🏆',
  comment: '💬',
  message: '✉️',
  announcement: '📢',
  reminder: '🔔',
  achievement: '🎯',
  system: '⚙️',
};

// Notification Priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const NOTIFICATION_PRIORITY_COLORS = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

// Badge Categories
export const BADGE_CATEGORIES = {
  ACHIEVEMENT: 'achievement',
  MILESTONE: 'milestone',
  SKILL: 'skill',
  ENGAGEMENT: 'engagement',
  SOCIAL: 'social',
  SPECIAL: 'special',
};

export const BADGE_CATEGORY_LABELS = {
  achievement: 'Achievement',
  milestone: 'Milestone',
  skill: 'Skill',
  engagement: 'Engagement',
  social: 'Social',
  special: 'Special',
};

// Badge Rarity
export const BADGE_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const BADGE_RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

// File Upload Limits
export const FILE_SIZE_LIMITS = {
  AVATAR: 5, // MB
  DOCUMENT: 50, // MB
  VIDEO: 500, // MB
};

export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
};

// Pagination
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 12,
  MAX_LIMIT: 100,
};

export const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

// Date Formats
export const DATE_FORMATS = {
  FULL: 'full',
  SHORT: 'short',
  DATE: 'date',
  TIME: 'time',
  RELATIVE: 'relative',
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'lms_token',
  USER: 'lms_user',
  THEME: 'lms_theme',
  PREFERENCES: 'lms_preferences',
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  MY_COURSES: '/dashboard/courses',
  ASSESSMENTS: '/dashboard/assessments',
  CERTIFICATES: '/dashboard/certificates',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
  ADMIN: '/admin',
};

// Social Media Share URLs
export const SOCIAL_SHARE_URLS = {
  LINKEDIN: 'https://www.linkedin.com/sharing/share-offsite/?url=',
  TWITTER: 'https://twitter.com/intent/tweet?url=',
  FACEBOOK: 'https://www.facebook.com/sharer/sharer.php?u=',
};

// Grade Scale
export const GRADE_SCALE = [
  { min: 90, max: 100, grade: 'A+', color: 'green' },
  { min: 85, max: 89, grade: 'A', color: 'green' },
  { min: 80, max: 84, grade: 'A-', color: 'green' },
  { min: 75, max: 79, grade: 'B+', color: 'blue' },
  { min: 70, max: 74, grade: 'B', color: 'blue' },
  { min: 65, max: 69, grade: 'B-', color: 'blue' },
  { min: 60, max: 64, grade: 'C+', color: 'yellow' },
  { min: 55, max: 59, grade: 'C', color: 'yellow' },
  { min: 50, max: 54, grade: 'C-', color: 'yellow' },
  { min: 0, max: 49, grade: 'F', color: 'red' },
];

// Points System
export const POINTS = {
  LESSON_COMPLETE: 10,
  MODULE_COMPLETE: 25,
  COURSE_COMPLETE: 100,
  ASSESSMENT_PASS: 50,
  PERFECT_SCORE: 100,
  DAILY_LOGIN: 5,
  STREAK_BONUS: 10,
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
};

// Status Colors
export const STATUS_COLORS = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  pending: 'gray',
};
