const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String, // For true/false and short answer
    default: null
  },
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  explanation: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  assessmentType: {
    type: String,
    enum: ['quiz', 'test', 'exam', 'assignment'],
    default: 'quiz'
  },
  questions: [questionSchema],
  
  // Settings
  settings: {
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    timeLimit: {
      type: Number, // in minutes
      default: null
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    showResultsImmediately: {
      type: Boolean,
      default: true
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    requireAllQuestions: {
      type: Boolean,
      default: true
    }
  },
  
  // Scheduling
  availability: {
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Statistics
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate total points
assessmentSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

// Method to check if user can attempt
assessmentSchema.methods.canAttempt = function(attemptCount) {
  if (!this.availability.isActive) return false;
  if (this.settings.maxAttempts && attemptCount >= this.settings.maxAttempts) return false;
  
  const now = new Date();
  if (this.availability.startDate && now < this.availability.startDate) return false;
  if (this.availability.endDate && now > this.availability.endDate) return false;
  
  return true;
};

assessmentSchema.set('toJSON', { virtuals: true });
assessmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
