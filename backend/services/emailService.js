const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    subject: 'Welcome to LMS Nexus!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to LMS Nexus!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            <p>Welcome to LMS Nexus - Your gateway to personalized learning!</p>
            <p>We're excited to have you on board. Your account has been successfully created.</p>
            <p><strong>Your login email:</strong> ${data.email}</p>
            <p>Get started by exploring our course catalog and enrolling in courses that match your interests.</p>
            <a href="${data.loginUrl}" class="button">Login to Your Account</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy Learning!</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 LMS Nexus. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  'reset-password': (data) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            <p>You recently requested to reset your password for your LMS Nexus account.</p>
            <p>Click the button below to reset your password. This link will expire in ${data.expiryTime}.</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <p>For security reasons, this link can only be used once and will expire soon.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 LMS Nexus. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  'password-changed': (data) => ({
    subject: 'Password Successfully Changed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            <div class="success">
              <p><strong>Your password has been successfully changed.</strong></p>
            </div>
            <p>If you made this change, you can safely ignore this email.</p>
            <p>If you did NOT make this change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 LMS Nexus. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  'course-enrollment': (data) => ({
    subject: `You're Enrolled in ${data.courseTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .course-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Enrollment Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            <p>Great news! You've been successfully enrolled in:</p>
            <div class="course-card">
              <h3>${data.courseTitle}</h3>
              <p>${data.courseDescription}</p>
              <p><strong>Start Date:</strong> ${data.startDate}</p>
            </div>
            <p>Ready to begin your learning journey?</p>
            <a href="${data.courseUrl}" class="button">Start Learning</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 LMS Nexus. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  'certificate-issued': (data) => ({
    subject: `🏆 Certificate Earned: ${data.courseTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .certificate-card { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #f59e0b; text-align: center; }
          .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Congratulations!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            <p>We're thrilled to inform you that you've earned your certificate!</p>
            <div class="certificate-card">
              <h2>Certificate of Completion</h2>
              <h3>${data.courseTitle}</h3>
              <p><strong>Certificate Number:</strong> ${data.certificateNumber}</p>
              <p><strong>Issue Date:</strong> ${data.issueDate}</p>
              <p><strong>Grade:</strong> ${data.grade}</p>
            </div>
            <p>You can download your certificate and share it with your network!</p>
            <a href="${data.certificateUrl}" class="button">Download Certificate</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 LMS Nexus. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
exports.sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailContent = {};

    // Use template if provided
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
      subject = emailContent.subject;
      html = emailContent.html;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'LMS Nexus <noreply@lmsnexus.com>',
      to,
      subject: subject || emailContent.subject,
      html: html || emailContent.html,
      text: text || undefined
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send bulk emails
exports.sendBulkEmails = async (emails) => {
  try {
    const results = await Promise.allSettled(
      emails.map(email => exports.sendEmail(email))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      total: emails.length,
      successful,
      failed,
      results
    };

  } catch (error) {
    console.error('Bulk email error:', error);
    throw error;
  }
};

// Verify email configuration
exports.verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

module.exports = exports;
