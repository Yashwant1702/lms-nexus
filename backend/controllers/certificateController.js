const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { generateCertificatePDF } = require('../services/certificateService');
const { createNotification } = require('../services/notificationService');

// @desc    Issue certificate
// @route   POST /api/certificates
// @access  Private/Admin/System
exports.issueCertificate = async (req, res) => {
  try {
    const { enrollmentId, finalScore, grade } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('user')
      .populate('course')
      .populate({
        path: 'course',
        populate: { path: 'trainer organization' }
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if already has certificate
    if (enrollment.certificateIssued) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this enrollment'
      });
    }

    // Verify course completion
    if (enrollment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Course must be completed before issuing certificate'
      });
    }

    const course = enrollment.course;
    const user = enrollment.user;

    // Create certificate
    const certificate = await Certificate.create({
      user: user._id,
      course: course._id,
      enrollment: enrollment._id,
      recipientName: user.fullName,
      courseTitle: course.title,
      completionDate: enrollment.completedAt || new Date(),
      finalScore: finalScore || enrollment.progress.percentageComplete,
      grade: grade || 'Pass',
      issuedBy: course.trainer._id,
      trainerName: `${course.trainer.firstName} ${course.trainer.lastName}`,
      organization: course.organization._id,
      organizationName: course.organization.name,
      organizationLogo: course.organization.logo,
      metadata: {
        duration: `${course.duration.hours}h ${course.duration.minutes}m`,
        modules: course.modules.length
      }
    });

    // Generate PDF
    try {
      const pdfUrl = await generateCertificatePDF(certificate);
      certificate.pdfUrl = pdfUrl;
      await certificate.save();
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Continue even if PDF generation fails
    }

    // Update enrollment
    enrollment.certificateIssued = true;
    enrollment.certificate = certificate._id;
    await enrollment.save();

    // Award points
    user.points += 100; // 100 points for certificate
    await user.save();

    // Send notification
    await createNotification({
      recipient: user._id,
      type: 'certificate_issued',
      title: 'Certificate Earned!',
      message: `Congratulations! You've earned a certificate for completing ${course.title}`,
      relatedEntity: {
        entityType: 'certificate',
        entityId: certificate._id
      },
      actionUrl: `/certificates/${certificate._id}`,
      actionText: 'View Certificate',
      channels: {
        inApp: true,
        email: true
      }
    });

    // Check for badges
    const { checkAndAwardBadges } = require('../services/gamificationService');
    await checkAndAwardBadges(user._id);

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: { certificate }
    });

  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error issuing certificate',
      error: error.message
    });
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private
exports.getAllCertificates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      courseId,
      isValid = true
    } = req.query;

    const filter = { isValid };

    if (userId) filter.user = userId;
    if (courseId) filter.course = courseId;

    // Learners can only see their own certificates
    if (req.user.role === 'learner') {
      filter.user = req.user.id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const certificates = await Certificate.find(filter)
      .populate('user', 'firstName lastName email avatar')
      .populate('course', 'title thumbnail category')
      .populate('organization', 'name logo')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ issueDate: -1 });

    const total = await Certificate.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        certificates,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message
    });
  }
};

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public (for verification)
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'firstName lastName email avatar')
      .populate('course', 'title description category level')
      .populate('organization', 'name logo')
      .populate('issuedBy', 'firstName lastName');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { certificate }
    });

  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message
    });
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:verificationCode
// @access  Public
exports.verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await Certificate.findOne({ 
      verificationCode: verificationCode.toUpperCase(),
      isValid: true 
    })
      .populate('user', 'firstName lastName')
      .populate('course', 'title')
      .populate('organization', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or revoked certificate'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate is valid',
      data: {
        certificateNumber: certificate.certificateNumber,
        recipientName: certificate.recipientName,
        courseTitle: certificate.courseTitle,
        issueDate: certificate.issueDate,
        organizationName: certificate.organizationName,
        grade: certificate.grade
      }
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error.message
    });
  }
};

// @desc    Revoke certificate
// @route   PUT /api/certificates/:id/revoke
// @access  Private/Admin
exports.revokeCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (!certificate.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is already revoked'
      });
    }

    await certificate.revoke(reason);

    // Send notification
    await createNotification({
      recipient: certificate.user,
      type: 'system',
      title: 'Certificate Revoked',
      message: `Your certificate for ${certificate.courseTitle} has been revoked. ${reason ? 'Reason: ' + reason : ''}`,
      priority: 'high',
      channels: {
        inApp: true,
        email: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      data: { certificate }
    });

  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking certificate',
      error: error.message
    });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Private
exports.downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check permission
    if (req.user.role === 'learner' && certificate.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    if (!certificate.pdfUrl) {
      // Generate PDF if not exists
      const pdfUrl = await generateCertificatePDF(certificate);
      certificate.pdfUrl = pdfUrl;
      await certificate.save();
    }

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: certificate.pdfUrl,
        fileName: `certificate-${certificate.certificateNumber}.pdf`
      }
    });

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
};

// @desc    Regenerate certificate PDF
// @route   POST /api/certificates/:id/regenerate
// @access  Private/Admin
exports.regenerateCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Generate new PDF
    const pdfUrl = await generateCertificatePDF(certificate);
    certificate.pdfUrl = pdfUrl;
    await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate regenerated successfully',
      data: { certificate }
    });

  } catch (error) {
    console.error('Regenerate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating certificate',
      error: error.message
    });
  }
};

module.exports = exports;
