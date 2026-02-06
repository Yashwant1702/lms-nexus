/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
};

/**
 * Get password strength
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Too weak', color: 'red' };
  
  let score = 0;
  
  // Length
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  
  // Contains lowercase
  if (/[a-z]/.test(password)) score++;
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) score++;
  
  // Contains number
  if (/\d/.test(password)) score++;
  
  // Contains special character
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'Weak', color: 'red' };
  if (score <= 4) return { score, label: 'Medium', color: 'yellow' };
  return { score, label: 'Strong', color: 'green' };
};

/**
 * Validate URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  const regex = /^\+?[\d\s\-()]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate username
 */
export const isValidUsername = (username) => {
  // 3-30 characters, alphanumeric, underscore, dash
  const regex = /^[a-zA-Z0-9_-]{3,30}$/;
  return regex.test(username);
};

/**
 * Validate name
 */
export const isValidName = (name) => {
  // At least 2 characters, letters, spaces, hyphens, apostrophes
  const regex = /^[a-zA-Z\s\-']{2,50}$/;
  return regex.test(name);
};

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = (file, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.width <= maxWidth && img.height <= maxHeight);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate min length
 */
export const hasMinLength = (value, minLength) => {
  return value?.length >= minLength;
};

/**
 * Validate max length
 */
export const hasMaxLength = (value, maxLength) => {
  return value?.length <= maxLength;
};

/**
 * Validate number range
 */
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate positive number
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate integer
 */
export const isInteger = (value) => {
  return Number.isInteger(parseFloat(value));
};

/**
 * Validate date
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate future date
 */
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Validate past date
 */
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate, endDate) => {
  return new Date(startDate) < new Date(endDate);
};

/**
 * Validate credit card (basic)
 */
export const isValidCreditCard = (cardNumber) => {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if only digits
  if (!/^\d+$/.test(cleaned)) return false;
  
  // Check length
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validate JSON
 */
export const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate hex color
 */
export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Validate percentage
 */
export const isValidPercentage = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};
