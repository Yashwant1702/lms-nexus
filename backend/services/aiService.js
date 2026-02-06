// AI Recommendations Service
// This is a simplified version. In production, you would integrate with actual AI/ML services

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Get personalized course recommendations
exports.getPersonalizedRecommendations = async (userId, limit = 5) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // Get user's enrolled courses
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course');

    const enrolledCourseIds = enrollments.map(e => e.course._id);
    const enrolledCategories = [...new Set(enrollments.map(e => e.course.category))];

    // Find similar courses based on categories
    const recommendations = await Course.find({
      _id: { $nin: enrolledCourseIds },
      status: 'published',
      organization: user.organization,
      $or: [
        { category: { $in: enrolledCategories } },
        { level: user.level <= 3 ? 'beginner' : user.level <= 6 ? 'intermediate' : 'advanced' }
      ]
    })
      .limit(limit)
      .sort({ 'stats.totalEnrollments': -1 });

    return recommendations;

  } catch (error) {
    console.error('Get recommendations error:', error);
    return [];
  }
};

// Predict course completion likelihood
exports.predictCompletionLikelihood = async (userId, courseId) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (!enrollment) {
      return { likelihood: 0, confidence: 0 };
    }

    // Simple prediction based on progress and activity
    const progress = enrollment.progress.percentageComplete;
    const daysSinceLastActivity = enrollment.progress.lastAccessedAt
      ? Math.floor((new Date() - enrollment.progress.lastAccessedAt) / (1000 * 60 * 60 * 24))
      : 999;

    let likelihood = 0;

    if (progress >= 75) {
      likelihood = 90;
    } else if (progress >= 50) {
      likelihood = 70;
    } else if (progress >= 25) {
      likelihood = 50;
    } else {
      likelihood = 30;
    }

    // Adjust based on recent activity
    if (daysSinceLastActivity <= 7) {
      likelihood += 10;
    } else if (daysSinceLastActivity > 30) {
      likelihood -= 20;
    }

    likelihood = Math.max(0, Math.min(100, likelihood));

    return {
      likelihood,
      confidence: 75,
      factors: {
        progress,
        recentActivity: daysSinceLastActivity <= 7,
        daysSinceLastActivity
      }
    };

  } catch (error) {
    console.error('Predict completion error:', error);
    return { likelihood: 0, confidence: 0 };
  }
};

// Get learning path suggestions
exports.suggestLearningPath = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // Get user's completed courses
    const completedEnrollments = await Enrollment.find({
      user: userId,
      status: 'completed'
    }).populate('course');

    const completedCategories = [...new Set(completedEnrollments.map(e => e.course.category))];

    // Find next level courses in completed categories
    const nextCourses = await Course.find({
      status: 'published',
      organization: user.organization,
      category: { $in: completedCategories },
      _id: { $nin: completedEnrollments.map(e => e.course._id) }
    })
      .sort({ level: 1 })
      .limit(10);

    // Group into learning paths
    const learningPaths = {};

    for (const course of nextCourses) {
      if (!learningPaths[course.category]) {
        learningPaths[course.category] = [];
      }
      learningPaths[course.category].push(course);
    }

    return Object.entries(learningPaths).map(([category, courses]) => ({
      category,
      courses,
      completedInCategory: completedEnrollments.filter(e => e.course.category === category).length
    }));

  } catch (error) {
    console.error('Suggest learning path error:', error);
    return [];
  }
};

// Analyze learning patterns
exports.analyzeLearningPatterns = async (userId) => {
  try {
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course');

    if (enrollments.length === 0) {
      return null;
    }

    // Calculate average completion time
    const completedEnrollments = enrollments.filter(e => e.status === 'completed');
    
    const avgCompletionDays = completedEnrollments.length > 0
      ? completedEnrollments.reduce((sum, e) => {
          const days = Math.floor((e.completedAt - e.createdAt) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedEnrollments.length
      : 0;

    // Most active day of week
    const activityByDay = {};
    enrollments.forEach(e => {
      if (e.progress.lastAccessedAt) {
        const day = new Date(e.progress.lastAccessedAt).getDay();
        activityByDay[day] = (activityByDay[day] || 0) + 1;
      }
    });

    const mostActiveDay = Object.keys(activityByDay).reduce((a, b) => 
      activityByDay[a] > activityByDay[b] ? a : b
    );

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Preferred categories
    const categoryCount = {};
    enrollments.forEach(e => {
      const category = e.course.category;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const preferredCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b
    );

    return {
      totalEnrollments: enrollments.length,
      completedCourses: completedEnrollments.length,
      completionRate: Math.round((completedEnrollments.length / enrollments.length) * 100),
      avgCompletionDays: Math.round(avgCompletionDays),
      mostActiveDay: dayNames[mostActiveDay],
      preferredCategory,
      learningStreak: 'Consistent' // Simplified
    };

  } catch (error) {
    console.error('Analyze learning patterns error:', error);
    return null;
  }
};

module.exports = exports;
