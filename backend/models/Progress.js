const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  activityType: {
    type: String,
    enum: [
      'lesson_started',
      'lesson_completed',
      'module_completed',
      'assessment_started',
      'assessment_completed',
      'video_watched',
      'document_viewed',
      'quiz_passed',
      'badge_earned',
      'certificate_earned'
    ],
    required: true
  },
  entityType: {
    type: String,
    enum: ['lesson', 'module', 'assessment', 'course'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Overall progress
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Module progress
  moduleProgress: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    completedLessons: Number,
    totalLessons: Number,
    percentageComplete: Number,
    startedAt: Date,
    completedAt: Date
  }],
  
  // Lesson tracking
  lessonProgress: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    lastPosition: {
      type: Number, // for video position
      default: 0
    },
    startedAt: Date,
    completedAt: Date,
    attempts: {
      type: Number,
      default: 0
    }
  }],
  
  // Time tracking
  timeTracking: {
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0
    },
    lastSessionStart: Date,
    lastSessionEnd: Date,
    sessions: [{
      startTime: Date,
      endTime: Date,
      duration: Number // in minutes
    }]
  },
  
  // Assessment progress
  assessmentProgress: [{
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    },
    attempts: Number,
    bestScore: Number,
    lastAttemptScore: Number,
    passed: Boolean,
    completedAt: Date
  }],
  
  // Activity log
  activityLog: [activityLogSchema],
  
  // Milestones
  milestones: [{
    type: {
      type: String,
      enum: [
        'first_lesson',
        'half_complete',
        'all_modules_complete',
        'all_assessments_passed',
        'course_complete'
      ]
    },
    achievedAt: Date
  }],
  
  // Last activity
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // Completion tracking
  isComplete: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index
progressSchema.index({ user: 1, course: 1 }, { unique: true });
progressSchema.index({ enrollment: 1 });

// Method to mark lesson complete
progressSchema.methods.markLessonComplete = async function(lessonId) {
  const lessonProg = this.lessonProgress.find(
    lp => lp.lesson.toString() === lessonId.toString()
  );
  
  if (lessonProg) {
    lessonProg.status = 'completed';
    lessonProg.completedAt = new Date();
  } else {
    this.lessonProgress.push({
      lesson: lessonId,
      status: 'completed',
      completedAt: new Date()
    });
  }
  
  // Log activity
  this.activityLog.push({
    activityType: 'lesson_completed',
    entityType: 'lesson',
    entityId: lessonId
  });
  
  this.lastActivityAt = new Date();
  
  return this.save();
};

// Method to update overall progress
progressSchema.methods.calculateOverallProgress = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course).populate({
    path: 'modules',
    populate: { path: 'lessons' }
  });
  
  if (!course) return;
  
  const totalLessons = course.modules.reduce((sum, module) => {
    return sum + module.lessons.length;
  }, 0);
  
  const completedLessons = this.lessonProgress.filter(
    lp => lp.status === 'completed'
  ).length;
  
  this.overallProgress = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;
  
  return this.save();
};

module.exports = mongoose.model('Progress', progressSchema);
