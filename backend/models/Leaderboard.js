const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  // Scores by period
  daily: {
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  },
  weekly: {
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    weekStart: { type: Date }
  },
  monthly: {
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    monthStart: { type: Date }
  },
  allTime: {
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 }
  },
  
  // Activity metrics
  metrics: {
    coursesCompleted: { type: Number, default: 0 },
    lessonsCompleted: { type: Number, default: 0 },
    assessmentsPassed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    certificatesEarned: { type: Number, default: 0 },
    badgesEarned: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  },
  
  // Last update
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for ranking queries
leaderboardSchema.index({ organization: 1, 'allTime.points': -1 });
leaderboardSchema.index({ organization: 1, 'monthly.points': -1 });
leaderboardSchema.index({ organization: 1, 'weekly.points': -1 });
leaderboardSchema.index({ organization: 1, 'daily.points': -1 });
leaderboardSchema.index({ user: 1, organization: 1 }, { unique: true });

// Method to add points
leaderboardSchema.methods.addPoints = async function(points) {
  const now = new Date();
  
  // Add to all time
  this.allTime.points += points;
  
  // Add to daily
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!this.daily.date || this.daily.date < today) {
    this.daily.points = points;
    this.daily.date = today;
  } else {
    this.daily.points += points;
  }
  
  // Add to weekly
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  if (!this.weekly.weekStart || this.weekly.weekStart < weekStart) {
    this.weekly.points = points;
    this.weekly.weekStart = weekStart;
  } else {
    this.weekly.points += points;
  }
  
  // Add to monthly
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (!this.monthly.monthStart || this.monthly.monthStart < monthStart) {
    this.monthly.points = points;
    this.monthly.monthStart = monthStart;
  } else {
    this.monthly.points += points;
  }
  
  this.lastActivityAt = now;
  
  return this.save();
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
