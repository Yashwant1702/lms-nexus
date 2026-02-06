const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');

// Calculate course completion rate
exports.calculateCourseCompletionRate = async (courseId) => {
  try {
    const totalEnrollments = await Enrollment.countDocuments({ course: courseId });
    const completedEnrollments = await Enrollment.countDocuments({
      course: courseId,
      status: 'completed'
    });

    if (totalEnrollments === 0) return 0;

    return Math.round((completedEnrollments / totalEnrollments) * 100);

  } catch (error) {
    console.error('Calculate completion rate error:', error);
    return 0;
  }
};

// Get course engagement metrics
exports.getCourseEngagementMetrics = async (courseId) => {
  try {
    const enrollments = await Enrollment.find({ course: courseId });

    if (enrollments.length === 0) {
      return {
        avgProgress: 0,
        avgTimeSpent: 0,
        activeStudents: 0,
        completionRate: 0
      };
    }

    // Calculate average progress
    const avgProgress = enrollments.reduce((sum, e) => 
      sum + e.progress.percentageComplete, 0
    ) / enrollments.length;

    // Get progress data for time spent
    const progressData = await Progress.find({
      course: courseId,
      user: { $in: enrollments.map(e => e.user) }
    });

    const avgTimeSpent = progressData.length > 0
      ? progressData.reduce((sum, p) => sum + p.timeTracking.totalTimeSpent, 0) / progressData.length
      : 0;

    // Active students (accessed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeStudents = enrollments.filter(e => 
      e.progress.lastAccessedAt && e.progress.lastAccessedAt >= sevenDaysAgo
    ).length;

    const completionRate = await exports.calculateCourseCompletionRate(courseId);

    return {
      avgProgress: Math.round(avgProgress),
      avgTimeSpent: Math.round(avgTimeSpent),
      activeStudents,
      completionRate,
      totalEnrollments: enrollments.length
    };

  } catch (error) {
    console.error('Get engagement metrics error:', error);
    return null;
  }
};

// Get assessment analytics
exports.getAssessmentAnalytics = async (assessmentId) => {
  try {
    const attempts = await AssessmentAttempt.find({
      assessment: assessmentId,
      status: 'evaluated'
    });

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        avgScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = attempts.map(a => a.score.percentage);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const passedCount = attempts.filter(a => a.passed).length;
    const passRate = (passedCount / attempts.length) * 100;

    return {
      totalAttempts: attempts.length,
      avgScore: Math.round(avgScore),
      passRate: Math.round(passRate),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      medianScore: exports.calculateMedian(scores)
    };

  } catch (error) {
    console.error('Get assessment analytics error:', error);
    return null;
  }
};

// Calculate median
exports.calculateMedian = (values) => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
};

// Get user performance analytics
exports.getUserPerformanceAnalytics = async (userId) => {
  try {
    const [enrollments, attempts, certificates, progress] = await Promise.all([
      Enrollment.find({ user: userId }),
      AssessmentAttempt.find({ user: userId, status: 'evaluated' }),
      Certificate.countDocuments({ user: userId, isValid: true }),
      Progress.find({ user: userId })
    ]);

    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress.percentageComplete, 0) / enrollments.length
      : 0;

    const avgAssessmentScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.score.percentage, 0) / attempts.length
      : 0;

    const totalTimeSpent = progress.reduce((sum, p) => 
      sum + p.timeTracking.totalTimeSpent, 0
    );

    const assessmentsPassed = attempts.filter(a => a.passed).length;

    return {
      totalEnrollments: enrollments.length,
      completedCourses,
      avgProgress: Math.round(avgProgress),
      avgAssessmentScore: Math.round(avgAssessmentScore),
      totalTimeSpent, // in minutes
      certificates,
      assessmentsTaken: attempts.length,
      assessmentsPassed,
      passRate: attempts.length > 0 
        ? Math.round((assessmentsPassed / attempts.length) * 100) 
        : 0
    };

  } catch (error) {
    console.error('Get user performance analytics error:', error);
    return null;
  }
};

