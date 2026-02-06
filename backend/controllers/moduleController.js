const Module = require('../models/Module');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @desc    Create module
// @route   POST /api/courses/:courseId/modules
// @access  Private/Trainer/Admin
exports.createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, duration } = req.body;

    // Check if course exists
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
        message: 'Not authorized to modify this course'
      });
    }

    // Get module count for order
    const moduleCount = await Module.countDocuments({ course: courseId });

    const module = await Module.create({
      title,
      description,
      course: courseId,
      order: moduleCount,
      duration
    });

    // Add module to course
    course.modules.push(module._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: { module }
    });

  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating module',
      error: error.message
    });
  }
};

// @desc    Get all modules for a course
// @route   GET /api/courses/:courseId/modules
// @access  Public/Private
exports.getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const modules = await Module.find({ course: courseId })
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { modules }
    });

  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules',
      error: error.message
    });
  }
};

// @desc    Get module by ID
// @route   GET /api/modules/:id
// @access  Public/Private
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .populate('course', 'title');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { module }
    });

  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching module',
      error: error.message
    });
  }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private/Trainer/Admin
exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const module = await Module.findById(id).populate('course');

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

    Object.assign(module, updates);
    await module.save();

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: { module }
    });

  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating module',
      error: error.message
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private/Trainer/Admin
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Module.findById(id).populate('course');

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
        message: 'Not authorized to delete this module'
      });
    }

    // Delete all lessons in this module
    await Lesson.deleteMany({ module: id });

    // Remove module from course
    await Course.findByIdAndUpdate(module.course._id, {
      $pull: { modules: id }
    });

    await module.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting module',
      error: error.message
    });
  }
};

// @desc    Reorder modules
// @route   PUT /api/courses/:courseId/modules/reorder
// @access  Private/Trainer/Admin
exports.reorderModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body; // Array of module IDs in new order

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
        message: 'Not authorized to modify this course'
      });
    }

    // Update order for each module
    const updatePromises = moduleIds.map((moduleId, index) =>
      Module.findByIdAndUpdate(moduleId, { order: index })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Modules reordered successfully'
    });

  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering modules',
      error: error.message
    });
  }
};

module.exports = exports;
