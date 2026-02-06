// Email configuration and templates

// Email service configuration
exports.emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'LMS Nexus',
    email: process.env.EMAIL_FROM || 'noreply@lmsnexus.com'
  }
};

// Email template settings
exports.templateSettings = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  logoUrl: process.env.LOGO_URL || 'https://lmsnexus.com/logo.png',
  footerText: '© 2026 LMS Nexus. All rights reserved.',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@lmsnexus.com',
  companyAddress: '123 Learning Street, Education City, EC 12345'
};

// Email subjects
exports.emailSubjects = {
  welcome: 'Welcome to LMS Nexus! 🎓',
  resetPassword: 'Password Reset Request 🔐',
  passwordChanged: 'Your Password Has Been Changed ✅',
  courseEnrollment: 'Course Enrollment Confirmation 🎉',
  certificateIssued: 'Certificate Earned! 🏆',
  assessmentGraded: 'Assessment Results Available 📊',
  assignmentDue: 'Assignment Due Reminder ⏰',
  courseUpdate: 'Course Content Updated 📚',
  newAnnouncement: 'New Announcement 📢',
  achievementUnlocked: 'Achievement Unlocked! 🎯',
  dailyDigest: 'Your Daily Learning Digest 📰',
  weeklyReport: 'Your Weekly Progress Report 📈'
};

// Email rate limiting
exports.emailRateLimits = {
  perUser: {
    window: 3600000, // 1 hour in ms
    max: 10 // Maximum 10 emails per hour per user
  },
  global: {
    window: 60000, // 1 minute in ms
    max: 100 // Maximum 100 emails per minute globally
  }
};

// Email priorities
exports.emailPriorities = {
  urgent: {
    priority: 'high',
    retryAttempts: 5,
    retryDelay: 5000 // 5 seconds
  },
  normal: {
    priority: 'normal',
    retryAttempts: 3,
    retryDelay: 10000 // 10 seconds
  },
  low: {
    priority: 'low',
    retryAttempts: 2,
    retryDelay: 30000 // 30 seconds
  }
};

// Notification preferences defaults
exports.defaultNotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  frequency: {
    immediate: true,
    daily: false,
    weekly: false
  },
  types: {
    courseUpdates: true,
    assessmentGraded: true,
    certificateIssued: true,
    assignmentDue: true,
    announcements: true,
    achievements: true,
    messages: true,
    reminders: true
  }
};

// Email queue configuration
exports.emailQueueConfig = {
  maxRetries: 3,
  retryDelay: 60000, // 1 minute
  timeout: 30000, // 30 seconds
  concurrency: 5 // Process 5 emails concurrently
};

// Unsubscribe settings
exports.unsubscribeSettings = {
  enabled: true,
  endpoint: '/api/email/unsubscribe',
  requireConfirmation: true
};

module.exports = exports;
