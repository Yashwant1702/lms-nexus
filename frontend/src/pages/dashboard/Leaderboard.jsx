import React, { useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Trophy, Medal, Crown, Zap, Target, Award } from 'lucide-react';
import {
  Card,
  Loading,
  Badge,
  Avatar,
  Tabs,
} from '@components/common';
import { formatNumber } from '@utils/helpers';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch leaderboard from API
    setTimeout(() => {
      setIsLoading(false);
      setLeaderboard([
        {
          _id: '1',
          user: { firstName: 'Alice', lastName: 'Johnson', avatarUrl: null },
          totalPoints: 15420,
          coursesCompleted: 12,
          badges: 24,
          rank: 1,
        },
        {
          _id: '2',
          user: { firstName: 'Bob', lastName: 'Smith', avatarUrl: null },
          totalPoints: 14850,
          coursesCompleted: 11,
          badges: 22,
          rank: 2,
        },
        {
          _id: '3',
          user: { firstName: 'Carol', lastName: 'Williams', avatarUrl: null },
          totalPoints: 13920,
          coursesCompleted: 10,
          badges: 19,
          rank: 3,
        },
        {
          _id: user?._id,
          user: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            avatarUrl: user?.avatarUrl,
          },
          totalPoints: user?.gamification?.totalPoints || 1250,
          coursesCompleted: 3,
          badges: 5,
          rank: 15,
        },
      ]);
    }, 1000);
  }, [user]);

  const userRank = leaderboard.find((entry) => entry._id === user?._id);

  const tabs = [
    {
      label: 'All Time',
      content: <LeaderboardList leaderboard={leaderboard} currentUserId={user?._id} />,
    },
    {
      label: 'This Month',
      content: <LeaderboardList leaderboard={leaderboard} currentUserId={user?._id} />,
    },
    {
      label: 'This Week',
      content: <LeaderboardList leaderboard={leaderboard} currentUserId={user?._id} />,
    },
  ];

  if (isLoading) {
    return <Loading text="Loading leaderboard..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Compete with fellow learners
        </p>
      </div>

      {userRank && (
        <Card className="bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-900/20 dark:to-teal-900/20 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={userRank.user.avatarUrl}
                  name={`${userRank.user.firstName} ${userRank.user.lastName}`}
                  size="xl"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-charcoal-800">
                  #{userRank.rank}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Rank</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userRank.user.firstName} {userRank.user.lastName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatNumber(userRank.totalPoints)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {userRank.coursesCompleted}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {userRank.badges}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Badges</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
};

const LeaderboardList = ({ leaderboard, currentUserId }) => {
  return (
    <div className="space-y-2">
      {leaderboard.map((entry) => (
        <LeaderboardEntry
          key={entry._id}
          entry={entry}
          isCurrentUser={entry._id === currentUserId}
        />
      ))}
    </div>
  );
};

const LeaderboardEntry = ({ entry, isCurrentUser }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-500 dark:text-gray-400 font-semibold">#{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    if (rank === 3) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return '';
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        isCurrentUser
          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
          : getRankBg(entry.rank) || 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 flex items-center justify-center">
            {getRankIcon(entry.rank)}
          </div>
          <Avatar
            src={entry.user.avatarUrl}
            name={`${entry.user.firstName} ${entry.user.lastName}`}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {entry.user.firstName} {entry.user.lastName}
              </p>
              {isCurrentUser && <Badge variant="primary" size="sm">You</Badge>}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {formatNumber(entry.totalPoints)} pts
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {entry.coursesCompleted} courses
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                {entry.badges} badges
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatNumber(entry.totalPoints)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
