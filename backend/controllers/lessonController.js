const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Create lesson
// @route   POST /api/modules/:moduleId/lessons
// @access  Private/Trainer/Admin
exports.createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, contentType, content, duration, isPreview, resources } = req.body;

    // Check if module exists
    const module = await Module.findById(moduleId).populate('course');
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && module.course.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this module'
      });
    }

    // Get lesson count for order
    const lessonCount = await Lesson.countDocuments({ module: moduleId });

    const lesson = await Lesson.create({
      title,
      description,
      module: moduleId,
      course: module.course._id,
      order: lessonCount,
      contentType,
      content,
      duration,
      isPreview,
      resources
    });

    // Add lesson to module
    module.lessons.push(lesson._id);
    await module.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: { lesson }
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lesson',
      error: error.message
    });
  }
};

// @desc    Get all lessons for a module
// @route   GET /api/modules/:moduleId/lessons
// @access  Public/Private
exports.getLessonsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const lessons = await Lesson.find({ module: moduleId })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { lessons }
    });

  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons',
      error: error.message
    });
  }
};

// @desc    Get lesson by ID
// @route   GET /api/lessons/:id
// @access  Private
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('module', 'title')
      .populate('course', 'title');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if user is enrolled or if lesson is preview
    if (!lesson.isPreview) {
      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: lesson.course._id,
        status: { $in: ['active', 'completed'] }
      });

      if (!enrollment && req.user.role === 'learner') {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled to access this lesson'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { lesson }
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson',
      error: error.message
    });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private/Trainer/Admin
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lesson = await Lesson.findById(id)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && lesson.module.course.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this lesson'
      });
    }

    Object.assign(lesson, updates);
    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: { lesson }
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lesson',
      error: error.message
    });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Trainer/Admin
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id)
      .populate({
        path: 'module',
        populate: { path: 'course' }
      });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && lesson.module.course.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson'
      });
    }

    // Remove lesson from module
    await Module.findByIdAndUpdate(lesson.module._id, {
      $pull: { lessons: id }
    });

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lesson',
      error: error.message
    });
  }
};

// @desc    Mark lesson as complete
// @route   POST /api/lessons/:id/complete
// @access  Private/Learner
exports.markLessonComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSpent } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const Enrollment = require('../models/Enrollment');
    const Progress = require('../models/Progress');

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: lesson.course,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Update progress
    let progress = await Progress.findOne({
      user: req.user.id,
      course: lesson.course
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user.id,
        enrollment: enrollment._id,
        course: lesson.course
      });
    }

    // Mark lesson complete
    await progress.markLessonComplete(id);

    // Update lesson progress details
    const lessonProg = progress.lessonProgress.find(
      lp => lp.lesson.toString() === id.toString()
    );
    if (lessonProg && timeSpent) {
      lessonProg.timeSpent += timeSpent;
    }

    // Calculate overall progress
    await progress.calculateOverallProgress();

    // Update enrollment progress
    await enrollment.updateProgressPercentage();

    // Award points for completing lesson
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    user.points += 10; // 10 points per lesson
    await user.save();

    // Check for badges
    const { checkAndAwardBadges } = require('../services/gamificationService');
    await checkAndAwardBadges(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: {
        progress: progress.overallProgress,
        pointsEarned: 10
      }
    });

  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking lesson as complete',
      error: error.message
    });
  }
};

// @desc    Reorder lessons
// @route   PUT /api/modules/:moduleId/lessons/reorder
// @access  Private/Trainer/Admin
exports.reorderLessons = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { lessonIds } = req.body;

    const module = await Module.findById(moduleId).populate('course');
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check permission
    if (req.user.role === 'trainer' && module.course.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this module'
      });
    }

    // Update order for each lesson
    const updatePromises = lessonIds.map((lessonId, index) =>
      Lesson.findByIdAndUpdate(lessonId, { order: index })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Lessons reordered successfully'
    });

  } catch (error) {
    console.error('Reorder lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering lessons',
      error: error.message
    });
  }
};

module.exports = exports;
