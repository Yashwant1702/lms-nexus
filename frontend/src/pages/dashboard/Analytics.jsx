import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  Target,
  Calendar,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Loading,
  Badge,
  Progress,
} from '@components/common';
import { formatDuration, formatDate } from '@utils/helpers';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
      setAnalytics({
        overview: {
          totalTimeSpent: 2450,
          coursesEnrolled: 5,
          coursesCompleted: 2,
          averageScore: 85,
          currentStreak: 7,
          longestStreak: 15,
        },
        recentActivity: [
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            timeSpent: 45,
            lessonsCompleted: 3,
          },
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            timeSpent: 60,
            lessonsCompleted: 4,
          },
        ],
        courseProgress: [
          {
            course: 'React Mastery',
            progress: 75,
            timeSpent: 450,
            lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            course: 'JavaScript Deep Dive',
            progress: 100,
            timeSpent: 680,
            lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
        ],
      });
    }, 1000);
  }, []);

  if (isLoading) {
    return <Loading text="Loading analytics..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary-500" />
          Learning Analytics
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Track your progress
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Total Time"
          value={formatDuration(analytics.overview.totalTimeSpent)}
          color="blue"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Enrolled"
          value={analytics.overview.coursesEnrolled}
          color="purple"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Completed"
          value={analytics.overview.coursesCompleted}
          color="green"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Avg Score"
          value={`${analytics.overview.averageScore}%`}
          color="yellow"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Current Streak"
          value={`${analytics.overview.currentStreak} days`}
          color="red"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Longest Streak"
          value={`${analytics.overview.longestStreak} days`}
          color="teal"
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Course Progress
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {analytics.courseProgress.map((course, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {course.course}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last: {formatDate(course.lastAccessed, 'relative')}
                    </p>
                  </div>
                  <Badge variant={course.progress === 100 ? 'success' : 'primary'}>
                    {course.progress}%
                  </Badge>
                </div>
                <Progress value={course.progress} showLabel />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  };

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </Card>
  );
};

export default Analytics;
