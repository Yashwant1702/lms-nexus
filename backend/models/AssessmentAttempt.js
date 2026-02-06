const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: {
    type: String,
    default: null
  },
  answerText: {
    type: String,
    default: null
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

const assessmentAttemptSchema = new mongoose.Schema({
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  answers: [answerSchema],
  
  // Scoring
  score: {
    pointsEarned: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  
  passed: {
    type: Boolean,
    default: false
  },
  
  // Timing
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'evaluated', 'expired'],
    default: 'in_progress'
  },
  
  // Feedback
  feedback: {
    type: String,
    default: ''
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  evaluatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index
assessmentAttemptSchema.index({ assessment: 1, user: 1, attemptNumber: 1 }, { unique: true });

// Method to calculate score
assessmentAttemptSchema.methods.calculateScore = function() {
  this.score.pointsEarned = this.answers.reduce((sum, ans) => sum + ans.pointsEarned, 0);
  this.score.percentage = this.score.totalPoints > 0 
    ? Math.round((this.score.pointsEarned / this.score.totalPoints) * 100) 
    : 0;
  return this.score;
};

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
