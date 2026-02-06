const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Visual elements
  icon: {
    type: String,
    required: true // URL or emoji or icon name
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  
  // Badge type
  category: {
    type: String,
    enum: [
      'achievement',
      'milestone',
      'skill',
      'engagement',
      'social',
      'special'
    ],
    default: 'achievement'
  },
  
  // Earning criteria
  criteria: {
    type: {
      type: String,
      enum: [
        'course_completion',
        'courses_completed_count',
        'assessment_score',
        'consecutive_days',
        'total_points',
        'level_reached',
        'modules_completed',
        'perfect_score',
        'first_course',
        'fast_learner',
        'helping_others',
        'custom'
      ],
      required: true
    },
    targetValue: {
      type: Number,
      default: 1
    },
    specificCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null
    }
  },
  
  // Rarity
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // Points reward
  pointsReward: {
    type: Number,
    default: 0
  },
  
  // Organization
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false // Hidden badges are secret achievements
  },
  
  // Statistics
  stats: {
    totalAwarded: {
      type: Number,
      default: 0
    },
    uniqueRecipients: {
      type: Number,
      default: 0
    }
  },
  
  // Display order
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug
badgeSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Badge', badgeSchema);
