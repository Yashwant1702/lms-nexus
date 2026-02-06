const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Leaderboard = require('../models/Leaderboard');
const Enrollment = require('../models/Enrollment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const { createNotification } = require('../services/notificationService');

// @desc    Get all badges
// @route   GET /api/gamification/badges
// @access  Private
exports.getAllBadges = async (req, res) => {
  try {
    const { category, rarity, isActive = true } = req.query;

    const filter = { 
      organization: req.user.organization,
      isActive
    };

    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;

    const badges = await Badge.find(filter)
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { badges }
    });

  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: error.message
    });
  }
};

// @desc    Get user badges
// @route   GET /api/gamification/users/:userId/badges
// @access  Private
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const userBadges = await UserBadge.find({ user: userId })
      .populate('badge')
      .sort({ earnedAt: -1 });

    const allBadges = await Badge.find({
      organization: req.user.organization,
      isActive: true
    });

    const earnedBadgeIds = userBadges.map(ub => ub.badge._id.toString());
    const availableBadges = allBadges.filter(b => 
      !earnedBadgeIds.includes(b._id.toString()) && !b.isHidden
    );

    res.status(200).json({
      success: true,
      data: {
        earnedBadges: userBadges,
        availableBadges,
        totalEarned: userBadges.length,
        totalAvailable: allBadges.length
      }
    });

  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user badges',
      error: error.message
    });
  }
};

// @desc    Create badge (Admin only)
// @route   POST /api/gamification/badges
// @access  Private/Admin
exports.createBadge = async (req, res) => {
  try {
    const {
      name,
      description,
      icon,
      color,
      category,
      criteria,
      rarity,
      pointsReward,
      isHidden
    } = req.body;

    const badge = await Badge.create({
      name,
      description,
      icon,
      color,
      category,
      criteria,
      rarity,
      pointsReward,
      organization: req.user.organization,
      isHidden
    });

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: { badge }
    });

  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating badge',
      error: error.message
    });
  }
};

// @desc    Award badge to user
// @route   POST /api/gamification/badges/:badgeId/award
// @access  Private/Admin
exports.awardBadge = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const { userId, relatedEntity } = req.body;

    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if user already has this badge
    const existing = await UserBadge.findOne({
      user: userId,
      badge: badgeId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Award badge
    const userBadge = await UserBadge.create({
      user: userId,
      badge: badgeId,
      relatedEntity,
      progress: {
        current: badge.criteria.targetValue,
        target: badge.criteria.targetValue
      }
    });

    // Update user points
    const user = await User.findById(userId);
    user.points += badge.pointsReward;
    user.badges.push(badgeId);
    await user.save();

    // Update badge stats
    badge.stats.totalAwarded += 1;
    await badge.save();

    // Send notification
    await createNotification({
      recipient: userId,
      type: 'achievement',
      title: '🎉 New Badge Earned!',
      message: `Congratulations! You've earned the "${badge.name}" badge!`,
      relatedEntity: {
        entityType: 'achievement',
        entityId: badgeId
      },
      priority: 'high',
      channels: {
        inApp: true,
        push: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Badge awarded successfully',
      data: { userBadge, pointsEarned: badge.pointsReward }
    });

  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error awarding badge',
      error: error.message
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const { 
      period = 'allTime', // allTime, monthly, weekly, daily
      limit = 50,
      page = 1 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortField;
    switch (period) {
      case 'daily':
        sortField = 'daily.points';
        break;
      case 'weekly':
        sortField = 'weekly.points';
        break;
      case 'monthly':
        sortField = 'monthly.points';
        break;
      default:
        sortField = 'allTime.points';
    }

    const leaderboard = await Leaderboard.find({
      organization: req.user.organization
    })
      .populate('user', 'firstName lastName avatar level')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get current user's position
    const userPosition = await Leaderboard.findOne({
      user: req.user.id,
      organization: req.user.organization
    });

    let userRank = null;
    if (userPosition) {
      const rank = await Leaderboard.countDocuments({
        organization: req.user.organization,
        [sortField]: { $gt: userPosition[period.replace('Time', '')].points }
      });
      userRank = {
        rank: rank + 1,
        points: userPosition[period.replace('Time', '')].points,
        ...userPosition.metrics
      };
    }

    const total = await Leaderboard.countDocuments({
      organization: req.user.organization
    });

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        userRank,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// @desc    Update user points (Manual)
// @route   POST /api/gamification/users/:userId/points
// @access  Private/Admin
exports.updateUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update points
    user.points += points;
    
    // Calculate new level (100 points per level)
    user.level = Math.floor(user.points / 100) + 1;
    
    await user.save();

    // Update leaderboard
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

    // Send notification if significant points
    if (Math.abs(points) >= 50) {
      await createNotification({
        recipient: userId,
        type: 'achievement',
        title: points > 0 ? '🎯 Points Earned!' : '⚠️ Points Deducted',
        message: `${Math.abs(points)} points ${points > 0 ? 'earned' : 'deducted'}${reason ? ': ' + reason : ''}`,
        priority: 'medium'
      });
    }

    // Check for level up
    const previousLevel = Math.floor((user.points - points) / 100) + 1;
    if (user.level > previousLevel) {
      await createNotification({
        recipient: userId,
        type: 'achievement',
        title: '⬆️ Level Up!',
        message: `Congratulations! You've reached Level ${user.level}!`,
        priority: 'high',
        channels: {
          inApp: true,
          push: true
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Points updated successfully',
      data: {
        newPoints: user.points,
        newLevel: user.level,
        pointsChanged: points
      }
    });

  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating points',
      error: error.message
    });
  }
};

// @desc    Get user gamification profile
// @route   GET /api/gamification/users/:userId/profile
// @access  Private
exports.getUserGamificationProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user, badges, leaderboard, recentActivity] = await Promise.all([
      User.findById(userId).select('firstName lastName avatar points level streak'),
      
      UserBadge.find({ user: userId })
        .populate('badge')
        .sort({ earnedAt: -1 })
        .limit(10),
      
      Leaderboard.findOne({ user: userId }),
      
      UserBadge.find({ user: userId })
        .populate('badge')
        .sort({ earnedAt: -1 })
        .limit(5)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate next level progress
    const pointsForCurrentLevel = (user.level - 1) * 100;
    const pointsForNextLevel = user.level * 100;
    const progressToNextLevel = ((user.points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.avatar,
          points: user.points,
          level: user.level,
          streak: user.streak,
          progressToNextLevel: Math.round(progressToNextLevel)
        },
        badges: {
          total: badges.length,
          recent: badges
        },
        leaderboard: leaderboard ? {
          allTimeRank: leaderboard.allTime.rank,
          allTimePoints: leaderboard.allTime.points,
          monthlyRank: leaderboard.monthly.rank,
          monthlyPoints: leaderboard.monthly.points
        } : null,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Get gamification profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gamification profile',
      error: error.message
    });
  }
};

