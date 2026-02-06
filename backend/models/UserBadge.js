const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  
  // Earning details
  earnedAt: {
    type: Date,
    default: Date.now
  },
  
  // Related entity that triggered badge
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['course', 'assessment', 'enrollment', 'achievement'],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  
  // Progress towards badge (for tracking partial completion)
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      default: 0
    }
  },
  
  // Display settings
  isDisplayed: {
    type: Boolean,
    default: true // User can choose to hide badges
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Notification sent
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound unique index
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('UserBadge', userBadgeSchema);
