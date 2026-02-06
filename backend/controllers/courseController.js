const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Trainer/Admin
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      duration,
      requirements,
      learningObjectives,
      tags,
      enrollmentSettings
    } = req.body;

    const course = await Course.create({
      title,
      description,
      shortDescription,
      category,
      level,
      duration,
      requirements,
      learningObjectives,
      tags,
      enrollmentSettings,
      trainer: req.user.id,
      organization: req.user.organization,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public/Private
exports.getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      level = '',
      status = 'published',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (level) filter.level = level;

    // If user is logged in and is trainer/admin, show their courses
    if (req.user) {
      if (req.user.role === 'trainer') {
        filter.trainer = req.user.id;
      } else if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        // Show all courses from their organization
        if (status) filter.status = status;
      } else {
        // Learners only see published courses
        filter.status = 'published';
      }
    } else {
      // Public access - only published courses
      filter.status = 'published';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const courses = await Course.find(filter)
      .populate('trainer', 'firstName lastName avatar')
      .populate('organization', 'name logo')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ [sortBy]: sortOrder });

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public/Private
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('trainer', 'firstName lastName avatar email')
      .populate('organization', 'name logo')
      .populate({
        path: 'modules',
        options: { sort: { order: 1 } },
        populate: {
          path: 'lessons',
          options: { sort: { order: 1 } }
        }
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled (if logged in)
    let isEnrolled = false;
    let enrollment = null;

    if (req.user) {
      enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: course._id
      });
      isEnrolled = !!enrollment;
    }

    res.status(200).json({
      success: true,
      data: {
        course,
        isEnrolled,
        enrollment
      }
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Trainer/Admin
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findById(id);

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
        message: 'Not authorized to update this course'
      });
    }

    // Update course
    Object.assign(course, updates);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Trainer/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

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
        message: 'Not authorized to delete this course'
      });
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: id });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments. Archive it instead.'
      });
    }

    // Delete related modules and lessons
    await Module.deleteMany({ course: id });
    await Lesson.deleteMany({ course: id });

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private/Trainer/Admin
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published', 'draft', 'archived'

    const course = await Course.findById(id);

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
        message: 'Not authorized to modify this course'
      });
    }

    // Validate course has content before publishing
    if (status === 'published') {
      const moduleCount = await Module.countDocuments({ course: id });
      if (moduleCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish course without modules'
        });
      }
    }

    course.status = status;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${status} successfully`,
      data: { course }
    });

  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course status',
      error: error.message
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/courses/:id/stats
// @access  Private/Trainer/Admin
exports.getCourseStats = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollments
    const enrollments = await Enrollment.find({ course: id });
    const completedEnrollments = enrollments.filter(e => e.status === 'completed');

    // Calculate completion rate
    const completionRate = enrollments.length > 0
      ? Math.round((completedEnrollments.length / enrollments.length) * 100)
      : 0;

    // Calculate average progress
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress.percentageComplete, 0) / enrollments.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEnrollments: enrollments.length,
          activeEnrollments: enrollments.filter(e => e.status === 'active').length,
          completedEnrollments: completedEnrollments.length,
          completionRate,
          averageProgress: Math.round(avgProgress),
          totalModules: course.modules.length
        }
      }
    });

  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course statistics',
      error: error.message
    });
  }
};

module.exports = exports;