// @desc    Get badge progress for user
// @route   GET /api/gamification/users/:userId/badge-progress
// @access  Private
exports.getBadgeProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all available badges
    const allBadges = await Badge.find({
      organization: user.organization,
      isActive: true
    });

    // Get user's earned badges
    const earnedBadges = await UserBadge.find({ user: userId });
    const earnedBadgeIds = earnedBadges.map(ub => ub.badge.toString());

    // Calculate progress for each badge
    const badgeProgress = await Promise.all(
      allBadges.map(async (badge) => {
        const isEarned = earnedBadgeIds.includes(badge._id.toString());

        if (isEarned) {
          return {
            badge,
            earned: true,
            progress: 100,
            current: badge.criteria.targetValue,
            target: badge.criteria.targetValue
          };
        }

        // Calculate progress based on criteria type
        let current = 0;
        const target = badge.criteria.targetValue;

        switch (badge.criteria.type) {
          case 'courses_completed_count':
            current = await Enrollment.countDocuments({
              user: userId,
              status: 'completed'
            });
            break;

          case 'total_points':
            current = user.points;
            break;

          case 'level_reached':
            current = user.level;
            break;

          case 'consecutive_days':
            current = user.streak.current;
            break;

          case 'assessment_score':
            const attempts = await AssessmentAttempt.find({
              user: userId,
              status: 'evaluated',
              passed: true
            });
            if (attempts.length > 0) {
              current = Math.max(...attempts.map(a => a.score.percentage));
            }
            break;

          default:
            current = 0;
        }

        const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

        return {
          badge,
          earned: false,
          progress: Math.round(progress),
          current,
          target,
          hidden: badge.isHidden
        };
      })
    );

    // Filter out hidden badges if not earned
    const visibleProgress = badgeProgress.filter(bp => !bp.hidden || bp.earned);

    res.status(200).json({
      success: true,
      data: {
        badgeProgress: visibleProgress,
        totalBadges: allBadges.length,
        earnedBadges: earnedBadges.length
      }
    });

  } catch (error) {
    console.error('Get badge progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badge progress',
      error: error.message
    });
  }
};

module.exports = exports;
