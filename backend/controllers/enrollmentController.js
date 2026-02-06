const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Enroll user in course
// @route   POST /api/enrollments
// @access  Private/Admin or Self-enrollment
exports.enrollUser = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'User is already enrolled in this course'
      });
    }

    // Check enrollment settings
    if (!course.enrollmentSettings.isPublic && req.user.role === 'learner') {
      return res.status(403).json({
        success: false,
        message: 'This course is not open for enrollment'
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      enrolledBy: req.user.id,
      status: course.enrollmentSettings.requireApproval ? 'pending' : 'active'
    });

    // Create progress tracking
    await Progress.create({
      user: userId,
      enrollment: enrollment._id,
      course: courseId
    });

    // Update course stats
    course.stats.totalEnrollments += 1;
    await course.save();

    // Send notification
    await createNotification({
      recipient: userId,
      type: 'enrollment',
      title: 'Course Enrollment',
      message: `You have been enrolled in ${course.title}`,
      relatedEntity: {
        entityType: 'course',
        entityId: courseId
      },
      actionUrl: `/courses/${courseId}`,
      actionText: 'View Course',
      channels: {
        inApp: true,
        email: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment successful',
      data: { enrollment }
    });

  } catch (error) {
    console.error('Enroll user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling user',
      error: error.message
    });
  }
};

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private
exports.getAllEnrollments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      courseId,
      status
    } = req.query;

    const filter = {};

    if (userId) filter.user = userId;
    if (courseId) filter.course = courseId;
    if (status) filter.status = status;

    // If learner, show only their enrollments
    if (req.user.role === 'learner') {
      filter.user = req.user.id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const enrollments = await Enrollment.find(filter)
      .populate('user', 'firstName lastName email avatar')
      .populate('course', 'title thumbnail category level')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Enrollment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        enrollments,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: error.message
    });
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'firstName lastName email avatar')
      .populate({
        path: 'course',
        populate: {
          path: 'modules',
          populate: { path: 'lessons' }
        }
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check permission
    if (req.user.role === 'learner' && enrollment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this enrollment'
      });
    }

    res.status(200).json({
      success: true,
      data: { enrollment }
    });

  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollment',
      error: error.message
    });
  }
};

// @desc    Update enrollment status
// @route   PUT /api/enrollments/:id/status
// @access  Private/Admin
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    enrollment.status = status;
    await enrollment.save();

    // Send notification
    await createNotification({
      recipient: enrollment.user,
      type: 'enrollment',
      title: 'Enrollment Status Update',
      message: `Your enrollment status has been updated to ${status}`,
      relatedEntity: {
        entityType: 'enrollment',
        entityId: enrollment._id
      }
    });

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated',
      data: { enrollment }
    });

  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating enrollment status',
      error: error.message
    });
  }
};

// @desc    Get user's course progress
// @route   GET /api/enrollments/:id/progress
// @access  Private
exports.getEnrollmentProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id)
      .populate({
        path: 'progress.completedLessons.lesson',
        select: 'title contentType'
      })
      .populate({
        path: 'progress.completedModules.module',
        select: 'title'
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check permission
    if (req.user.role === 'learner' && enrollment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this progress'
      });
    }

    // Get detailed progress
    const progress = await Progress.findOne({
      enrollment: id
    }).populate('lessonProgress.lesson', 'title');

    res.status(200).json({
      success: true,
      data: {
        enrollment: enrollment.progress,
        detailedProgress: progress
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Unenroll user from course
// @route   DELETE /api/enrollments/:id
// @access  Private/Admin or Self
exports.unenrollUser = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check permission
    if (req.user.role === 'learner' && enrollment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unenroll this user'
      });
    }

    // Update status to dropped instead of deleting
    enrollment.status = 'dropped';
    await enrollment.save();

    // Update course stats
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { 'stats.totalEnrollments': -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
    });

  } catch (error) {
    console.error('Unenroll user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unenrolling user',
      error: error.message
    });
  }
};

// @desc    Bulk enroll users
// @route   POST /api/enrollments/bulk
// @access  Private/Admin
exports.bulkEnroll = async (req, res) => {
  try {
    const { userIds, courseId } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const userId of userIds) {
      try {
        // Check if already enrolled
        const existing = await Enrollment.findOne({
          user: userId,
          course: courseId
        });

        if (existing) {
          results.failed.push({ userId, reason: 'Already enrolled' });
          continue;
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
          user: userId,
          course: courseId,
          enrolledBy: req.user.id,
          status: 'active'
        });

        // Create progress
        await Progress.create({
          user: userId,
          enrollment: enrollment._id,
          course: courseId
        });

        // Send notification
        await createNotification({
          recipient: userId,
          type: 'enrollment',
          title: 'Course Enrollment',
          message: `You have been enrolled in ${course.title}`,
          relatedEntity: {
            entityType: 'course',
            entityId: courseId
          }
        });

        results.successful.push(userId);

      } catch (error) {
        results.failed.push({ userId, reason: error.message });
      }
    }

    // Update course stats
    course.stats.totalEnrollments += results.successful.length;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Bulk enrollment completed',
      data: results
    });

  } catch (error) {
    console.error('Bulk enroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk enrollment',
      error: error.message
    });
  }
};

module.exports = exports;
