const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Leaderboard = require('../models/Leaderboard');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;
    let stats = {};

    if (role === 'super_admin' || role === 'admin') {
      // Admin Dashboard Stats
      stats = await getAdminDashboardStats(req.user);
    } else if (role === 'trainer') {
      // Trainer Dashboard Stats
      stats = await getTrainerDashboardStats(req.user);
    } else if (role === 'learner') {
      // Learner Dashboard Stats
      stats = await getLearnerDashboardStats(req.user);
    }

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Admin Dashboard Stats
async function getAdminDashboardStats(user) {
  const filter = user.role === 'admin' ? { organization: user.organization } : {};

  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalCertificates,
    activeUsers,
    publishedCourses,
    recentEnrollments,
    topCourses
  ] = await Promise.all([
    User.countDocuments(filter),
    Course.countDocuments({ ...filter, status: { $ne: 'archived' } }),
    Enrollment.countDocuments(filter),
    Certificate.countDocuments({ ...filter, isValid: true }),
    User.countDocuments({ ...filter, isActive: true }),
    Course.countDocuments({ ...filter, status: 'published' }),
    Enrollment.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .populate('course', 'title'),
    Course.find({ ...filter, status: 'published' })
      .sort({ 'stats.totalEnrollments': -1 })
      .limit(5)
      .select('title stats.totalEnrollments stats.completionRate')
  ]);

  // Enrollment trends (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const enrollmentTrends = await Enrollment.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        ...filter
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Completion rate
  const completedEnrollments = await Enrollment.countDocuments({
    ...filter,
    status: 'completed'
  });
  const completionRate = totalEnrollments > 0 
    ? Math.round((completedEnrollments / totalEnrollments) * 100) 
    : 0;

  return {
    overview: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      activeUsers,
      publishedCourses,
      completionRate
    },
    recentEnrollments,
    topCourses,
    enrollmentTrends
  };
}

// Trainer Dashboard Stats
async function getTrainerDashboardStats(user) {
  const courses = await Course.find({ trainer: user.id });
  const courseIds = courses.map(c => c._id);

  const [
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalStudents,
    recentEnrollments,
    coursePerformance
  ] = await Promise.all([
    Course.countDocuments({ trainer: user.id }),
    Course.countDocuments({ trainer: user.id, status: 'published' }),
    Enrollment.countDocuments({ course: { $in: courseIds } }),
    Enrollment.distinct('user', { course: { $in: courseIds } }).then(users => users.length),
    Enrollment.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName avatar')
      .populate('course', 'title'),
    Course.find({ trainer: user.id, status: 'published' })
      .select('title stats')
  ]);

  return {
    overview: {
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalStudents
    },
    recentEnrollments,
    coursePerformance
  };
}

// Learner Dashboard Stats
async function getLearnerDashboardStats(user) {
  const [
    enrollments,
    certificates,
    progress,
    leaderboard,
    recentActivity
  ] = await Promise.all([
    Enrollment.find({ user: user.id })
      .populate('course', 'title thumbnail category'),
    Certificate.countDocuments({ user: user.id, isValid: true }),
    Enrollment.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progress.percentageComplete' }
        }
      }
    ]),
    Leaderboard.findOne({ user: user.id }),
    Progress.find({ user: user.id })
      .sort({ lastActivityAt: -1 })
      .limit(5)
      .populate('course', 'title thumbnail')
  ]);

  const userInfo = await User.findById(user.id);

  const activeCourses = enrollments.filter(e => e.status === 'active').length;
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const avgProgress = progress.length > 0 ? Math.round(progress[0].avgProgress) : 0;

  return {
    overview: {
      totalEnrollments: enrollments.length,
      activeCourses,
      completedCourses,
      certificates,
      points: userInfo.points,
      level: userInfo.level,
      currentStreak: userInfo.streak.current,
      avgProgress
    },
    enrollments: enrollments.slice(0, 6),
    leaderboard: leaderboard ? {
      rank: leaderboard.allTime.rank,
      points: leaderboard.allTime.points
    } : null,
    recentActivity
  };
}

