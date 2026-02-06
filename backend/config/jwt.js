const jwt = require('jsonwebtoken');

// JWT Configuration
exports.jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  algorithm: 'HS256',
  issuer: 'lms-nexus',
  audience: 'lms-nexus-users'
};

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    exports.jwtConfig.secret,
    {
      expiresIn: exports.jwtConfig.expiresIn,
      issuer: exports.jwtConfig.issuer,
      audience: exports.jwtConfig.audience
    }
  );
};

// Generate refresh token
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    exports.jwtConfig.secret,
    {
      expiresIn: exports.jwtConfig.refreshExpiresIn,
      issuer: exports.jwtConfig.issuer,
      audience: exports.jwtConfig.audience
    }
  );
};

// Verify token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, exports.jwtConfig.secret, {
      issuer: exports.jwtConfig.issuer,
      audience: exports.jwtConfig.audience
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Decode token without verification (for debugging)
exports.decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

// Generate password reset token
exports.generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: 'password-reset' },
    exports.jwtConfig.secret,
    {
      expiresIn: '1h', // Reset tokens expire in 1 hour
      issuer: exports.jwtConfig.issuer
    }
  );
};

// Generate email verification token
exports.generateVerificationToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: 'email-verification' },
    exports.jwtConfig.secret,
    {
      expiresIn: '24h', // Verification tokens expire in 24 hours
      issuer: exports.jwtConfig.issuer
    }
  );
};

// Generate API key token (for external integrations)
exports.generateApiKeyToken = (organizationId, permissions = []) => {
  return jwt.sign(
    {
      organizationId,
      permissions,
      type: 'api-key'
    },
    exports.jwtConfig.secret,
    {
      expiresIn: '365d', // API keys expire in 1 year
      issuer: exports.jwtConfig.issuer
    }
  );
};

// Verify refresh token
exports.verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, exports.jwtConfig.secret, {
      issuer: exports.jwtConfig.issuer,
      audience: exports.jwtConfig.audience
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Check if token is expired
exports.isTokenExpired = (token) => {
  try {
    const decoded = exports.decodeToken(token);
    if (!decoded || !decoded.payload || !decoded.payload.exp) {
      return true;
    }
    return decoded.payload.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

// Get token expiry time
exports.getTokenExpiryTime = (token) => {
  try {
    const decoded = exports.decodeToken(token);
    if (decoded && decoded.payload && decoded.payload.exp) {
      return new Date(decoded.payload.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Refresh access token
exports.refreshAccessToken = (refreshToken) => {
  try {
    const decoded = exports.verifyRefreshToken(refreshToken);
    return exports.generateToken(decoded.id);
  } catch (error) {
    throw new Error('Unable to refresh token: ' + error.message);
  }
};

module.exports = exports;