// Get organization-wide statistics
exports.getOrganizationStats = async (organizationId) => {
  try {
    const [users, courses, enrollments, certificates] = await Promise.all([
      User.find({ organization: organizationId }),
      Course.find({ organization: organizationId }),
      Enrollment.find({ /* Will need to join with course */ }),
      Certificate.countDocuments({ organization: organizationId, isValid: true })
    ]);

    const activeUsers = users.filter(u => u.isActive).length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;

    // Calculate overall completion rate
    const courseIds = courses.map(c => c._id);
    const orgEnrollments = await Enrollment.find({
      course: { $in: courseIds }
    });

    const completedEnrollments = orgEnrollments.filter(e => e.status === 'completed').length;
    const completionRate = orgEnrollments.length > 0
      ? Math.round((completedEnrollments / orgEnrollments.length) * 100)
      : 0;

    return {
      totalUsers: users.length,
      activeUsers,
      totalCourses: courses.length,
      publishedCourses,
      totalEnrollments: orgEnrollments.length,
      completedEnrollments,
      completionRate,
      certificates
    };

  } catch (error) {
    console.error('Get organization stats error:', error);
    return null;
  }
};

// Get enrollment trends
exports.getEnrollmentTrends = async (organizationId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const courses = await Course.find({ organization: organizationId });
    const courseIds = courses.map(c => c._id);

    const enrollments = await Enrollment.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    return enrollments.map(e => ({
      date: e._id.date,
      enrollments: e.count
    }));

  } catch (error) {
    console.error('Get enrollment trends error:', error);
    return [];
  }
};

// Get popular courses
exports.getPopularCourses = async (organizationId, limit = 10) => {
  try {
    const courses = await Course.find({
      organization: organizationId,
      status: 'published'
    })
      .sort({ 'stats.totalEnrollments': -1 })
      .limit(limit)
      .select('title stats thumbnail category');

    return courses;

  } catch (error) {
    console.error('Get popular courses error:', error);
    return [];
  }
};

// Get completion time analytics
exports.getCompletionTimeAnalytics = async (courseId) => {
  try {
    const completedEnrollments = await Enrollment.find({
      course: courseId,
      status: 'completed',
      completedAt: { $exists: true }
    });

    if (completedEnrollments.length === 0) {
      return {
        avgDays: 0,
        medianDays: 0,
        fastestDays: 0,
        slowestDays: 0
      };
    }

    const completionTimes = completedEnrollments.map(e => {
      const days = Math.floor(
        (e.completedAt - e.createdAt) / (1000 * 60 * 60 * 24)
      );
      return days;
    });

    const avgDays = completionTimes.reduce((sum, d) => sum + d, 0) / completionTimes.length;

    return {
      avgDays: Math.round(avgDays),
      medianDays: Math.round(exports.calculateMedian(completionTimes)),
      fastestDays: Math.min(...completionTimes),
      slowestDays: Math.max(...completionTimes),
      totalCompletions: completedEnrollments.length
    };

  } catch (error) {
    console.error('Get completion time analytics error:', error);
    return null;
  }
};

// Get learning activity heatmap data
exports.getLearningActivityHeatmap = async (userId, days = 90) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const progress = await Progress.find({
      user: userId,
      lastActivityAt: { $gte: startDate }
    });

    const activityMap = {};

    progress.forEach(p => {
      p.activityLog.forEach(log => {
        if (log.timestamp >= startDate) {
          const date = log.timestamp.toISOString().split('T')[0];
          activityMap[date] = (activityMap[date] || 0) + 1;
        }
      });
    });

    return Object.entries(activityMap).map(([date, count]) => ({
      date,
      activities: count
    }));

  } catch (error) {
    console.error('Get activity heatmap error:', error);
    return [];
  }
};

// Get course category distribution
exports.getCategoryDistribution = async (organizationId) => {
  try {
    const courses = await Course.find({
      organization: organizationId,
      status: 'published'
    });

    const distribution = {};

    courses.forEach(course => {
      const category = course.category;
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / courses.length) * 100)
    }));

  } catch (error) {
    console.error('Get category distribution error:', error);
    return [];
  }
};

// Export analytics report data
exports.prepareExportData = async (type, filters) => {
  try {
    let data = [];

    switch (type) {
      case 'enrollments':
        data = await Enrollment.find(filters)
          .populate('user', 'firstName lastName email')
          .populate('course', 'title category')
          .lean();
        break;

      case 'assessments':
        data = await AssessmentAttempt.find(filters)
          .populate('user', 'firstName lastName email')
          .populate('assessment', 'title')
          .lean();
        break;

      case 'certificates':
        data = await Certificate.find(filters)
          .populate('user', 'firstName lastName email')
          .populate('course', 'title')
          .lean();
        break;

      case 'users':
        data = await User.find(filters)
          .select('-password')
          .populate('organization', 'name')
          .lean();
        break;

      default:
        throw new Error('Invalid export type');
    }

    return data;

  } catch (error) {
    console.error('Prepare export data error:', error);
    throw error;
  }
};

module.exports = exports;