// @desc    Get course analytics
// @route   GET /api/analytics/courses/:courseId
// @access  Private/Trainer/Admin
exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && course.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this course'
      });
    }

    const [
      enrollments,
      completionStats,
      assessmentStats,
      progressDistribution,
      enrollmentTrends
    ] = await Promise.all([
      Enrollment.find({ course: courseId })
        .populate('user', 'firstName lastName email'),
      
      Enrollment.aggregate([
        { $match: { course: course._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      AssessmentAttempt.aggregate([
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessment',
            foreignField: '_id',
            as: 'assessmentData'
          }
        },
        {
          $match: {
            'assessmentData.course': course._id,
            status: 'evaluated'
          }
        },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score.percentage' },
            passRate: {
              $avg: { $cond: ['$passed', 1, 0] }
            }
          }
        }
      ]),

      Enrollment.aggregate([
        { $match: { course: course._id } },
        {
          $bucket: {
            groupBy: '$progress.percentageComplete',
            boundaries: [0, 25, 50, 75, 100],
            default: 'Other',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]),

      Enrollment.aggregate([
        { $match: { course: course._id } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          stats: course.stats
        },
        enrollments: {
          total: enrollments.length,
          byStatus: completionStats
        },
        assessments: assessmentStats[0] || { avgScore: 0, passRate: 0 },
        progressDistribution,
        enrollmentTrends
      }
    });

  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course analytics',
      error: error.message
    });
  }
};

// @desc    Get user learning analytics
// @route   GET /api/analytics/users/:userId
// @access  Private/Admin or Self
exports.getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permission
    if (req.user.role === 'learner' && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this user'
      });
    }

    const [
      user,
      enrollments,
      progress,
      assessmentAttempts,
      certificates,
      activityLog
    ] = await Promise.all([
      User.findById(userId).select('-password'),
      
      Enrollment.find({ user: userId })
        .populate('course', 'title category'),
      
      Progress.find({ user: userId })
        .populate('course', 'title'),
      
      AssessmentAttempt.find({ user: userId, status: 'evaluated' })
        .populate('assessment', 'title'),
      
      Certificate.find({ user: userId, isValid: true }),
      
      Progress.aggregate([
        { $match: { user: user._id } },
        { $unwind: '$activityLog' },
        { $sort: { 'activityLog.timestamp': -1 } },
        { $limit: 50 }
      ])
    ]);

    // Calculate statistics
    const totalTimeSpent = progress.reduce((sum, p) => 
      sum + p.timeTracking.totalTimeSpent, 0
    );

    const avgAssessmentScore = assessmentAttempts.length > 0
      ? assessmentAttempts.reduce((sum, a) => sum + a.score.percentage, 0) / assessmentAttempts.length
      : 0;

    const completionRate = enrollments.length > 0
      ? (enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100
      : 0;

    res.status(200).json({
      success: true,
      data: {
        user,
        statistics: {
          totalEnrollments: enrollments.length,
          completedCourses: enrollments.filter(e => e.status === 'completed').length,
          certificates: certificates.length,
          totalTimeSpent, // in minutes
          avgAssessmentScore: Math.round(avgAssessmentScore),
          completionRate: Math.round(completionRate)
        },
        enrollments,
        recentActivity: activityLog.slice(0, 20)
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};

// @desc    Export analytics report
// @route   GET /api/analytics/export
// @access  Private/Admin
exports.exportReport = async (req, res) => {
  try {
    const { type, format = 'json', startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    let data = {};

    switch (type) {
      case 'enrollments':
        data = await Enrollment.find(
          dateFilter.$ gte ? { createdAt: dateFilter } : {}
        )
          .populate('user', 'firstName lastName email')
          .populate('course', 'title category')
          .lean();
        break;

      case 'assessments':
        data = await AssessmentAttempt.find(
          dateFilter.$gte ? { submittedAt: dateFilter } : {}
        )
          .populate('user', 'firstName lastName email')
          .populate('assessment', 'title')
          .lean();
        break;

      case 'certificates':
        data = await Certificate.find(
          dateFilter.$gte ? { issueDate: dateFilter } : {}
        )
          .populate('user', 'firstName lastName email')
          .populate('course', 'title')
          .lean();
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    if (format === 'csv') {
      // Convert to CSV (simplified)
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting report',
      error: error.message
    });
  }
};

// Helper function to convert JSON to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => 
      typeof val === 'object' ? JSON.stringify(val) : val
    ).join(',')
  );

  return [headers, ...rows].join('\n');
}

module.exports = exports;
