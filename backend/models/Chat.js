const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  conversationType: {
    type: String,
    enum: ['direct', 'group', 'course', 'support'],
    required: true
  },
  
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Group/Course chat details
  name: {
    type: String,
    trim: true,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Related entity
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['course', 'organization'],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  
  // Last message
  lastMessage: {
    text: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date
  },
  
  // Settings
  settings: {
    allowAttachments: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    muteNotifications: {
      type: Boolean,
      default: false
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

module.exports = mongoose.model('Chat', chatSchema);
