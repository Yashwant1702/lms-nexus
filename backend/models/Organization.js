const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  branding: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#8B5CF6'
    },
    accentColor: {
      type: String,
      default: '#10B981'
    }
  },
  settings: {
    allowSelfRegistration: {
      type: Boolean,
      default: false
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    maxUsersPerCourse: {
      type: Number,
      default: 1000
    },
    certificateTemplate: {
      type: String,
      default: 'default'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    maxUsers: {
      type: Number,
      default: 10
    },
    maxCourses: {
      type: Number,
      default: 5
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  },
  contact: {
    email: String,
    phone: String,
    address: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate slug from name
organizationSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
