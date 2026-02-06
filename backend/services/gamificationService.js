const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Leaderboard = require('../models/Leaderboard');
const Enrollment = require('../models/Enrollment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const { createNotification } = require('./notificationService');

// Check and award badges to user
exports.checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Get all active badges for organization
    const badges = await Badge.find({
      organization: user.organization,
      isActive: true
    });

    // Get user's current badges
    const userBadges = await UserBadge.find({ user: userId });
    const earnedBadgeIds = userBadges.map(ub => ub.badge.toString());

    for (const badge of badges) {
      // Skip if user already has this badge
      if (earnedBadgeIds.includes(badge._id.toString())) {
        continue;
      }

      // Check if user meets criteria
      const meetsRequirement = await exports.checkBadgeCriteria(userId, badge);

      if (meetsRequirement) {
        await exports.awardBadgeToUser(userId, badge._id);
      }
    }

  } catch (error) {
    console.error('Check and award badges error:', error);
  }
};

// Check if user meets badge criteria
exports.checkBadgeCriteria = async (userId, badge) => {
  try {
    const { type, targetValue, specificCourseId } = badge.criteria;

    switch (type) {
      case 'course_completion':
        if (specificCourseId) {
          const enrollment = await Enrollment.findOne({
            user: userId,
            course: specificCourseId,
            status: 'completed'
          });
          return !!enrollment;
        }
        return false;

      case 'courses_completed_count':
        const completedCount = await Enrollment.countDocuments({
          user: userId,
          status: 'completed'
        });
        return completedCount >= targetValue;

      case 'assessment_score':
        const attempts = await AssessmentAttempt.find({
          user: userId,
          status: 'evaluated',
          passed: true
        });
        
        if (attempts.length === 0) return false;
        
        const maxScore = Math.max(...attempts.map(a => a.score.percentage));
        return maxScore >= targetValue;

      case 'consecutive_days':
        const user = await User.findById(userId);
        return user.streak.current >= targetValue;

      case 'total_points':
        const userData = await User.findById(userId);
        return userData.points >= targetValue;

      case 'level_reached':
        const userLevel = await User.findById(userId);
        return userLevel.level >= targetValue;

      case 'perfect_score':
        const perfectAttempts = await AssessmentAttempt.find({
          user: userId,
          status: 'evaluated',
          'score.percentage': 100
        });
        return perfectAttempts.length >= targetValue;

      case 'modules_completed':
        const enrollments = await Enrollment.find({ user: userId });
        const totalModules = enrollments.reduce(
          (sum, e) => sum + e.progress.completedModules.length,
          0
        );
        return totalModules >= targetValue;

      default:
        return false;
    }

  } catch (error) {
    console.error('Check badge criteria error:', error);
    return false;
  }
};

// Award badge to user
exports.awardBadgeToUser = async (userId, badgeId, relatedEntity = null) => {
  try {
    const badge = await Badge.findById(badgeId);
    if (!badge) return null;

    // Check if already awarded
    const existing = await UserBadge.findOne({
      user: userId,
      badge: badgeId
    });

    if (existing) {
      return existing;
    }

    // Create user badge
    const userBadge = await UserBadge.create({
      user: userId,
      badge: badgeId,
      relatedEntity,
      progress: {
        current: badge.criteria.targetValue,
        target: badge.criteria.targetValue
      }
    });

    // Update user
    const user = await User.findById(userId);
    user.points += badge.pointsReward;
    user.badges.push(badgeId);
    await user.save();

    // Update badge stats
    badge.stats.totalAwarded += 1;
    await badge.save();

    // Update leaderboard
    await exports.updateUserLeaderboard(userId, badge.pointsReward);

    // Send notification
    await createNotification({
      recipient: userId,
      type: 'achievement',
      title: '🎉 New Badge Earned!',
      message: `Congratulations! You've earned the "${badge.name}" badge!`,
      priority: 'high',
      channels: {
        inApp: true,
        push: true
      }
    });

    return userBadge;

  } catch (error) {
    console.error('Award badge error:', error);
    return null;
  }
};

// Update user leaderboard
exports.updateUserLeaderboard = async (userId, points) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let leaderboard = await Leaderboard.findOne({
      user: userId,
      organization: user.organization
    });

    if (!leaderboard) {
      leaderboard = await Leaderboard.create({
        user: userId,
        organization: user.organization
      });
    }

    await leaderboard.addPoints(points);

    // Update ranks
    await exports.updateLeaderboardRanks(user.organization);

  } catch (error) {
    console.error('Update leaderboard error:', error);
  }
};

// Update leaderboard ranks
exports.updateLeaderboardRanks = async (organizationId) => {
  try {
    // Update all-time ranks
    const allTimeLeaderboard = await Leaderboard.find({ organization: organizationId })
      .sort({ 'allTime.points': -1 });

    for (let i = 0; i < allTimeLeaderboard.length; i++) {
      allTimeLeaderboard[i].allTime.rank = i + 1;
      await allTimeLeaderboard[i].save();
    }

    // Update monthly ranks
    const monthlyLeaderboard = await Leaderboard.find({ organization: organizationId })
      .sort({ 'monthly.points': -1 });

    for (let i = 0; i < monthlyLeaderboard.length; i++) {
      monthlyLeaderboard[i].monthly.rank = i + 1;
      await monthlyLeaderboard[i].save();
    }

    // Update weekly ranks
    const weeklyLeaderboard = await Leaderboard.find({ organization: organizationId })
      .sort({ 'weekly.points': -1 });

    for (let i = 0; i < weeklyLeaderboard.length; i++) {
      weeklyLeaderboard[i].weekly.rank = i + 1;
      await weeklyLeaderboard[i].save();
    }

  } catch (error) {
    console.error('Update leaderboard ranks error:', error);
  }
};

// Award points for activity
exports.awardPoints = async (userId, points, activity) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Add points
    user.points += points;

    // Calculate level (100 points per level)
    const newLevel = Math.floor(user.points / 100) + 1;
    const previousLevel = user.level;

    user.level = newLevel;
    await user.save();

    // Update leaderboard
    await exports.updateUserLeaderboard(userId, points);

    // Check if level changed
    if (newLevel > previousLevel) {
      await createNotification({
        recipient: userId,
        type: 'achievement',
        title: '⬆️ Level Up!',
        message: `Congratulations! You've reached Level ${newLevel}!`,
        priority: 'high',
        channels: {
          inApp: true,
          push: true
        }
      });
    }

    // Check for new badges
    await exports.checkAndAwardBadges(userId);

    return {
      pointsEarned: points,
      totalPoints: user.points,
      level: newLevel,
      leveledUp: newLevel > previousLevel
    };

  } catch (error) {
    console.error('Award points error:', error);
    return null;
  }
};

// Reset periodic leaderboards
exports.resetPeriodicLeaderboards = async (period) => {
  try {
    const updateField = {};

    if (period === 'daily') {
      updateField['daily.points'] = 0;
      updateField['daily.date'] = new Date();
    } else if (period === 'weekly') {
      updateField['weekly.points'] = 0;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      updateField['weekly.weekStart'] = weekStart;
    } else if (period === 'monthly') {
      updateField['monthly.points'] = 0;
      updateField['monthly.monthStart'] = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }

    await Leaderboard.updateMany({}, { $set: updateField });

    console.log(`✅ Reset ${period} leaderboards`);

  } catch (error) {
    console.error('Reset periodic leaderboards error:', error);
  }
};

module.exports = exports;
