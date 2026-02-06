const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  thumbnail: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'business', 'design', 'marketing', 'health', 'language', 'other']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 }
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  requirements: [String],
  learningObjectives: [String],
  tags: [String],
  
  // Enrollment settings
  enrollmentSettings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxEnrollments: {
      type: Number,
      default: null
    },
    enrollmentDeadline: {
      type: Date,
      default: null
    }
  },
  
  // Statistics
  stats: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Completion criteria
  completionCriteria: {
    requiredModules: {
      type: Number,
      default: 0
    },
    passingScore: {
      type: Number,
      default: 70
    },
    requireAllLessons: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Generate slug from title
courseSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Calculate total duration
courseSchema.virtual('totalDuration').get(function() {
  return this.duration.hours * 60 + this.duration.minutes;
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
