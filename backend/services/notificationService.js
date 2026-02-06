const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');

// Create notification
exports.createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);

    // Send email if enabled
    if (notification.channels.email && !notification.emailSent) {
      await exports.sendEmailNotification(notification);
    }

    // Emit real-time notification via Socket.io
    // This will be handled in server.js
    const io = global.io;
    if (io) {
      io.to(notification.recipient.toString()).emit('notification', notification);
    }

    return notification;

  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Send email notification
exports.sendEmailNotification = async (notification) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(notification.recipient);

    if (!user || !user.preferences.emailNotifications) {
      return;
    }

    let emailSubject = notification.title;
    let emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .notification { background: #f9f9f9; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px; }
          .priority-high { border-left-color: #ef4444; }
          .priority-urgent { border-left-color: #dc2626; background: #fee; }
          .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="notification ${notification.priority === 'high' ? 'priority-high' : ''} ${notification.priority === 'urgent' ? 'priority-urgent' : ''}">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.actionUrl ? `<a href="${process.env.CORS_ORIGIN}${notification.actionUrl}" class="button">${notification.actionText || 'View Details'}</a>` : ''}
          </div>
          <div class="footer">
            <p>This is an automated notification from LMS Nexus.</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml
    });

    // Mark email as sent
    notification.emailSent = true;
    notification.emailSentAt = new Date();
    await notification.save();

  } catch (error) {
    console.error('Send email notification error:', error);
    // Don't throw error, just log it
  }
};

// Process scheduled notifications
exports.processScheduledNotifications = async () => {
  try {
    const now = new Date();

    const scheduledNotifications = await Notification.find({
      scheduledFor: { $lte: now },
      'channels.inApp': true,
      isRead: false
    });

    for (const notification of scheduledNotifications) {
      // Send email if enabled
      if (notification.channels.email && !notification.emailSent) {
        await exports.sendEmailNotification(notification);
      }

      // Emit via Socket.io
      const io = global.io;
      if (io) {
        io.to(notification.recipient.toString()).emit('notification', notification);
      }
    }

    console.log(`Processed ${scheduledNotifications.length} scheduled notifications`);

  } catch (error) {
    console.error('Process scheduled notifications error:', error);
  }
};

// Clean up expired notifications
exports.cleanupExpiredNotifications = async () => {
  try {
    const now = new Date();

    const result = await Notification.deleteMany({
      expiresAt: { $lt: now }
    });

    console.log(`Cleaned up ${result.deletedCount} expired notifications`);

  } catch (error) {
    console.error('Cleanup expired notifications error:', error);
  }
};

// Send bulk notifications
exports.sendBulkNotifications = async (recipients, notificationData) => {
  try {
    const notifications = recipients.map(recipient => ({
      ...notificationData,
      recipient
    }));

    const results = await Promise.allSettled(
      notifications.map(data => exports.createNotification(data))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      total: recipients.length,
      successful,
      failed
    };

  } catch (error) {
    console.error('Send bulk notifications error:', error);
    throw error;
  }
};

module.exports = exports;
