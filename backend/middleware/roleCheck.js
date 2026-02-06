// Check if user has required role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user is admin or owner of resource
exports.isAdminOrOwner = (getUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this resource'
      });
    }

    // Super admin and admin can access anything
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      return next();
    }

    // Extract user ID from request using provided function
    const resourceUserId = getUserId(req);

    // Check if user is owner
    if (req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

// Check if user belongs to same organization
exports.checkOrganization = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this resource'
      });
    }

    // Super admin can access all organizations
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if resource belongs to user's organization
    // This should be customized based on the resource
    const { organizationId } = req.params;

    if (organizationId && organizationId !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access resources from other organizations'
      });
    }

    next();

  } catch (error) {
    console.error('Organization check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking organization access',
      error: error.message
    });
  }
};

module.exports = exports;
