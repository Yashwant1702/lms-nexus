import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useCourses } from '@hooks/useCourses';
import {
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Loading,
  Badge,
  Progress,
  Button,
} from '@components/common';

const Dashboard = () => {
  const { user } = useAuth();
  const { enrollments, fetchEnrollments, isLoading } = useCourses(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Calculate stats
  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter((e) => e.status === 'completed').length,
    inProgress: enrollments.filter((e) => e.status === 'active').length,
    totalPoints: user?.gamification?.totalPoints || 0,
  };

  const recentCourses = enrollments
    .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
    .slice(0, 3);

  if (isLoading) {
    return <Loading text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening with your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Enrolled Courses"
          value={stats.enrolled}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completed"
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="In Progress"
          value={stats.inProgress}
          color="yellow"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Total Points"
          value={stats.totalPoints}
          color="purple"
        />
      </div>

      {/* Continue Learning */}
      {recentCourses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Continue Learning
              </h2>
              <Link to="/dashboard/courses">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentCourses.map((enrollment) => (
                <CourseProgressItem
                  key={enrollment._id}
                  enrollment={enrollment}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quick Actions
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionCard
              to="/courses"
              icon={<BookOpen className="w-5 h-5" />}
              title="Browse Courses"
              description="Explore new learning opportunities"
            />
            <QuickActionCard
              to="/dashboard/assessments"
              icon={<CheckCircle className="w-5 h-5" />}
              title="Take Assessment"
              description="Test your knowledge"
            />
            <QuickActionCard
              to="/dashboard/certificates"
              icon={<Award className="w-5 h-5" />}
              title="View Certificates"
              description="See your achievements"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </Card>
  );
};

const CourseProgressItem = ({ enrollment }) => {
  const course = enrollment.course;
  const progress = enrollment.progress?.percentageComplete || 0;

  return (
    <Link
      to={`/courses/${course._id}`}
      className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
    >
      <div className="flex items-start gap-4">
        <img
          src={course.thumbnail || '/placeholder-course.jpg'}
          alt={course.title}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {course.instructor?.firstName} {course.instructor?.lastName}
          </p>
          <div className="mt-2">
            <Progress value={progress} size="sm" showLabel />
          </div>
        </div>
      </div>
    </Link>
  );
};

const QuickActionCard = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  </Link>
);

export default Dashboard;
