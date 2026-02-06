const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  versionNumber: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editedAt: {
    type: Date,
    default: Date.now
  },
  changeLog: {
    type: String,
    default: ''
  }
});

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Article content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  
  // Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'getting_started',
      'tutorials',
      'best_practices',
      'troubleshooting',
      'faq',
      'policies',
      'technical',
      'other'
    ]
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  
  // Author information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Organization
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  // Related content
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  }],
  relatedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Version control
  currentVersion: {
    type: Number,
    default: 1
  },
  versions: [versionSchema],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'public'
  },
  allowedRoles: [{
    type: String,
    enum: ['super_admin', 'admin', 'trainer', 'learner']
  }],
  
  // Engagement metrics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    notHelpfulCount: {
      type: Number,
      default: 0
    }
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug from title
knowledgeBaseSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Text index for search
knowledgeBaseSchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text',
  excerpt: 'text'
});

// Method to create new version
knowledgeBaseSchema.methods.createVersion = function(editedBy, changeLog = '') {
  this.versions.push({
    versionNumber: this.currentVersion,
    content: this.content,
    editedBy: editedBy,
    changeLog: changeLog
  });
  this.currentVersion += 1;
  return this.save();
};

// Method to increment view count
knowledgeBaseSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
