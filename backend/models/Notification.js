const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for system notifications
  },
  
  // Notification details
  type: {
    type: String,
    enum: [
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
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Related entities
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['course', 'enrollment', 'assessment', 'certificate', 'lesson', 'announcement'],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  
  // Action link
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  
  // Delivery channels
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  
  // Email status
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  
  // Push notification status
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: {
    type: Date,
    default: null
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
    default: null
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  
  // Emit real-time event (will be handled by Socket.io)
  // This will be implemented in the socket service
  
  return notification;
};

module.exports = mongoose.model('Notification', notificationSchema);
