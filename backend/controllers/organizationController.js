const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private/SuperAdmin
exports.createOrganization = async (req, res) => {
  try {
    const {
      name,
      logo,
      branding,
      settings,
      subscription,
      contact
    } = req.body;

    const organization = await Organization.create({
      name,
      logo,
      branding,
      settings,
      subscription,
      contact
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization }
    });

  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating organization',
      error: error.message
    });
  }
};

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private/SuperAdmin
exports.getAllOrganizations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive
    } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const organizations = await Organization.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Organization.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        organizations,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations',
      error: error.message
    });
  }
};

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.organization.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this organization'
      });
    }

    // Get statistics
    const [userCount, courseCount] = await Promise.all([
      User.countDocuments({ organization: id }),
      require('../models/Course').countDocuments({ organization: id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        organization,
        statistics: {
          totalUsers: userCount,
          totalCourses: courseCount
        }
      }
    });

  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization',
      error: error.message
    });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Admin
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.organization.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this organization'
      });
    }

    // Super admin can update subscription, others cannot
    if (req.user.role !== 'super_admin') {
      delete updates.subscription;
    }

    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization }
    });

  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization',
      error: error.message
    });
  }
};

// @desc    Update organization branding
// @route   PUT /api/organizations/:id/branding
// @access  Private/Admin
exports.updateBranding = async (req, res) => {
  try {
    const { id } = req.params;
    const { primaryColor, secondaryColor, accentColor } = req.body;

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.organization.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update branding for this organization'
      });
    }

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (primaryColor) organization.branding.primaryColor = primaryColor;
    if (secondaryColor) organization.branding.secondaryColor = secondaryColor;
    if (accentColor) organization.branding.accentColor = accentColor;

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Branding updated successfully',
      data: { branding: organization.branding }
    });

  } catch (error) {
    console.error('Update branding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating branding',
      error: error.message
    });
  }
};

// @desc    Update organization settings
// @route   PUT /api/organizations/:id/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const settingsUpdates = req.body;

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.organization.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update settings for this organization'
      });
    }

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    Object.assign(organization.settings, settingsUpdates);
    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: organization.settings }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// @desc    Update subscription
// @route   PUT /api/organizations/:id/subscription
// @access  Private/SuperAdmin
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, maxUsers, maxCourses, validUntil } = req.body;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (plan) organization.subscription.plan = plan;
    if (maxUsers) organization.subscription.maxUsers = maxUsers;
    if (maxCourses) organization.subscription.maxCourses = maxCourses;
    if (validUntil) organization.subscription.validUntil = validUntil;

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: { subscription: organization.subscription }
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
};

// @desc    Activate/Deactivate organization
// @route   PUT /api/organizations/:id/status
// @access  Private/SuperAdmin
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Also update all users in this organization
    await User.updateMany(
      { organization: id },
      { isActive }
    );

    res.status(200).json({
      success: true,
      message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { organization }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization status',
      error: error.message
    });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/SuperAdmin
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByIdAndDelete(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Note: In production, you should handle cascade deletion
    // or prevent deletion if organization has active data

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });

  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting organization',
      error: error.message
    });
  }
};

// @desc    Get organization statistics
// @route   GET /api/organizations/:id/stats
// @access  Private/Admin
exports.getOrganizationStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permission
    if (req.user.role !== 'super_admin' && 
        req.user.organization.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view statistics for this organization'
      });
    }

    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    const Certificate = require('../models/Certificate');

    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      completedEnrollments,
      totalCertificates,
      usersByRole
    ] = await Promise.all([
      User.countDocuments({ organization: id }),
      User.countDocuments({ organization: id, isActive: true }),
      Course.countDocuments({ organization: id }),
      Course.countDocuments({ organization: id, status: 'published' }),
      Enrollment.countDocuments({ /* organization filter via course lookup */ }),
      Enrollment.countDocuments({ status: 'completed' }),
      Certificate.countDocuments({ organization: id, isValid: true }),
      User.aggregate([
        { $match: { organization: id } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: usersByRole
        },
        courses: {
          total: totalCourses,
          published: publishedCourses
        },
        enrollments: {
          total: totalEnrollments,
          completed: completedEnrollments,
          completionRate: totalEnrollments > 0 
            ? Math.round((completedEnrollments / totalEnrollments) * 100) 
            : 0
        },
        certificates: totalCertificates
      }
    });

  } catch (error) {
    console.error('Get organization stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization statistics',
      error: error.message
    });
  }
};

module.exports = exports;
