const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // null if self-enrolled
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'suspended', 'dropped'],
    default: 'active'
  },
  progress: {
    completedLessons: [{
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }],
    completedModules: [{
      module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }],
    percentageComplete: {
      type: Number,
      default: 0
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  },
  assessmentResults: [{
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    },
    score: Number,
    passed: Boolean,
    attemptNumber: Number,
    completedAt: Date
  }],
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  completedAt: {
    type: Date,
    default: null
  },
  deadline: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for unique enrollment
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Method to update progress percentage
enrollmentSchema.methods.updateProgressPercentage = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course).populate({
    path: 'modules',
    populate: { path: 'lessons' }
  });
  
  if (!course) return;
  
  const totalLessons = course.modules.reduce((sum, module) => {
    return sum + module.lessons.length;
  }, 0);
  
  if (totalLessons === 0) {
    this.progress.percentageComplete = 0;
  } else {
    this.progress.percentageComplete = Math.round(
      (this.progress.completedLessons.length / totalLessons) * 100
    );
  }
  
  await this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
