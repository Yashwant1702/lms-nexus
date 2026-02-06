const validator = require('validator');

// Validate email
exports.isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate password strength
exports.isStrongPassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
};

// Validate MongoDB ObjectId
exports.isValidObjectId = (id) => {
  return validator.isMongoId(id);
};

// Validate URL
exports.isValidUrl = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

// Validate phone number
exports.isValidPhone = (phone) => {
  // Basic international phone validation
  const regex = /^\+?[\d\s\-()]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Validate date format
exports.isValidDate = (date) => {
  return validator.isISO8601(date);
};

// Validate username
exports.isValidUsername = (username) => {
  // 3-30 characters, alphanumeric, underscore, dash
  const regex = /^[a-zA-Z0-9_-]{3,30}$/;
  return regex.test(username);
};

// Validate course code
exports.isValidCourseCode = (code) => {
  // Format: ABC-123 or ABC123
  const regex = /^[A-Z]{2,5}-?\d{2,4}$/i;
  return regex.test(code);
};

// Validate assessment score
exports.isValidScore = (score, min = 0, max = 100) => {
  const num = parseFloat(score);
  return !isNaN(num) && num >= min && num <= max;
};

// Validate duration (in minutes)
exports.isValidDuration = (duration) => {
  const num = parseInt(duration);
  return !isNaN(num) && num > 0 && num <= 10080; // Max 1 week
};

// Validate file extension
exports.hasValidExtension = (filename, allowedExtensions) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(ext);
};

// Validate file size
exports.isValidFileSize = (size, maxSize) => {
  return size > 0 && size <= maxSize;
};

// Sanitize HTML content
exports.sanitizeHtml = (html) => {
  // Basic HTML sanitization (in production, use a library like DOMPurify)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Validate hex color
exports.isValidHexColor = (color) => {
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return regex.test(color);
};

// Validate JSON string
exports.isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Validate array with min/max length
exports.isValidArray = (arr, minLength = 0, maxLength = Infinity) => {
  return Array.isArray(arr) && arr.length >= minLength && arr.length <= maxLength;
};

// Validate percentage
exports.isValidPercentage = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

// Validate positive integer
exports.isPositiveInteger = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// Validate slug
exports.isValidSlug = (slug) => {
  const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return regex.test(slug);
};

// Validate organization name
exports.isValidOrganizationName = (name) => {
  // 3-100 characters, letters, numbers, spaces, basic punctuation
  const regex = /^[a-zA-Z0-9\s.,&'-]{3,100}$/;
  return regex.test(name);
};

// Validate grade (A+, A, B+, etc.)
exports.isValidGrade = (grade) => {
  const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
  return validGrades.includes(grade.toUpperCase());
};

// Validate time format (HH:MM)
exports.isValidTimeFormat = (time) => {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
};

// Validate IP address
exports.isValidIp = (ip) => {
  return validator.isIP(ip);
};

// Validate credit card (basic check)
exports.isValidCreditCard = (cardNumber) => {
  return validator.isCreditCard(cardNumber);
};

// Validate enrollment key
exports.isValidEnrollmentKey = (key) => {
  // 8-16 alphanumeric characters
  const regex = /^[A-Z0-9]{8,16}$/;
  return regex.test(key);
};

// Validate certificate number
exports.isValidCertificateNumber = (number) => {
  // Format: CERT-YYYY-XXXXXX
  const regex = /^CERT-\d{4}-[A-Z0-9]{6}$/;
  return regex.test(number);
};

// Custom validation: Check if value is in enum
exports.isInEnum = (value, enumArray) => {
  return enumArray.includes(value);
};

// Validate date range
exports.isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

module.exports = exports;
