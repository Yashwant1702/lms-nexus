const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate certificate PDF
exports.generateCertificatePDF = async (certificate) => {
  try {
    return new Promise((resolve, reject) => {
      // Create uploads/certificates directory if not exists
      const uploadsDir = path.join(__dirname, '../uploads/certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `certificate-${certificate.certificateNumber}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Pipe to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add border
      doc.lineWidth(10)
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke('#667eea');

      doc.lineWidth(2)
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke('#764ba2');

      // Add logo placeholder (you can add actual logo here)
      doc.fontSize(30)
        .fillColor('#667eea')
        .text('🎓', doc.page.width / 2 - 15, 80, { width: 30, align: 'center' });

      // Organization name
      doc.fontSize(20)
        .fillColor('#333')
        .text(certificate.organizationName, 0, 130, { align: 'center' });

      // Certificate title
      doc.fontSize(40)
        .fillColor('#667eea')
        .text('Certificate of Completion', 0, 180, { align: 'center' });

      // Decorative line
      doc.moveTo(doc.page.width / 2 - 100, 240)
        .lineTo(doc.page.width / 2 + 100, 240)
        .lineWidth(2)
        .stroke('#764ba2');

      // This certifies that
      doc.fontSize(14)
        .fillColor('#666')
        .text('This is to certify that', 0, 260, { align: 'center' });

      // Recipient name
      doc.fontSize(32)
        .fillColor('#333')
        .font('Helvetica-Bold')
        .text(certificate.recipientName, 0, 290, { align: 'center' });

      // Has successfully completed
      doc.fontSize(14)
        .fillColor('#666')
        .font('Helvetica')
        .text('has successfully completed the course', 0, 340, { align: 'center' });

      // Course title
      doc.fontSize(24)
        .fillColor('#667eea')
        .font('Helvetica-Bold')
        .text(certificate.courseTitle, 0, 370, { align: 'center', width: doc.page.width });

      // Grade and completion date
      doc.fontSize(12)
        .fillColor('#666')
        .font('Helvetica')
        .text(`Grade: ${certificate.grade} | Completed on: ${new Date(certificate.completionDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`, 0, 420, { align: 'center' });

      // Metadata
      if (certificate.metadata && certificate.metadata.duration) {
        doc.fontSize(10)
          .fillColor('#999')
          .text(`Duration: ${certificate.metadata.duration}`, 0, 445, { align: 'center' });
      }

      // Signatures section
      const signatureY = doc.page.height - 160;

      // Trainer signature
      doc.fontSize(12)
        .fillColor('#333')
        .text('_________________________', doc.page.width / 4 - 80, signatureY, { width: 160, align: 'center' });
      
      doc.fontSize(10)
        .fillColor('#666')
        .text(certificate.trainerName, doc.page.width / 4 - 80, signatureY + 25, { width: 160, align: 'center' });
      
      doc.fontSize(9)
        .fillColor('#999')
        .text('Instructor', doc.page.width / 4 - 80, signatureY + 40, { width: 160, align: 'center' });

      // Issue date
      doc.fontSize(12)
        .fillColor('#333')
        .text('_________________________', (doc.page.width / 4) * 3 - 80, signatureY, { width: 160, align: 'center' });
      
      doc.fontSize(10)
        .fillColor('#666')
        .text(new Date(certificate.issueDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }), (doc.page.width / 4) * 3 - 80, signatureY + 25, { width: 160, align: 'center' });
      
      doc.fontSize(9)
        .fillColor('#999')
        .text('Issue Date', (doc.page.width / 4) * 3 - 80, signatureY + 40, { width: 160, align: 'center' });

      // Certificate number at bottom
      doc.fontSize(8)
        .fillColor('#999')
        .text(`Certificate No: ${certificate.certificateNumber}`, 0, doc.page.height - 60, { align: 'center' });

      // Verification code
      doc.fontSize(8)
        .fillColor('#999')
        .text(`Verification Code: ${certificate.verificationCode}`, 0, doc.page.height - 45, { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        const pdfUrl = `/uploads/certificates/${fileName}`;
        resolve(pdfUrl);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });

  } catch (error) {
    console.error('Certificate PDF generation error:', error);
    throw new Error(`Failed to generate certificate PDF: ${error.message}`);
  }
};

// Verify certificate by code
exports.verifyCertificate = async (verificationCode) => {
  try {
    const Certificate = require('../models/Certificate');
    
    const certificate = await Certificate.findOne({
      verificationCode: verificationCode.toUpperCase(),
      isValid: true
    })
      .populate('user', 'firstName lastName')
      .populate('course', 'title')
      .populate('organization', 'name');

    if (!certificate) {
      return {
        valid: false,
        message: 'Certificate not found or has been revoked'
      };
    }

    return {
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        recipientName: certificate.recipientName,
        courseTitle: certificate.courseTitle,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        organizationName: certificate.organizationName,
        grade: certificate.grade
      }
    };

  } catch (error) {
    console.error('Certificate verification error:', error);
    throw error;
  }
};

module.exports = exports;
