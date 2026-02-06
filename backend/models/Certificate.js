const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
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
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  
  // Certificate details
  recipientName: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Performance metrics
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'Pass', 'Distinction'],
    default: 'Pass'
  },
  
  // Certificate file
  pdfUrl: {
    type: String,
    default: null
  },
  
  // Trainer/Issuer information
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainerName: {
    type: String,
    required: true
  },
  trainerSignature: {
    type: String,
    default: null
  },
  
  // Organization branding
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  organizationName: {
    type: String,
    required: true
  },
  organizationLogo: {
    type: String,
    default: null
  },
  
  // Verification
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedReason: {
    type: String,
    default: null
  },
  
  // Template used
  templateId: {
    type: String,
    default: 'default'
  },
  
  // Metadata
  metadata: {
    duration: String,
    skills: [String],
    modules: Number,
    hours: Number
  }
}, {
  timestamps: true
});

// Generate unique certificate number
certificateSchema.pre('save', async function(next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.certificateNumber = `CERT-${year}-${random}`;
  }
  
  if (!this.verificationCode) {
    const crypto = require('crypto');
    this.verificationCode = crypto.randomBytes(16).toString('hex').toUpperCase();
  }
  
  next();
});

// Method to revoke certificate
certificateSchema.methods.revoke = function(reason) {
  this.isValid = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

module.exports = mongoose.model('Certificate', certificateSchema);
