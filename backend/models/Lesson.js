const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  contentType: {
    type: String,
    enum: ['video', 'document', 'text', 'link', 'quiz'],
    required: true
  },
  content: {
    // For video
    videoUrl: String,
    videoDuration: Number,
    
    // For document
    documentUrl: String,
    documentType: String,
    
    // For text content
    textContent: String,
    
    // For external link
    externalLink: String,
    
    // For quiz reference
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment'
    }
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  resources: [{
    title: String,
    type: String,
    url: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for ordering within module
lessonSchema.index({ module: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
