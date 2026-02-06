const User = require('../models/User');
const Organization = require('../models/Organization');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      isActive = '',
      organization = ''
    } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (isActive !== '') filter.isActive = isActive === 'true';
    if (organization) filter.organization = organization;

    // If user is admin (not super_admin), filter by their organization
    if (req.user.role === 'admin') {
      filter.organization = req.user.organization;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .populate('organization', 'name logo')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('organization', 'name logo branding')
      .populate('badges', 'name icon color rarity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.role !== 'admin' && 
        req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.role !== 'admin' && 
        req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.role; // Role changes should use separate endpoint
    delete updates.points;
    delete updates.level;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['super_admin', 'admin', 'trainer', 'learner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Only super_admin can assign super_admin role
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign super_admin role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Activate/Deactivate user
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // TODO: Clean up related data (enrollments, progress, etc.)
    // This should be done in a background job

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/:id/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.role !== 'admin' && 
        req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar if exists
    const user = await User.findById(id);
    if (user && user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Update user
    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/:id/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { theme, emailNotifications, pushNotifications, language } = req.body;

    // Check permission
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update preferences for this user'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (theme) user.preferences.theme = theme;
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) user.preferences.pushNotifications = pushNotifications;
    if (language) user.preferences.language = language;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const Enrollment = require('../models/Enrollment');
    const Certificate = require('../models/Certificate');
    const UserBadge = require('../models/UserBadge');

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get enrollments
    const enrollments = await Enrollment.find({ user: id });
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const activeCourses = enrollments.filter(e => e.status === 'active').length;

    // Get certificates
    const certificates = await Certificate.countDocuments({ user: id, isValid: true });

    // Get badges
    const badges = await UserBadge.countDocuments({ user: id });

    // Calculate average progress
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress.percentageComplete, 0) / enrollments.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEnrollments: enrollments.length,
          activeCourses,
          completedCourses,
          certificates,
          badges,
          averageProgress: Math.round(avgProgress),
          points: user.points,
          level: user.level,
          currentStreak: user.streak.current,
          longestStreak: user.streak.longest
        }
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

module.exports = exports;
