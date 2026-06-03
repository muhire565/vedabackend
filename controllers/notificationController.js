const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail, sendWorkoutReminder, sendGoalAchievement, sendMealReminder } = require('../services/emailService');

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false, limit = 50 } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      data: { notification },
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await Notification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Helper function to create notification
const createNotification = async (userId, type, title, message, options = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      priority: options.priority || 'medium',
      actionUrl: options.actionUrl || '',
      metadata: options.metadata || {},
    });

    await notification.save();

    // Send email if enabled and user preferences allow it
    if (options.sendEmail !== false) {
      const user = await User.findById(userId).select('email fullName notificationPreferences');
      if (user && user.email) {
        // Check user notification preferences
        let shouldSendEmail = true;
        const prefs = user.notificationPreferences || {};
        
        switch (type) {
          case 'workout':
            shouldSendEmail = prefs.workoutReminders !== false;
            break;
          case 'meal':
            shouldSendEmail = prefs.mealReminders !== false;
            break;
          case 'achievement':
          case 'goal':
            shouldSendEmail = prefs.progressUpdates !== false;
            break;
          case 'system':
            // System notifications always sent (can be overridden by options)
            shouldSendEmail = true;
            break;
          default:
            shouldSendEmail = true;
        }

        if (!shouldSendEmail) {
          return notification; // Don't send email, but return notification
        }
        let emailResult = { success: false };
        
        switch (type) {
          case 'workout':
            emailResult = await sendWorkoutReminder(
              user.email,
              user.fullName || 'User',
              title,
              options.scheduledTime || 'Today'
            );
            break;
          case 'achievement':
          case 'goal':
            emailResult = await sendGoalAchievement(
              user.email,
              user.fullName || 'User',
              title
            );
            break;
          case 'meal':
            emailResult = await sendMealReminder(
              user.email,
              user.fullName || 'User',
              title,
              options.scheduledTime || 'Today'
            );
            break;
          default:
            // Generic email for other types
            emailResult = await sendEmail(
              user.email,
              title,
              `<p>${message}</p>`
            );
        }

        if (emailResult.success) {
          notification.emailSent = true;
          await notification.save();
        }
      }
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};

