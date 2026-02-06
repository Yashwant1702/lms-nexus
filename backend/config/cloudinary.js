const cloudinary = require('cloudinary').v2;

// Cloudinary configuration (optional, for cloud file storage)
exports.cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Initialize Cloudinary
exports.initCloudinary = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config(exports.cloudinaryConfig);
    console.log('✅ Cloudinary initialized');
    return true;
  }
  console.log('ℹ️  Cloudinary not configured (optional)');
  return false;
};

// Upload image to Cloudinary
exports.uploadToCloudinary = async (filePath, folder = 'lms-nexus') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

// Delete from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = exports;
